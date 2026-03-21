#!/usr/bin/env python3
"""
Sync images from https://github.com/KuramaSyu/GoToHell-Backgrounds to Openinary.

The folder structure of the repo is preserved as the upload path.
Remote state is read from Openinary's storage API so no local state file is needed.

Usage:
    OPENINARY_API_KEY=<key> python sync_to_openinary.py --url http://localhost:3001
    python sync_to_openinary.py --url http://localhost:3001 --api-key-file /run/secrets/openinary_api_key
    cat /run/secrets/openinary_api_key | python sync_to_openinary.py --url http://localhost:3001 --api-key-stdin
    python sync_to_openinary.py --url http://localhost:3001 --api-key <key> --force
    python sync_to_openinary.py --url http://localhost:3001 --dry-run
    python sync_to_openinary.py --url http://localhost:3001 --concurrency 8
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Awaitable, Callable, Literal, Optional
from urllib.parse import quote

import aiohttp

ModuleName = Literal["git", "upload", "sync", "auth", "state", "delete", "main"]


class AppLogger:
    def __init__(self, module: ModuleName) -> None:
        self._logger = logging.getLogger(module)

        
    def debug(self, message: str, *args: object) -> None:
        self._logger.debug(message, *args)

    def info(self, message: str, *args: object) -> None:
        self._logger.info(message, *args)

    def error(self, message: str, *args: object) -> None:
        self._logger.error(message, *args)

    def exception(self, message: str, *args: object) -> None:
        self._logger.exception(message, *args)


log_git = AppLogger("git")
log_upload = AppLogger("upload")
log_sync = AppLogger("sync")
log_auth = AppLogger("auth")
log_state = AppLogger("state")
log_delete = AppLogger("delete")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_URL = "https://github.com/KuramaSyu/GoToHell-Backgrounds"
REPO_DIR = Path(__file__).parent / "in" / "GoToHell-Backgrounds"

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".avif", ".bmp", ".tiff", ".tif", ".svg",
}

MIME_MAP = {
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".gif":  "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".bmp":  "image/bmp",
    ".tiff": "image/tiff",
    ".tif":  "image/tiff",
    ".svg":  "image/svg+xml",
}


def build_clone_url(repo_url: str, repo_token: str | None) -> str:
    """Inject a token into https clone URL for private repositories."""
    if not repo_token:
        return repo_url

    prefix = "https://"
    if repo_url.startswith(prefix):
        token_encoded = quote(repo_token, safe="")
        return f"{prefix}x-access-token:{token_encoded}@{repo_url[len(prefix):]}"
    return repo_url


def build_remote_filename(img_path: Path) -> str:
    """
    renames directories like 'Hollow_Knight' -> 'HollowKnight'
    but preserves the file name and relative path

    This is done, because openinary seems to fail (404, probably a bug) when accessing files in a directory
    with '_' in its name
    """
    parts = list(img_path.relative_to(REPO_DIR).parts)

    # Rename known directory segments while preserving the file name.
    new_parts = []
    for part in parts[:-1]:  # all but the last part (file name)
        if "_" in part:
            # set next letter to uppercase and remove the underscore
            new_part = "".join(
                word.capitalize() for word in part.split("_")
            )
            new_parts.append(new_part)
        else:
            new_parts.append(part)
    new_parts.append(parts[-1])  # add the file name unchanged

    return "/".join(new_parts)


def resolve_api_key(
    api_key: str | None,
    api_key_file: Path | None,
    api_key_stdin: bool,
) -> str | None:
    """
    Resolve API key from one configured source, then OPENINARY_API_KEY fallback.
    """
    explicit_sources = int(bool(api_key)) + int(bool(api_key_file)) + int(api_key_stdin)
    if explicit_sources > 1:
        raise SystemExit(
            "Use only one of --api-key, --api-key-file, or --api-key-stdin."
        )

    if api_key:
        value = api_key.strip()
        if not value:
            raise SystemExit("--api-key was provided but is empty")
        return value

    if api_key_file is not None:
        key_path = api_key_file.expanduser().resolve()
        if not key_path.is_file():
            raise SystemExit(f"api key file not found: {key_path}")
        value = key_path.read_text(encoding="utf-8").strip()
        if not value:
            raise SystemExit(f"api key file is empty: {key_path}")
        return value

    if api_key_stdin:
        value = sys.stdin.read().strip()
        if not value:
            raise SystemExit("--api-key-stdin was set but stdin is empty")
        return value

    value = os.environ.get("OPENINARY_API_KEY", "").strip()
    return value or None

# ---------------------------------------------------------------------------
# Openinary storage discovery helpers
# ---------------------------------------------------------------------------

def discover_remote_paths_from_tree(tree_data: list[dict]) -> set[str]:
    """Build a set of remote file paths from Openinary /api/storage response."""
    remote_paths: set[str] = set()

    def walk(nodes: list[dict], prefix: str) -> None:
        for node in nodes:
            name = str(node.get("name", "")).strip()
            if not name:
                continue

            children = node.get("children")
            if isinstance(children, list):
                if children:
                    walk(children, f"{prefix}{name}/")
                else:
                    # Some APIs may represent empty folders OR file leaves with empty children.
                    # Treat image-like leaves as files so wipe/prune can still work.
                    if Path(name).suffix.lower() in IMAGE_EXTENSIONS:
                        remote_paths.add(f"{prefix}{name}")
            else:
                # Leaf node (file)
                remote_paths.add(f"{prefix}{name}")

    walk(tree_data, "")
    return remote_paths


async def fetch_storage_tree(
    session: aiohttp.ClientSession,
    openinary_url: str,
    api_key: str,
) -> list[dict]:
    endpoint = f"{openinary_url}/api/storage"
    try:
        async with session.get(
            endpoint,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=aiohttp.ClientTimeout(total=30),
            allow_redirects=False,
        ) as resp:
            raw = await resp.read()
            if resp.status in {301, 302, 307, 308}:
                location = resp.headers.get("Location", "")
                raise SystemExit(
                    f"storage API redirected ({resp.status}) to {location!r}. "
                    "This usually means auth failed or endpoint is not proxied correctly."
                )

            if resp.status != 200:
                snippet = raw[:300]
                raise SystemExit(
                    f"storage API failed: HTTP {resp.status}. Response: {snippet}"
                )

            try:
                payload = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise SystemExit(
                    f"storage API returned non-JSON data. Response starts with: {raw[:300]}"
                ) from exc

            if not isinstance(payload, list):
                raise SystemExit(
                    f"unexpected storage API response shape: {type(payload).__name__}"
                )

            return payload
    except aiohttp.ClientError as exc:
        raise SystemExit(f"failed to call Openinary storage API: {exc}") from exc

@dataclass(slots=True)
class SyncOptions:
    sync: bool
    ignore_underscore_files: bool
    force: bool
    prune_remote: bool
    wipe_remote: bool
    dry_run: bool
    concurrency: int


@dataclass(slots=True)
class SyncState:
    remote_files: set[str] = field(default_factory=set)
    repo_images: list[Path] = field(default_factory=list)
    repo_files: set[str] = field(default_factory=set)
    to_delete: list[str] = field(default_factory=list)
    to_upload: list[tuple[Path, str]] = field(default_factory=list)
    skipped: int = 0
    uploaded: int = 0
    failed: int = 0
    deleted: int = 0
    delete_failed: int = 0


class GitCloneService:
    def __init__(
        self,
        repo_url: str,
        repo_dir: Path,
        logger: AppLogger,
        run_git: Optional[Callable[..., Awaitable[str]]] = None,
    ) -> None:
        self._repo_url = repo_url
        self._repo_dir = repo_dir
        self._logger = logger
        self._run_git = run_git or self._default_run_git

    async def _default_run_git(self, *args: str) -> str:
        proc = await asyncio.create_subprocess_exec(
            "git",
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(stderr.decode().strip())
        return stdout.decode().strip()

    async def clone_or_pull(self) -> None:
        if self._repo_dir.exists():
            self._logger.info("Pulling latest changes in %s ...", self._repo_dir)
            await self._run_git("-C", str(self._repo_dir), "fetch", "--depth=1", "origin")
            msg = await self._run_git("-C", str(self._repo_dir), "reset", "--hard", "origin/HEAD")
            self._logger.info("%s", msg or "Up to date.")
            return

        self._logger.info("Cloning %s ...", self._repo_url)
        self._repo_dir.parent.mkdir(parents=True, exist_ok=True)
        await self._run_git("clone", "--depth=1", self._repo_url, str(self._repo_dir))
        self._logger.info("Clone complete.")


class RepositoryImageScanner:
    def __init__(
        self,
        repo_dir: Path,
        image_extensions: set[str],
        logger: AppLogger,
        remote_path_builder: Callable[[Path], str],
        ignore_underscore_files: bool,
    ) -> None:
        self._repo_dir = repo_dir
        self._image_extensions = image_extensions
        self._logger = logger
        self._remote_path_builder = remote_path_builder
        self._ignore_underscore_files = ignore_underscore_files

    def discover_images(self) -> list[Path]:
        images = sorted(
            p
            for p in self._repo_dir.rglob("*")
            if p.is_file()
            and p.suffix.lower() in self._image_extensions
            and ".git" not in p.relative_to(self._repo_dir).parts
            and "tools" not in p.relative_to(self._repo_dir).parts
            and "original" not in p.relative_to(self._repo_dir).parts
            and not (self._ignore_underscore_files and p.name.startswith("_"))  # ignore all _*.iamges if flag is set
        )
        if not images:
            self._logger.info("No images found in the repo - nothing to sync.")
            self._logger.debug("Current working directory: %s", os.getcwd())
        return images

    def build_remote_set(self, images: list[Path]) -> set[str]:
        return {self._remote_path_builder(path) for path in images}


class OpeninaryClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        upload_logger: AppLogger,
        delete_logger: AppLogger,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._upload_logger = upload_logger
        self._delete_logger = delete_logger

    async def fetch_remote_files(self, session: aiohttp.ClientSession) -> set[str]:
        tree_data = await fetch_storage_tree(session, self._base_url, self._api_key)
        return discover_remote_paths_from_tree(tree_data)

    async def upload(
        self,
        session: aiohttp.ClientSession,
        local_path: Path,
        remote_filename: str,
    ) -> Optional[str]:
        mime = MIME_MAP.get(local_path.suffix.lower(), "application/octet-stream")
        boundary = "----OpeninaryBoundary" + os.urandom(8).hex()
        file_bytes = local_path.read_bytes()
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="files"; filename="{remote_filename}"\r\n'
            f"Content-Type: {mime}\r\n"
            f"\r\n"
        ).encode() + file_bytes + f"\r\n--{boundary}--\r\n".encode()

        try:
            async with session.post(
                f"{self._base_url}/api/upload",
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": f"multipart/form-data; boundary={boundary}",
                },
                data=body,
                timeout=aiohttp.ClientTimeout(total=120),
                allow_redirects=False,
            ) as resp:
                raw = await resp.read()
                if resp.status != 200:
                    self._upload_logger.error("%s: HTTP %s - %s", remote_filename, resp.status, raw[:300])
                    return None
                try:
                    payload = json.loads(raw)
                except json.JSONDecodeError:
                    self._upload_logger.error("%s: invalid JSON response - %s", remote_filename, raw)
                    return None
                if not payload.get("success"):
                    self._upload_logger.error("%s: API failure - %s", remote_filename, payload)
                    return None
                file_infos = payload.get("files", [])
                if not file_infos:
                    self._upload_logger.error("%s: empty files list", remote_filename)
                    return None
                return file_infos[0].get("url", "")
        except (aiohttp.ClientError, OSError) as exc:
            self._upload_logger.error("%s: %s", remote_filename, exc)
            return None

    async def delete(self, session: aiohttp.ClientSession, remote_filename: str) -> bool:
        encoded = quote(remote_filename, safe="")
        attempts = [
            ("DELETE", f"{self._base_url}/api/storage/{encoded}", None, None),
            ("DELETE", f"{self._base_url}/api/storage", {"path": remote_filename}, None),
            ("DELETE", f"{self._base_url}/api/storage", None, {"path": remote_filename}),
            ("POST", f"{self._base_url}/api/storage/delete", None, {"path": remote_filename}),
        ]

        for method, endpoint, params, json_payload in attempts:
            try:
                async with session.request(
                    method,
                    endpoint,
                    headers={"Authorization": f"Bearer {self._api_key}"},
                    params=params,
                    json=json_payload,
                    timeout=aiohttp.ClientTimeout(total=60),
                    allow_redirects=False,
                ) as resp:
                    raw = await resp.read()
                    if resp.status in {200, 202, 204, 404}:
                        return True
                    try:
                        payload = json.loads(raw) if raw else {}
                    except json.JSONDecodeError:
                        payload = {}
                    if isinstance(payload, dict) and payload.get("success") is True:
                        return True
            except aiohttp.ClientError:
                continue

        self._delete_logger.error("failed to delete remote  %s", remote_filename)
        return False


class SyncWorkflow:
    def __init__(
        self,
        options: SyncOptions,
        git_service: GitCloneService,
        scanner: RepositoryImageScanner,
        openinary: OpeninaryClient,
        sync_logger: AppLogger,
        upload_logger: AppLogger,
        delete_logger: AppLogger,
    ) -> None:
        self.options = options
        self.git_service = git_service
        self.scanner = scanner
        self.openinary = openinary
        self.log_sync = sync_logger
        self.log_upload = upload_logger
        self.log_delete = delete_logger
        self.state = SyncState()

    async def step_clone_repository(self) -> None:
        try:
            await self.git_service.clone_or_pull()
        except RuntimeError as exc:
            log_git.error("git operation failed: %s", exc)
            raise SystemExit(1) from exc

    async def step_load_remote_state(self) -> None:
        async with aiohttp.ClientSession() as session:
            self.state.remote_files = await self.openinary.fetch_remote_files(session)
        self.log_sync.info("Remote storage files discovered: %d", len(self.state.remote_files))

    async def step_discover_repo_files(self) -> None:
        self.state.repo_images = self.scanner.discover_images()
        self.state.repo_files = self.scanner.build_remote_set(self.state.repo_images)

    async def step_plan_actions(self) -> None:
        if self.options.wipe_remote:
            self.state.to_delete = sorted(self.state.remote_files)
        elif self.options.prune_remote:
            self.state.to_delete = sorted(self.state.remote_files - self.state.repo_files)
        else:
            self.state.to_delete = []

        if self.options.ignore_underscore_files:
            self.state.to_delete = [
                path for path in self.state.to_delete
                if not Path(path).name.startswith("_")
            ]
        self.log_delete.info("Deletion plan: %d remote file(s)", len(self.state.to_delete))

        self.state.to_upload = []
        if not self.options.sync:
            self.state.skipped = len(self.state.repo_images)
            self.log_sync.info("Sync disabled via --no-sync; upload phase will be skipped.")
            return

        for img_path in self.state.repo_images:
            remote_filename = build_remote_filename(img_path)
            if not self.options.force and remote_filename in self.state.remote_files:
                self.log_sync.info("skip      %s", remote_filename)
                continue
            self.state.to_upload.append((img_path, remote_filename))

        self.state.skipped = len(self.state.repo_images) - len(self.state.to_upload)
        self.log_sync.info(
            "Found %d image(s): %d up-to-date, %d to upload. %s",
            len(self.state.repo_images),
            self.state.skipped,
            len(self.state.to_upload),
            "DRY RUN" if self.options.dry_run else f"Uploading (concurrency={self.options.concurrency})...",
        )

    async def step_execute_deletions(self) -> None:
        if not self.state.to_delete:
            return

        if self.options.dry_run:
            for path in self.state.to_delete:
                self.log_delete.info("[dry-run] would delete remote  %s", path)
            return

        semaphore = asyncio.Semaphore(self.options.concurrency)
        async with aiohttp.ClientSession() as session:
            async def delete_one(remote_filename: str) -> None:
                async with semaphore:
                    ok = await self.openinary.delete(session, remote_filename)
                if ok:
                    self.state.deleted += 1
                    self.log_delete.info("deleted remote  %s", remote_filename)
                else:
                    self.state.delete_failed += 1

            await asyncio.gather(*(delete_one(name) for name in self.state.to_delete), return_exceptions=True)

        self.log_delete.info(
            "Deletion complete: %d deleted, %d failed.",
            self.state.deleted,
            self.state.delete_failed,
        )
        if self.state.delete_failed:
            raise SystemExit(1)

        if self.options.wipe_remote:
            self.state.remote_files = set()

    async def step_execute_uploads(self) -> None:
        if self.options.dry_run:
            for _, remote_filename in self.state.to_upload:
                action = "new" if remote_filename not in self.state.remote_files else "existing (forced)"
                self.log_sync.info("[dry-run] would upload (%s)  %s", action, remote_filename)
            return

        semaphore = asyncio.Semaphore(self.options.concurrency)
        async with aiohttp.ClientSession() as session:
            async def upload_one(img_path: Path, remote_filename: str) -> None:
                action = "new" if remote_filename not in self.state.remote_files else "existing (forced)"
                self.log_upload.info("upload (%s)  %s", action, remote_filename)
                try:
                    async with semaphore:
                        url = await self.openinary.upload(session, img_path, remote_filename)
                except Exception as exc:
                    self.log_upload.exception("%s: unexpected error: %s", remote_filename, exc)
                    self.state.failed += 1
                    return
                if url is not None:
                    self.state.uploaded += 1
                    self.log_upload.info("uploaded %s -> %s", remote_filename, url)
                else:
                    self.state.failed += 1

            await asyncio.gather(
                *(upload_one(path, remote) for path, remote in self.state.to_upload),
                return_exceptions=True,
            )

    async def step_report(self) -> None:
        if self.options.dry_run:
            self.log_sync.info(
                "Dry run complete: %d would upload, %d skipped, %d would delete.",
                len(self.state.to_upload),
                self.state.skipped,
                len(self.state.to_delete),
            )
            return

        self.log_sync.info(
            "Sync complete: %d uploaded, %d skipped, %d failed.",
            self.state.uploaded,
            self.state.skipped,
            self.state.failed,
        )
        if self.state.failed:
            raise SystemExit(1)


class SyncExecutionBuilder:
    def __init__(self, options: SyncOptions) -> None:
        self._options = options

    def build(self, workflow: SyncWorkflow) -> list[Callable[[], Awaitable[None]]]:
        steps: list[Callable[[], Awaitable[None]]] = [
            workflow.step_clone_repository,
            workflow.step_load_remote_state,
            workflow.step_discover_repo_files,
            workflow.step_plan_actions,
        ]

        if self._options.wipe_remote or self._options.prune_remote:
            steps.append(workflow.step_execute_deletions)

        if self._options.sync:
            steps.append(workflow.step_execute_uploads)

        steps.append(workflow.step_report)
        return steps


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="""
Sync GoToHell-Backgrounds to Openinary using an API-driven plan.

