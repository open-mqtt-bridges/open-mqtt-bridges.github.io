"""Serve the Pages artifact locally with GitHub Pages-style clean guide URLs."""

from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, test
from pathlib import Path


class PagesHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".output/public", **kwargs)

    def translate_path(self, url):
        path = Path(super().translate_path(url))
        clean_page = Path(str(path) + ".html")
        if not path.exists() and clean_page.is_file():
            return str(clean_page)
        return str(path)


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    test(HandlerClass=PagesHandler, port=args.port, bind=args.bind)
