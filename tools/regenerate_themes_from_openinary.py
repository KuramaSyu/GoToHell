#!/usr/bin/env python3
"""
Regenerate theme backgrounds from Openinary folders.

The script reads a themes JSON file, fuzzy-matches each theme to a folder found
under Openinary's public storage directory, and updates the theme's backgrounds
with URLs generated from files in that folder.

By default, themes without a strong folder match are left unchanged.

Examples:
    python regenerate_themes_from_openinary.py
    python regenerate_themes_from_openinary.py --base-url http://localhost:3001
    python regenerate_themes_from_openinary.py --output /tmp/themes.updated.json
    python regenerate_themes_from_openinary.py --min-score 0.62 --dry-run
    python regenerate_themes_from_openinary.py --cleanup-legacy-flat
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterable
from urllib.parse import quote

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".avif", ".bmp", ".tiff", ".tif", ".svg",
}


@dataclass
class MatchResult:
    folder: str
    score: float


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = text.replace("&", " and ")
    text = text.replace("_", " ")
    text = text.replace("-", " ")
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def compact(text: str) -> str:
    return normalize(text).replace(" ", "")


def token_overlap(a: str, b: str) -> float:
    a_tokens = set(normalize(a).split())
    b_tokens = set(normalize(b).split())
    if not a_tokens or not b_tokens:
        return 0.0
    inter = len(a_tokens & b_tokens)
    union = len(a_tokens | b_tokens)
    return inter / union


def score_pair(theme_label: str, folder_name: str) -> float:
    a = normalize(theme_label)
    b = normalize(folder_name)
    ac = compact(theme_label)
    bc = compact(folder_name)

    ratio = SequenceMatcher(None, a, b).ratio()
    ratio_compact = SequenceMatcher(None, ac, bc).ratio()
    overlap = token_overlap(a, b)

    bonus = 0.0
    if ac and bc and (ac in bc or bc in ac):
        bonus += 0.10

    # Weighted blend to be resilient against spacing and separators.
    return max(ratio, ratio_compact) * 0.72 + overlap * 0.28 + bonus


def best_folder_match(
    theme_name: str,
    theme_long_name: str,
    folder_names: Iterable[str],
    min_score: float,
) -> MatchResult | None:
    candidates = [theme_name]
    if theme_long_name:
        candidates.append(theme_long_name)

    best: MatchResult | None = None
    for folder in folder_names:
        for candidate in candidates:
            s = score_pair(candidate, folder)
            if best is None or s > best.score:
                best = MatchResult(folder=folder, score=s)

    if best is None or best.score < min_score:
        return None
    return best


def natural_key(name: str) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", name)]


def discover_folder_images(public_dir: Path) -> dict[str, list[str]]:
    folder_images: dict[str, list[str]] = {}

    for child in sorted(public_dir.iterdir(), key=lambda p: p.name.lower()):
        if not child.is_dir():
            continue

        images = [
            p.name for p in child.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
        ]
        if images:
            folder_images[child.name] = sorted(images, key=natural_key)

    return folder_images


def find_legacy_flat_files(public_dir: Path) -> list[Path]:
    """
    Find root-level files like "Terraria%2F05.webp" that came from a broken
    upload where folder separators were percent-encoded in filenames.
    """
    legacy = [
        p for p in public_dir.iterdir()
        if p.is_file() and "%2F" in p.name and p.suffix.lower() in IMAGE_EXTENSIONS
    ]
    return sorted(legacy, key=lambda p: p.name.lower())


def make_url(base_url: str, folder: str, filename: str) -> str:
    return f"{base_url}/t/{quote(folder, safe='')}/{quote(filename, safe='')}"


def resolve_themes_path(user_path: Path | None) -> Path:
    """
    Resolve themes.json path.

    Priority:
    1) --themes explicit path
    2) script-location candidates
    3) current working directory candidates (including ../ and ../../)
    """
    if user_path is not None:
        resolved = user_path.expanduser().resolve()
        if not resolved.is_file():
            raise SystemExit(f"themes file not found: {resolved}")
        return resolved

    script_dir = Path(__file__).resolve().parent
    cwd = Path.cwd().resolve()

    candidate_strings = [
        # Script-location attempts
        str(script_dir / "themes.json"),
        str(script_dir / "../src/frontend/src/theme/themes.json"),
        str(script_dir / "../../src/frontend/src/theme/themes.json"),
        # Executed-from attempts
        str(cwd / "src/frontend/src/theme/themes.json"),
        str(cwd / "../src/frontend/src/theme/themes.json"),
        str(cwd / "../../src/frontend/src/theme/themes.json"),
        str(cwd / "themes.json"),
        str(cwd / "../themes.json"),
        str(cwd / "../../themes.json"),
    ]

    seen: set[str] = set()
    checked: list[Path] = []
    for item in candidate_strings:
        candidate = Path(item).expanduser().resolve()
        key = str(candidate)
        if key in seen:
            continue
        seen.add(key)
        checked.append(candidate)
        if candidate.is_file():
            return candidate

    lines = "\n".join(f" - {p}" for p in checked)
    raise SystemExit(
        "Could not auto-find themes.json. Checked:\n"
        f"{lines}\n"
        "Provide an explicit path with --themes <path>."
    )


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    default_public = repo_root / "data/openinary/public"

    parser = argparse.ArgumentParser(
        description="Regenerate theme backgrounds from Openinary folders",
    )
    parser.add_argument(
        "--themes",
        type=Path,
        default=None,
        help="Path to input themes JSON (auto-detected when omitted)",
    )
    parser.add_argument(
        "--openinary-public",
        type=Path,
        default=default_public,
        help=f"Path to Openinary public dir (default: {default_public})",
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:3001",
        help="Base URL used for generated background URLs (default: http://localhost:3001)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output file path. Defaults to overwrite --themes",
    )
    parser.add_argument(
        "--min-score",
        type=float,
        default=0.60,
        help="Minimum fuzzy score for a theme-to-folder match (default: 0.60)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned changes without writing output",
    )
    parser.add_argument(
        "--cleanup-legacy-flat",
        action="store_true",
        help="Delete stale root-level files containing '%%2F' in their filename",
    )
    args = parser.parse_args()

    themes_path = resolve_themes_path(args.themes)
    public_dir = args.openinary_public.resolve()
    out_path = args.output.resolve() if args.output else themes_path
    base_url = args.base_url.rstrip("/")

    if args.themes is None:
        print(f"[auto] using themes file: {themes_path}")
    if not public_dir.exists() or not public_dir.is_dir():
        raise SystemExit(f"openinary public directory not found: {public_dir}")

    with themes_path.open("r", encoding="utf-8") as f:
        themes = json.load(f)

    if not isinstance(themes, list):
        raise SystemExit("themes JSON must be a list")

    folder_images = discover_folder_images(public_dir)
    folder_names = list(folder_images.keys())

    if not folder_names:
        raise SystemExit("no folders with images found in Openinary public directory")

    matched = 0
    unmatched = 0

    for theme in themes:
        if not isinstance(theme, dict):
            continue

        theme_name = str(theme.get("name", "")).strip()
        theme_long_name = str(theme.get("longName", "")).strip()
        if not theme_name:
            continue

        result = best_folder_match(
            theme_name=theme_name,
            theme_long_name=theme_long_name,
            folder_names=folder_names,
            min_score=args.min_score,
        )

        if result is None:
            unmatched += 1
            print(f"[no match] {theme_name}")
            continue

        files = folder_images[result.folder]
        theme["backgrounds"] = [make_url(base_url, result.folder, file) for file in files]
        matched += 1
        print(
            f"[matched] {theme_name} -> {result.folder} "
            f"(score={result.score:.3f}, images={len(files)})"
        )

    print(f"\nSummary: {matched} matched, {unmatched} unmatched")

    removed_legacy = 0
    legacy_files: list[Path] = []
    if args.cleanup_legacy_flat:
        legacy_files = find_legacy_flat_files(public_dir)
        if not legacy_files:
            print("No legacy flat files found.")
        else:
            print(f"Found {len(legacy_files)} legacy flat file(s) to clean:")
            for p in legacy_files:
                if args.dry_run:
                    print(f"[dry-run] would remove {p.name}")
                else:
                    p.unlink()
                    removed_legacy += 1
                    print(f"[removed] {p.name}")

    if args.dry_run:
        if args.cleanup_legacy_flat:
            print(f"Cleanup dry run: {len(legacy_files)} file(s) would be removed.")
        print("Dry run complete. No file written.")
        return

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(themes, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Wrote updated themes JSON to: {out_path}")
    if args.cleanup_legacy_flat:
        print(f"Cleanup complete: removed {removed_legacy} legacy flat file(s)")


if __name__ == "__main__":
    main()