API key sources (in priority order):
--api-key, --api-key-file, --api-key-stdin, OPENINARY_API_KEY env var.
"""
)
    parser.add_argument(
        "--url",
        default=None,
        help="Openinary base URL, e.g. http://localhost:3001 (or set OPENINARY_URL)",
    )
    parser.add_argument(
        "--repo-url",
        default=None,
        help=(
            "Background repository URL to clone "
            "(or set BACKGROUNDS_REPO_URL; default is built-in GoToHell-Backgrounds URL)"
        ),
    )
    parser.add_argument(
        "--repo-token",
        default=None,
        help=(
            "Token for cloning private background repo over https "
            "(or set BACKGROUNDS_REPO_TOKEN / GITHUB_TOKEN)"
        ),
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help=(
            "Openinary API key (less secure in CI process lists). "
            "Prefer OPENINARY_API_KEY, --api-key-file, or --api-key-stdin"
        ),
    )
    parser.add_argument(
        "--api-key-file",
        type=Path,
        default=None,
        help="Read API key from file (recommended for CI secret mounts)",
    )
    parser.add_argument(
        "--api-key-stdin",
        action="store_true",
        help="Read API key from stdin",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-upload all files regardless of remote presence",
    )
    parser.add_argument(
        "--sync",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Enable/disable upload sync phase (use --no-sync to skip uploads)",
    )
    parser.add_argument(
        "--ignore-underscore-files",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Ignore all files prefixed with '_' during sync and delete planning (default: enabled)",
    )
    parser.add_argument(
        "--prune-remote",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Delete remote files that are not present in the repo (default: enabled)",
    )
    parser.add_argument(
        "--wipe-remote",
        action="store_true",
        help="Delete all remote files in Openinary before syncing repo files",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show planned clone/delete/upload operations without changing remote state",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=4,
        help="Maximum number of concurrent delete/upload calls (default: 4)",
    )
    return parser.parse_args()


async def run_app(args: argparse.Namespace) -> None:
    resolved_api_key = resolve_api_key(args.api_key, args.api_key_file, args.api_key_stdin)
    if not resolved_api_key:
        log_auth.error("API key is required from --api-key/--api-key-file/--api-key-stdin/OPENINARY_API_KEY")
        raise SystemExit(
            "API key is required. Provide one of: --api-key, --api-key-file, "
            "--api-key-stdin, or OPENINARY_API_KEY"
        )

    resolved_url = (args.url or os.environ.get("OPENINARY_URL", "")).strip()
    if not resolved_url:
        raise SystemExit("Openinary URL is required. Provide --url or set OPENINARY_URL")

    resolved_repo_url = (args.repo_url or os.environ.get("BACKGROUNDS_REPO_URL", REPO_URL)).strip()
    resolved_repo_token = (
        args.repo_token
        or os.environ.get("BACKGROUNDS_REPO_TOKEN", "")
        or os.environ.get("GITHUB_TOKEN", "")
    ).strip() or None
    clone_url = build_clone_url(resolved_repo_url, resolved_repo_token)

    options = SyncOptions(
        sync=args.sync,
        ignore_underscore_files=args.ignore_underscore_files,
        force=args.force,
        prune_remote=args.prune_remote,
        wipe_remote=args.wipe_remote,
        dry_run=args.dry_run,
        concurrency=args.concurrency,
    )

    git_service = GitCloneService(clone_url, REPO_DIR, log_git)
    scanner = RepositoryImageScanner(
        REPO_DIR,
        IMAGE_EXTENSIONS,
        log_state,
        build_remote_filename,
        options.ignore_underscore_files,
    )
    openinary = OpeninaryClient(resolved_url, resolved_api_key, log_upload, log_delete)
    workflow = SyncWorkflow(options, git_service, scanner, openinary, log_sync, log_upload, log_delete)

    builder = SyncExecutionBuilder(options)
    for step in builder.build(workflow):
        await step()


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    args = parse_args()
    asyncio.run(run_app(args))


if __name__ == "__main__":
    main()
