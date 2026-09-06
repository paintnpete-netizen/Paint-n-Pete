#!/usr/bin/env python3
"""Assemble Paint'n Pete vendor packet on the Desktop for sending."""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from datetime import date

from pypdf import PdfReader, PdfWriter

HOME = Path.home()
DL = HOME / "Downloads"
DESKTOP = HOME / "Desktop"
HERE = Path(__file__).resolve().parent
REPO_HTML = HERE / "00-cover-and-capabilities.html"
STAMP = date.today().strftime("%Y-%m")
OUT = DESKTOP / f"PaintnPete-Vendor-Packet-{STAMP}"

# Source compliance PDFs (Downloads). Do not commit these.
SOURCES = [
    ("02-W9-Kanwal-Consulting-LLC.pdf", DL / "W9 Paint'n Pete .pdf"),
    (
        "03-COI-General-Liability-Next.pdf",
        DL / "Kanwal_Consulting_DBA_Paint'n_Pete_POI_-_320756694.pdf.pdf",
    ),
    (
        "04-COI-Workers-Comp-biBERK.pdf",
        DL / "N9WC614678-ACORDAPP25-I-2.PDF",
    ),
    (
        "05-Florida-Business-Registration.pdf",
        DL / "01-05-26 - FL - Initial Filing - Kanwal Consulting LLC.pdf",
    ),
]

CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def chrome_pdf(html: Path, pdf: Path) -> None:
    html_uri = html.resolve().as_uri()
    cmd = [
        str(CHROME),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf}",
        html_uri,
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def merge_pdfs(paths: list[Path], dest: Path) -> None:
    writer = PdfWriter()
    for p in paths:
        reader = PdfReader(str(p))
        for page in reader.pages:
            writer.add_page(page)
    with dest.open("wb") as f:
        writer.write(f)


def main() -> None:
    missing = [str(src) for _, src in SOURCES if not src.exists()]
    if missing:
        raise SystemExit("Missing source PDFs:\n  " + "\n  ".join(missing))
    if not REPO_HTML.exists():
        raise SystemExit(f"Missing {REPO_HTML}")
    if not CHROME.exists():
        raise SystemExit("Google Chrome not found for PDF export")

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    cover_pdf = OUT / "01-Cover-and-Capabilities.pdf"
    print("Rendering capabilities PDF…")
    chrome_pdf(REPO_HTML, cover_pdf)

    ordered: list[Path] = [cover_pdf]
    for dest_name, src in SOURCES:
        dest = OUT / dest_name
        shutil.copy2(src, dest)
        ordered.append(dest)
        print(f"Copied {dest_name}")

    merged = OUT / f"PaintnPete-Vendor-Packet-COMPLETE-{STAMP}.pdf"
    print("Merging complete packet…")
    merge_pdfs(ordered, merged)

    readme = OUT / "README-SEND.txt"
    readme.write_text(
        "\n".join(
            [
                "Paint'n Pete — Vendor Packet",
                f"Assembled {date.today().isoformat()}",
                "",
                "SEND THIS:",
                f"  {merged.name}",
                "",
                "Or attach the numbered PDFs individually:",
                "  01 Cover + capabilities",
                "  02 W-9",
                "  03 General liability certificate",
                "  04 Workers' compensation certificate",
                "  05 Florida business registration",
                "",
                "NOTE: If the GC needs to be named as Additional Insured,",
                "request a new GL cert in their legal name before sending",
                "(or send this packet and follow with the named cert within 1 day).",
                "",
                "Do not commit this folder to git (contains W-9 / EIN).",
                "",
            ]
        ),
        encoding="utf-8",
    )

    print(f"\nReady: {OUT}")
    print(f"Complete PDF: {merged}")


if __name__ == "__main__":
    main()
