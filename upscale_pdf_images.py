import argparse
import io
import warnings
from pathlib import Path

import fitz  # PyMuPDF
import img2pdf
from PIL import Image


def upscale_pdf(input_pdf: Path, output_pdf: Path, scale: float, extra_resize: float = 1.0) -> None:
    if scale <= 0 or extra_resize <= 0:
        raise ValueError("scale and extra_resize must be > 0")

    doc = fitz.open(str(input_pdf))
    images_bytes = []

    try:
        for page in doc:
            mat = fitz.Matrix(scale, scale)
            pix = page.get_pixmap(matrix=mat, alpha=False)  # rasterize page
            # Avoid routing through PIL for the common case to reduce memory/time
            # and prevent PIL's DecompressionBomb warnings on very large pages.
            if extra_resize == 1.0:
                images_bytes.append(pix.tobytes("jpeg"))
                continue

            # If extra resizing is requested, use PIL but disable the pixel-limit guard
            # (the pixmap is generated in-memory by PyMuPDF, not user-controlled compressed data).
            Image.MAX_IMAGE_PIXELS = None
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", Image.DecompressionBombWarning)
                img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")

            w, h = img.size
            img = img.resize((int(w * extra_resize), int(h * extra_resize)), Image.Resampling.LANCZOS)

            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=95, optimize=True)
            images_bytes.append(buf.getvalue())

    finally:
        doc.close()

    pdf_bytes = img2pdf.convert(images_bytes)
    output_pdf.write_bytes(pdf_bytes)


def main():
    ap = argparse.ArgumentParser(description="Upscale a PDF made of image pages and write back as PDF.")
    ap.add_argument("input_pdf", type=Path)
    ap.add_argument("output_pdf", type=Path)
    ap.add_argument(
        "scale_positional",
        nargs="?",
        type=float,
        default=None,
        help="Optional positional scale (e.g., 2.0). If provided, it overrides --scale.",
    )
    ap.add_argument("--scale", type=float, default=2.0, help="Rasterization scale (e.g., 2.0 = 2x)")
    ap.add_argument(
        "--extra-resize",
        type=float,
        default=1.0,
        help="Optional extra resize after rasterization (e.g., 1.5). Usually leave at 1.0.",
    )
    args = ap.parse_args()

    scale = args.scale_positional if args.scale_positional is not None else args.scale
    upscale_pdf(args.input_pdf, args.output_pdf, scale=scale, extra_resize=args.extra_resize)


if __name__ == "__main__":
    main()

