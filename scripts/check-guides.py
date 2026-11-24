"""Check same-site guide links, fragments, and assets in the assembled Pages tree."""

import json
from functools import cache
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / ".output/public"
HOST = "open-mqtt-bridges.github.io"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links = []
        self.ids = set()
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if attrs.get(key):
                self.links.append(attrs[key])


@cache
def page(path):
    return Page(path)


errors = set()
count = 0
for bridge in json.loads((ROOT / "bridges.json").read_text()):
    if bridge["archived"]:
        continue
    slug = bridge["slug"]
    for source in (ROOT / "docs/bridges" / slug).glob("*.md"):
        html = OUTPUT / slug / (source.stem + ".html")
        base = f"https://{HOST}/{slug}/" + ("" if source.stem == "index" else source.stem)
        count += 1
        for link in page(html).links:
            url = urlsplit(urljoin(base, link))
            if url.hostname != HOST or url.scheme not in ("http", "https"):
                continue
            path = OUTPUT / unquote(url.path).lstrip("/")
            candidates = (path, path / "index.html", Path(str(path) + ".html"))
            dest = next((p for p in candidates if p.is_file()), None)
            if not dest or (url.fragment and dest.suffix == ".html" and unquote(url.fragment) not in page(dest).ids):
                errors.add(f"{slug}/{source.name}: {link}")
if errors:
    raise SystemExit("Unresolved guide links:\n" + "\n".join(sorted(errors)))
print(f"Checked links, fragments and assets on {count} guide pages.")
