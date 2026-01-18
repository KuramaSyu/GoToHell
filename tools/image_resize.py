#!/usr/bin/env python3

import sys
from pathlib import Path
from PIL import Image

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
TARGET_WIDTH = 1280
TARGET_HEIGHT = 720
TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT


def crop_fill_16x9(img: Image.Image) -> Image.Image:
    """Crop *inside* so the image always fully fills 16:9"""
    w, h = img.size
    img_aspect = w / h

    if img_aspect > TARGET_ASPECT:
        # Image is wider than 16:9 → crop width
        new_w = int(h * TARGET_ASPECT)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    else:
        # Image is taller than 16:9 → crop height
        new_h = int(w / TARGET_ASPECT)
        top = (h - new_h) // 2
        return img.crop((0, top, w, top + new_h))


def process_images(files, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)

    for i, path in enumerate(files):
        with Image.open(path) as img:
            img = img.convert("RGB")
            img = crop_fill_16x9(img)
            img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

            out_name = f"{i:02d}.webp"
            out_path = output_dir / out_name

            img.save(
                out_path,
                "WEBP",
                quality=85,
                method=6
            )

            print(f"Saved: {out_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python process_images.py <input_path> [output_dir]")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) >= 3 else Path("out")

    if input_path.is_file():
        if input_path.suffix.lower() not in SUPPORTED_EXTS:
            print("Unsupported file type")
            sys.exit(1)
        files = [input_path]

    elif input_path.is_dir():
        files = sorted(
            p for p in input_path.iterdir()
            if p.suffix.lower() in SUPPORTED_EXTS
        )
        if not files:
            print("No supported images found")
            sys.exit(1)

    else:
        print("Input path does not exist")
        sys.exit(1)

    process_images(files, output_dir)


if __name__ == "__main__":
    main()
