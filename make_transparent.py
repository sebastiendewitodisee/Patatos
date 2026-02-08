from __future__ import annotations

import argparse
import io
import shutil
from pathlib import Path

from PIL import Image
from rembg import new_session, remove


DEFAULT_INPUT = r"C:\Users\sebas\Desktop\Patatos\patatos-site\public\varieties"
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def has_non_empty_alpha(image: Image.Image) -> bool:
    if "A" not in image.getbands():
        return False
    alpha_channel = image.getchannel("A")
    alpha_min, _alpha_max = alpha_channel.getextrema()
    return alpha_min < 255


def process_image(file_path: Path, output_path: Path, session) -> tuple[str, str]:
    if output_path.exists():
        return "SKIP", "output already exists"

    try:
        if file_path.suffix.lower() == ".png":
            with Image.open(file_path) as source_image:
                if has_non_empty_alpha(source_image):
                    shutil.copy2(file_path, output_path)
                    return "OK", "copied PNG with existing transparency"

        input_bytes = file_path.read_bytes()
        output_bytes = remove(input_bytes, session=session)

        with Image.open(io.BytesIO(output_bytes)) as out_image:
            rgba_image = out_image.convert("RGBA")
            rgba_image.save(output_path, format="PNG")

        return "OK", "background removed"
    except Exception as exc:  # noqa: BLE001
        return "FAIL", str(exc)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Remove backgrounds from images in a folder and save transparent PNG files."
    )
    parser.add_argument(
        "--input",
        default=DEFAULT_INPUT,
        help=f"Input folder path (default: {DEFAULT_INPUT})",
    )
    args = parser.parse_args()

    input_dir = Path(args.input)
    if not input_dir.exists() or not input_dir.is_dir():
        print(f"Input folder not found: {input_dir}")
        return 1

    output_dir = input_dir / "transparent"
    output_dir.mkdir(parents=True, exist_ok=True)

    image_files = sorted(
        path for path in input_dir.iterdir() if path.is_file() and path.suffix.lower() in VALID_EXTENSIONS
    )

    total = len(image_files)
    if total == 0:
        print(f"No supported images found in: {input_dir}")
        return 0

    print(f"Input : {input_dir}")
    print(f"Output: {output_dir}")
    print(f"Found : {total} image(s)\n")

    session = new_session("u2net")
    results = {"OK": 0, "SKIP": 0, "FAIL": 0}
    failed_files: list[tuple[str, str]] = []

    for index, file_path in enumerate(image_files, start=1):
        output_file = output_dir / f"{file_path.stem}.png"
        status, message = process_image(file_path, output_file, session)
        results[status] += 1

        print(f"[{index}/{total}] {file_path.name} -> {status} ({message})")
        if status == "FAIL":
            failed_files.append((file_path.name, message))

    print("\nSummary")
    print(f"OK   : {results['OK']}")
    print(f"SKIP : {results['SKIP']}")
    print(f"FAIL : {results['FAIL']}")

    if failed_files:
        print("\nFailed files:")
        for file_name, error_message in failed_files:
            print(f"- {file_name}: {error_message}")
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
