import argparse
import os
import warnings
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageFile, ImageOps
from PIL.Image import DecompressionBombWarning

ImageFile.LOAD_TRUNCATED_IMAGES = True
Image.MAX_IMAGE_PIXELS = None
warnings.simplefilter("ignore", DecompressionBombWarning)

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Optimiza imágenes de forma recursiva manteniendo la misma estructura de carpetas. "
            "No genera mini/full: solo una copia optimizada en otra ruta."
        )
    )
    parser.add_argument(
        "--input",
        default=".",
        help="Carpeta raíz de entrada (default: carpeta actual)",
    )
    parser.add_argument(
        "--output",
        default="./optimized",
        help="Carpeta raíz de salida optimizada (default: ./optimized)",
    )
    parser.add_argument("--max-kb", type=int, default=450, help="Tamaño máximo por imagen en KB")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Sobrescribe archivos en salida si ya existen",
    )
    return parser.parse_args()


def save_to_buffer(image: Image.Image, image_format: str, quality: int | None) -> bytes:
    buffer = BytesIO()

    if image_format == "JPEG":
        image.save(buffer, format="JPEG", quality=quality or 85, optimize=True, progressive=True)
    elif image_format == "WEBP":
        image.save(buffer, format="WEBP", quality=quality or 80, method=6)
    elif image_format == "PNG":
        image.save(buffer, format="PNG", optimize=True, compress_level=9)
    else:
        image.save(buffer, format=image_format)

    return buffer.getvalue()


def optimize_image(input_path: Path, output_path: Path, max_size_bytes: int) -> tuple[int, int, bool]:
    with Image.open(input_path) as source:
        image = ImageOps.exif_transpose(source)

        ext = input_path.suffix.lower()
        target_format = "WEBP" if ext == ".webp" else image.format or "JPEG"

        if ext in {".tif", ".tiff"}:
            target_format = "JPEG"
            output_path = output_path.with_suffix(".jpg")

        if target_format == "JPEG" and image.mode not in {"RGB", "L"}:
            image = image.convert("RGB")

        width, height = image.size

        quality_values = [85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30]
        if target_format == "PNG":
            quality_values = [None]

        scale_values = [1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4]

        best_data = None
        best_size = None

        for scale in scale_values:
            new_width = max(1, int(width * scale))
            new_height = max(1, int(height * scale))
            resized = image if scale == 1.0 else image.resize((new_width, new_height), Image.LANCZOS)

            for quality in quality_values:
                data = save_to_buffer(resized, target_format, quality)
                size = len(data)

                if best_size is None or size < best_size:
                    best_data = data
                    best_size = size

                if size <= max_size_bytes:
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    output_path.write_bytes(data)
                    return input_path.stat().st_size, size, True

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(best_data)
        return input_path.stat().st_size, best_size or input_path.stat().st_size, False


def iter_images(root: Path):
    for current_root, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if not d.startswith(".")]

        for filename in files:
            if filename.startswith(".") or filename.startswith("._"):
                continue

            path = Path(current_root) / filename
            if path.suffix.lower() in VALID_EXTENSIONS:
                yield path


def main() -> None:
    args = parse_args()
    input_root = Path(args.input).resolve()
    output_root = Path(args.output).resolve()
    max_size_bytes = args.max_kb * 1024

    if not input_root.exists() or not input_root.is_dir():
        raise FileNotFoundError(f"No existe la carpeta de entrada: {input_root}")

    if output_root == input_root:
        raise ValueError("La carpeta de salida no puede ser la misma que la de entrada")

    images = list(iter_images(input_root))
    if not images:
        print(f"No se encontraron imágenes válidas en: {input_root}")
        print("Extensiones soportadas: .jpg, .jpeg, .png, .webp, .tif, .tiff")
        print("Tip: ejecuta el script dentro de la carpeta que contiene boys/girls o usa --input")
        return

    processed = 0
    skipped = 0
    total_before = 0
    total_after = 0
    not_reached_limit: list[tuple[Path, int]] = []
    heaviest_original_path: Path | None = None
    heaviest_original_size = 0

    for src in images:
        rel_path = src.relative_to(input_root)
        dst = output_root / rel_path

        if dst.exists() and not args.overwrite:
            skipped += 1
            continue

        try:
            print(f"Procesando: {rel_path}")
            before, after, reached_limit = optimize_image(src, dst, max_size_bytes)
            processed += 1
            total_before += before
            total_after += after

            if before > heaviest_original_size:
                heaviest_original_size = before
                heaviest_original_path = rel_path

            if not reached_limit:
                not_reached_limit.append((rel_path, after))
                print(
                    f"ALERTA: {rel_path} quedó en {after / 1024:.1f}KB "
                    f"(objetivo: <= {args.max_kb}KB)"
                )

            print(f"OK: {rel_path} ({before / 1024:.1f}KB -> {after / 1024:.1f}KB)")
        except Exception as error:
            skipped += 1
            print(f"ERROR: {rel_path} -> {error}")

    saved_bytes = max(0, total_before - total_after)
    saved_pct = (saved_bytes / total_before * 100) if total_before else 0

    print("\nResumen:")
    print(f"- Procesadas: {processed}")
    print(f"- Omitidas/error: {skipped}")
    print(f"- Tamaño original total: {total_before / (1024 * 1024):.2f} MB")
    print(f"- Tamaño optimizado total: {total_after / (1024 * 1024):.2f} MB")
    print(f"- Ahorro total: {saved_bytes / (1024 * 1024):.2f} MB ({saved_pct:.2f}%)")

    if heaviest_original_path is not None:
        print(
            f"- Imagen original más pesada: {heaviest_original_path} "
            f"({heaviest_original_size / (1024 * 1024):.2f} MB)"
        )

    if not_reached_limit:
        print(f"\nImágenes que NO llegaron a <= {args.max_kb}KB:")
        for rel_path, after in not_reached_limit:
            print(f"- {rel_path} ({after / 1024:.1f}KB)")


if __name__ == "__main__":
    main()
