#!/usr/bin/env python3
"""
Sync images from https://github.com/KuramaSyu/GoToHell-Backgrounds to Openinary.

The folder structure of the repo is preserved as the upload path.
A local .sync_state.json tracks SHA-256 checksums so only new or changed
files are uploaded on subsequent runs.

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
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Optional

import aiohttp

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_URL = "https://github.com/KuramaSyu/GoToHell-Backgrounds"
REPO_DIR = Path(__file__).parent / "in" / "GoToHell-Backgrounds"
STATE_FILE = Path(__file__).parent / ".sync_state.json"

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
# State helpers
# ---------------------------------------------------------------------------

def load_state() -> dict:
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {}


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, sort_keys=True)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

# ---------------------------------------------------------------------------
# Git helpers (run as async subprocesses)
# ---------------------------------------------------------------------------

async def _run_git(*args: str) -> str:
    proc = await asyncio.create_subprocess_exec(
        "git", *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(stderr.decode().strip())
    return stdout.decode().strip()


async def clone_or_pull() -> None:
    if REPO_DIR.exists():
        print(f"[git] Pulling latest changes in {REPO_DIR} ...")
        try:
            await _run_git("-C", str(REPO_DIR), "fetch", "--depth=1", "origin")
            msg = await _run_git("-C", str(REPO_DIR), "reset", "--hard", "origin/HEAD")
            print(f"[git] {msg or 'Up to date.'}")
        except RuntimeError as e:
            print(f"[git] failed: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(f"[git] Cloning {REPO_URL} ...")
        REPO_DIR.parent.mkdir(parents=True, exist_ok=True)
        try:
            await _run_git("clone", "--depth=1", REPO_URL, str(REPO_DIR))
            print("[git] Clone complete.")
        except RuntimeError as e:
            print(f"[git] clone failed: {e}", file=sys.stderr)
            sys.exit(1)

# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

async def upload_file(
    session: aiohttp.ClientSession,
    local_path: Path,
    remote_filename: str,
    openinary_url: str,
    api_key: str,
) -> Optional[str]:
    """
    POST a single file to Openinary's /upload endpoint.
    remote_filename may include sub-paths, e.g. 'Nature/forest.jpg'.
    Returns the served URL path on success, None on failure.
    """
    mime = MIME_MAP.get(local_path.suffix.lower(), "application/octet-stream")

    # Build the multipart body manually so the filename slash is NOT percent-
    # encoded. aiohttp's FormData encodes '/' as '%2F' in Content-Disposition,
    # which causes Openinary to treat the whole string as a flat filename
    # instead of creating subdirectories.
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
            f"{openinary_url}/api/upload",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
            data=body,
            timeout=aiohttp.ClientTimeout(total=120),
            allow_redirects=False,
        ) as resp:
            raw = await resp.read()
            if resp.status != 200:
                print(
                    f"\n  [ERROR] {remote_filename}: HTTP {resp.status} – {raw[:300]}",
                    file=sys.stderr,
                )
                return None
            try:
                body = json.loads(raw)
            except json.JSONDecodeError:
                print(
                    f"\n  [ERROR] {remote_filename}: invalid JSON response – {raw}",
                    file=sys.stderr,
                )
                return None
            if not body.get("success"):
                print(
                    f"\n  [ERROR] {remote_filename}: API failure – {body}",
                    file=sys.stderr,
                )
                return None
            file_infos = body.get("files", [])
            if not file_infos:
                print(f"\n  [ERROR] {remote_filename}: empty files list", file=sys.stderr)
                return None
            return file_infos[0].get("url", "")
    except (aiohttp.ClientError, OSError) as e:
        print(f"\n  [ERROR] {remote_filename}: {e}", file=sys.stderr)
        return None

# ---------------------------------------------------------------------------
# Main sync
# ---------------------------------------------------------------------------

async def sync(
    openinary_url: str,
    api_key: str,
    force: bool = False,
    dry_run: bool = False,
    concurrency: int = 4,
) -> None:
    await clone_or_pull()

    state = load_state()

    images = sorted(
        p for p in REPO_DIR.rglob("*")
        if p.is_file()
        and p.suffix.lower() in IMAGE_EXTENSIONS
        and ".git" not in p.parts
    )

    if not images:
        print("No images found in the repo — nothing to sync.")
        return

    # Split into skip/upload buckets synchronously (hashing is CPU-bound)
    to_upload: list[tuple[Path, str, str, dict]] = []  # (path, remote, checksum, prev)
    new_state: dict = {}

    for img_path in images:
        remote_filename = img_path.relative_to(REPO_DIR).as_posix()
        checksum = sha256_file(img_path)
        prev = state.get(remote_filename, {})

        if not force and prev.get("sha256") == checksum:
            new_state[remote_filename] = prev
            print(f"  skip      {remote_filename}")
        else:
            to_upload.append((img_path, remote_filename, checksum, prev))

    skipped = len(images) - len(to_upload)
    print(
        f"\nFound {len(images)} image(s): {skipped} up-to-date, "
        f"{len(to_upload)} to upload. "
        f"{'DRY RUN' if dry_run else f'Uploading (concurrency={concurrency})'}...\n"
    )

    if dry_run:
        for _, remote_filename, _, prev in to_upload:
            action = "new" if remote_filename not in state else "changed"
            print(f"  [dry-run] would upload ({action})  {remote_filename}")
            new_state[remote_filename] = prev
        print(f"\nDry run complete: {len(to_upload)} would be uploaded, {skipped} skipped.")
        return

    uploaded = 0
    failed = 0
    sem = asyncio.Semaphore(concurrency)

    async with aiohttp.ClientSession() as session:
        async def upload_one(img_path: Path, remote_filename: str, checksum: str, prev: dict) -> None:
            nonlocal uploaded, failed
            action = "new" if remote_filename not in state else "changed"
            print(f"  upload ({action})  {remote_filename} ...", end=" ", flush=True)
            try:
                async with sem:
                    url = await upload_file(session, img_path, remote_filename, openinary_url, api_key)
            except Exception as e:
                print(f"\n  [ERROR] {remote_filename}: unexpected error: {e}", file=sys.stderr)
                if remote_filename in state:
                    new_state[remote_filename] = state[remote_filename]
                failed += 1
                return
            if url is not None:
                new_state[remote_filename] = {"sha256": checksum, "url": url}
                uploaded += 1
                print(f"-> {url}")
            else:
                if remote_filename in state:
                    new_state[remote_filename] = state[remote_filename]
                failed += 1

        await asyncio.gather(*(
            upload_one(p, r, c, prev) for p, r, c, prev in to_upload
        ), return_exceptions=True)

    save_state(new_state)
    print(f"\nSync complete: {uploaded} uploaded, {skipped} skipped, {failed} failed.")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="""
