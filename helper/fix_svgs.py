import os
import re

# Input and output folders
INPUT_DIR = "src/frontend/src/assets"
OUTPUT_DIR = "src/frontend/src/assets/variable"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Regex patterns to replace stroke/fill colors
STROKE_PATTERN = re.compile(r'stroke:\s*#[0-9a-fA-F]{3,6}')
FILL_PATTERN = re.compile(r'fill:\s*#[0-9a-fA-F]{3,6}')

def process_file(input_path, output_path):
    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace stroke and fill colors with currentColor
    content = STROKE_PATTERN.sub("stroke:currentColor", content)
    content = FILL_PATTERN.sub("fill:currentColor", content)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    for filename in os.listdir(INPUT_DIR):
        if not filename.lower().endswith(".svg"):
            continue

        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename)

        try:
            process_file(input_path, output_path)
            print(f"✔ Processed: {filename}")
        except Exception as e:
            print(f"✖ Failed: {filename} — {e}")

if __name__ == "__main__":
    main()
