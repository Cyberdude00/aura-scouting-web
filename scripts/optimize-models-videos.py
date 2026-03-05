import argparse
import os
import subprocess
from pathlib import Path

VALID_EXTENSIONS = {".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Optimiza videos recursivamente y conserva estructura de carpetas."
    )
    parser.add_argument("--input", default=".", help="Carpeta raíz de entrada (default: carpeta actual)")
    parser.add_argument(
        "--output",
        default="./video-optimized",
        help="Carpeta raíz de salida para videos optimizados (default: ./video-optimized)",
    )
    parser.add_argument("--crf", type=int, default=28, help="CRF H.264 (menor=mejor calidad, mayor peso)")
    parser.add_argument("--preset", default="medium", help="Preset x264: ultrafast, fast, medium, slow")
    parser.add_argument(
        "--max-height",
        type=int,
        default=1080,
        help="Altura máxima. Si supera este valor, se escala manteniendo proporción.",
    )
    parser.add_argument("--overwrite", action="store_true", help="Sobrescribe salida si ya existe")
    return parser.parse_args()


def iter_videos(root: Path):
    for current_root, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if not d.startswith(".")]

        for filename in files:
            if filename.startswith(".") or filename.startswith("._"):
                continue

            candidate = Path(current_root) / filename
            if candidate.suffix.lower() in VALID_EXTENSIONS:
                yield candidate


def ensure_ffmpeg_available() -> None:
    try:
        subprocess.run(["ffmpeg", "-version"], check=True, capture_output=True, text=True)
    except Exception as error:
        raise RuntimeError("ffmpeg no está instalado o no está en PATH") from error


def optimize_video(src: Path, dst: Path, crf: int, preset: str, max_height: int) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)

    scale_filter = (
        f"scale='if(gt(ih,{max_height}),-2,iw)':'if(gt(ih,{max_height}),{max_height},ih)'"
    )

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-vf",
        scale_filter,
        "-c:v",
        "libx264",
        "-preset",
        preset,
        "-crf",
        str(crf),
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(dst),
    ]

    subprocess.run(command, check=True, capture_output=True, text=True)


def main() -> None:
    args = parse_args()
    input_root = Path(args.input).resolve()
    output_root = Path(args.output).resolve()

    if not input_root.exists() or not input_root.is_dir():
        raise FileNotFoundError(f"No existe la carpeta de entrada: {input_root}")

    if input_root == output_root:
        raise ValueError("La carpeta de salida no puede ser la misma que la de entrada")

    ensure_ffmpeg_available()

    videos = list(iter_videos(input_root))
    if not videos:
        print(f"No se encontraron videos válidos en: {input_root}")
        print("Extensiones soportadas: .mp4, .mov, .m4v, .avi, .mkv, .webm")
        return

    processed = 0
    skipped = 0
    failed = 0
    total_before = 0
    total_after = 0

    for src in videos:
        rel_path = src.relative_to(input_root)
        dst = output_root / rel_path.with_suffix(".mp4")

        if dst.exists() and not args.overwrite:
            skipped += 1
            continue

        try:
            print(f"Procesando: {rel_path}")
            optimize_video(src, dst, args.crf, args.preset, args.max_height)
            before = src.stat().st_size
            after = dst.stat().st_size
            total_before += before
            total_after += after
            processed += 1
            print(f"OK: {rel_path} ({before / (1024 * 1024):.2f}MB -> {after / (1024 * 1024):.2f}MB)")
        except Exception as error:
            failed += 1
            print(f"ERROR: {rel_path} -> {error}")

    saved_bytes = max(0, total_before - total_after)
    saved_pct = (saved_bytes / total_before * 100) if total_before else 0

    print("\nResumen:")
    print(f"- Procesados: {processed}")
    print(f"- Omitidos: {skipped}")
    print(f"- Fallidos: {failed}")
    print(f"- Tamaño original total: {total_before / (1024 * 1024):.2f} MB")
    print(f"- Tamaño optimizado total: {total_after / (1024 * 1024):.2f} MB")
    print(f"- Ahorro total: {saved_bytes / (1024 * 1024):.2f} MB ({saved_pct:.2f}%)")
    print(f"- Salida: {output_root}")


if __name__ == "__main__":
    main()