Sync GoToHell-Backgrounds to Openinary.
Locally a .sync_state.json is stored, which tracks the SHA-256 
checksums of previously uploaded files. On subsequent runs, 
only new or changed files are uploaded.

API key sources (in priority order):
--api-key, --api-key-file, --api-key-stdin, OPENINARY_API_KEY env var.
For CI, prefer --api-key-file or OPENINARY_API_KEY over --api-key.
"""
)
    parser.add_argument(
        "--url",
        required=True,
        help="Openinary base URL, e.g. http://localhost:3001",
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
        help="Re-upload all files regardless of checksum",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Clone/pull the repo and show what would be uploaded, but do not upload",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=4,
        help="Maximum number of concurrent uploads (default: 4)",
    )
    args = parser.parse_args()
    resolved_api_key = resolve_api_key(args.api_key, args.api_key_file, args.api_key_stdin)
    if not resolved_api_key:
        raise SystemExit(
            "API key is required. Provide one of: --api-key, --api-key-file, "
            "--api-key-stdin, or OPENINARY_API_KEY"
        )

    asyncio.run(sync(
        openinary_url=args.url.rstrip("/"),
        api_key=resolved_api_key,
        force=args.force,
        dry_run=args.dry_run,
        concurrency=args.concurrency,
    ))
