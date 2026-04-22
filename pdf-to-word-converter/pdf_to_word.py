#!/usr/bin/env python3
"""
PDF to Word Converter
Requires: pip install pdfplumber python-docx
"""

import os
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

try:
    import pdfplumber
    from docx import Document
    from docx.shared import Pt
    DEPS_OK = True
except ImportError:
    DEPS_OK = False


def install_deps():
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber", "python-docx"])


def convert(pdf_path, progress_cb=None, status_cb=None):
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            if i > 0:
                doc.add_page_break()

            if status_cb:
                status_cb(f"Processing page {i + 1} of {total}…")
            if progress_cb:
                progress_cb(int((i / total) * 100))

            text = page.extract_text(x_tolerance=2, y_tolerance=3)
            if text:
                for line in text.splitlines():
                    doc.add_paragraph(line)

    if progress_cb:
        progress_cb(100)

    out_path = os.path.splitext(pdf_path)[0] + ".docx"
    doc.save(out_path)
    return out_path


# ── CLI mode ──────────────────────────────────────────────────────────────────

def cli_main():
    if not DEPS_OK:
        print("Missing dependencies. Run:  pip install pdfplumber python-docx")
        sys.exit(1)
    if len(sys.argv) < 2:
        print("Usage: python pdf_to_word.py file1.pdf [file2.pdf ...]")
        sys.exit(1)
    for path in sys.argv[1:]:
        if not os.path.isfile(path):
            print(f"Not found: {path}")
            continue
        print(f"Converting {os.path.basename(path)}…", end=" ", flush=True)
        out = convert(path)
        print(f"→ {out}")


# ── GUI mode ──────────────────────────────────────────────────────────────────

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("PDF to Word Converter")
        self.resizable(False, False)
        self.configure(bg="#f0f2f5")
        self._build_ui()
        self._selected = []

    def _build_ui(self):
        pad = {"padx": 24, "pady": 12}

        tk.Label(self, text="PDF to Word Converter", font=("Helvetica", 17, "bold"),
                 bg="#f0f2f5", fg="#1a1a2e").pack(pady=(24, 2))
        tk.Label(self, text="Convert PDF files to .docx — runs entirely on your machine.",
                 font=("Helvetica", 10), bg="#f0f2f5", fg="#6b7280").pack(pady=(0, 16))

        # Drop / browse frame
        frame = tk.Frame(self, bg="#ffffff", relief="flat", bd=0,
                         highlightthickness=2, highlightbackground="#d1d5db")
        frame.pack(fill="x", padx=24)

        self._file_label = tk.Label(frame, text="No files selected",
                                    font=("Helvetica", 10), bg="#ffffff",
                                    fg="#6b7280", wraplength=380, justify="left")
        self._file_label.pack(side="left", padx=12, pady=12, fill="x", expand=True)

        tk.Button(frame, text="Browse…", command=self._browse,
                  bg="#4f46e5", fg="white", relief="flat",
                  font=("Helvetica", 10, "bold"), cursor="hand2",
                  padx=12, pady=6).pack(side="right", padx=8, pady=8)

        # Progress
        self._progress = ttk.Progressbar(self, length=400, mode="determinate")
        self._progress.pack(padx=24, pady=(16, 4), fill="x")

        self._status = tk.Label(self, text="", font=("Helvetica", 9),
                                bg="#f0f2f5", fg="#6b7280")
        self._status.pack()

        # Convert button
        self._btn = tk.Button(self, text="Convert to Word", command=self._start,
                              bg="#4f46e5", fg="white", relief="flat",
                              font=("Helvetica", 11, "bold"), cursor="hand2",
                              padx=20, pady=10, state="disabled")
        self._btn.pack(pady=(16, 4))

        tk.Label(self, text="Output .docx files are saved next to each PDF.",
                 font=("Helvetica", 9), bg="#f0f2f5", fg="#9ca3af").pack(pady=(4, 20))

        self.geometry("460x320")

    def _browse(self):
        paths = filedialog.askopenfilenames(
            title="Select PDF files",
            filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")]
        )
        if paths:
            self._selected = list(paths)
            names = ", ".join(os.path.basename(p) for p in self._selected)
            self._file_label.config(text=names, fg="#374151")
            self._btn.config(state="normal")
            self._status.config(text="")
            self._progress["value"] = 0

    def _start(self):
        if not self._selected:
            return
        self._btn.config(state="disabled")
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        results = []
        try:
            for idx, path in enumerate(self._selected):
                base_progress = int(idx / len(self._selected) * 100)
                scale = 1 / len(self._selected)

                def page_progress(pct, _s=scale, _b=base_progress):
                    self._progress["value"] = _b + int(pct * _s)

                def page_status(msg):
                    self._status.config(text=msg)

                out = convert(path, progress_cb=page_progress, status_cb=page_status)
                results.append(out)

            self._progress["value"] = 100
            self._status.config(text="Done!", fg="#16a34a")
            msg = "Saved:\n" + "\n".join(results)
            messagebox.showinfo("Conversion complete", msg)
        except Exception as e:
            self._status.config(text=f"Error: {e}", fg="#dc2626")
            messagebox.showerror("Error", str(e))
        finally:
            self._btn.config(state="normal")


def gui_main():
    if not DEPS_OK:
        root = tk.Tk()
        root.withdraw()
        answer = messagebox.askyesno(
            "Missing dependencies",
            "Required packages are not installed:\n  pdfplumber\n  python-docx\n\n"
            "Install them now? (requires internet)"
        )
        if answer:
            try:
                install_deps()
                messagebox.showinfo("Done", "Dependencies installed. Please restart the app.")
            except Exception as e:
                messagebox.showerror("Install failed", str(e))
        root.destroy()
        sys.exit(0)

    app = App()
    app.mainloop()


if __name__ == "__main__":
    # CLI mode if arguments are given, otherwise launch GUI
    if len(sys.argv) > 1:
        cli_main()
    else:
        gui_main()
