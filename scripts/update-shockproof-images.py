#!/usr/bin/env python3
"""Upload shockproof skirting images and set gallery colors + textures on the VPS.

Reads designer folders named by product slug. Does not print secrets.
Requires SHOCKPROOF_HOST, SHOCKPROOF_SSH_PASS, and uses the server .env for MySQL.
"""
import json
import os
import re
import sys
import unicodedata
import uuid
from pathlib import Path

import paramiko
from PIL import Image

ROOT = Path(r"C:\Users\ASUS\Desktop\Image Shockproof skirting boards")
STAGE = Path(os.environ.get("SHOCKPROOF_STAGE", r"C:\Users\ASUS\AppData\Local\Temp\shockproof-upload"))
REMOTE_DIR = "/var/www/comfort/server/uploads/shockproof-2026"
PUBLIC_PREFIX = "/uploads/shockproof-2026"
CATEGORY_SLUG = "skirting-boards-shockproof-skirting-boards"

GALLERY_EDGE = 2560
TEXTURE_EDGE = 4096
WEBP_QUALITY = 85

VIDEOS = {
    "classic-skirting-boards": "/uploads/legacy/montageVideos/shockProf/comfort_web_hevc.mp4",
    "modern-skirting-boards": "/uploads/legacy/montageVideos/shockProf/comfort_web_hevc.mp4",
    "system-skirting-boards": "/uploads/legacy/montageVideos/shockProf/comfort_web_hevc.mp4",
}


def loc(am, en, ru):
    return {"am": am, "en": en, "ru": ru}


CLASSIC = {
    "001": loc("Սպիտակ 001", "White 001", "Белый 001"),
    "081": loc("Կաղնի այսբերգ 081", "Oak iceberg 081", "Дуб айсберг 081"),
    "084": loc("Կաղնի պատինա 084", "Oak patina 084", "Дуб патина 084"),
    "063": loc("Վինտաժային կաղնի 063", "Vintage oak 063", "Дуб винтажный 063"),
    "421": loc("Մոխրագույն հացենի 421", "Gray ash 421", "Ясень серый 421"),
    "438": loc("Լոֆթ բաց մոխրագույն 438", "Loft light gray 438", "Лофт светло-серый 438"),
    "406": loc("Մոխրագույն կաղնի 406", "Gray oak 406", "Дуб серый 406"),
    "435": loc("Մոխրագույն սեքվոյա 435", "Gray sequoia 435", "Секвойя серая 435"),
    "401": loc("Մոխրավուն կաղնի 401", "Ashen oak 401", "Дуб пепельный 401"),
    "437": loc("Լոֆթ մոխրագույն 437", "Loft gray 437", "Лофт серый 437"),
    "057": loc("Կաղնի վերդե 057", "Oak verde 057", "Дуб верде 057"),
    "424": loc("Ակացիա 424", "Acacia 424", "Акация 424"),
    "270": loc("Կաղնի լատտե 270", "Oak latte 270", "Дуб латте 270"),
    "204": loc("Կաղնի մոկա 204", "Oak mocha 204", "Дуб мокка 204"),
    "219": loc("Կաղնի կապուչինո 219", "Oak cappuccino 219", "Дуб капучино 219"),
    "220": loc("Ռուստիկ կաղնի 220", "Rustic oak 220", "Дуб рустик 220"),
    "100": loc("Կայսերական կաղնի 100", "Imperial oak 100", "Дуб имперский 100"),
    "217": loc("Մուգ կաղնի 217", "Dark oak 217", "Дуб темный 217"),
    "224": loc("Ընկուզենի 224", "Walnut 224", "Орех 224"),
    "226": loc("Վենգե 226", "Wenge 226", "Венге 226"),
    "547": loc("Լոֆթ բաց մոխրագույն 547", "Loft light gray 547", "Лофт светло-серый 547"),
    "548": loc("Լոֆթ մոխրագույն 548", "Loft gray 548", "Лофт серый 548"),
}

SYSTEM = {
    "445": loc("Անտիկ 445", "Antique 445", "Антик 445"),
    "086": loc("Անտիկ սպիտակ 086", "Antique white 086", "Антик белый 086"),
    "294": loc("Անտիկ կաղնի 294", "Antique oak 294", "Антик дуб 294"),
    "446": loc("Անտիկ մոխրագույն 446", "Antique gray 446", "Антик серый 446"),
    "292": loc("Արիզոնա 292", "Arizona 292", "Аризона 292"),
    "314": loc("Արիզոնա շագանակագույն 314", "Arizona brown 314", "Аризона коричневая 314"),
    "001": loc("Սպիտակ 001", "White 001", "Белый 001"),
    "111": loc("Վեներ 111", "Veneer 111", "Венеер 111"),
    "447": loc("Մոխրագույն վեներ 447", "Gray veneer 447", "Венеер серый 447"),
    "085": loc("Օլդվուդ 085", "Oldwood 085", "Олдвуд 085"),
    "293": loc("Օլդվուդ նատուրալ 293", "Oldwood natural 293", "Олдвуд натурал 293"),
    "444": loc("Օլդվուդ մոխրագույն 444", "Oldwood gray 444", "Олдвуд серый 444"),
    "291": loc("Օրեգոն 291", "Oregon 291", "Орегон 291"),
    "112": loc("Ռովերե 112", "Rovere 112", "Ровере 112"),
    "313": loc("Բալի ռովերե 313", "Cherry rovere 313", "Ровере вишнёвый 313"),
    "442": loc("Մոխրագույն սեյբա 442", "Gray ceiba 442", "Сейба серая 442"),
    "443": loc("Սմոք 443", "Smoke 443", "Смок 443"),
    "448": loc("Ստոնիքս բետոն 448", "Stonix concrete 448", "Стоникс бетон 448"),
    "449": loc("Ստոնիքս մոխրագույն 449", "Stonix gray 449", "Стоникс серый 449"),
    "290": loc("Թիմբեր 290", "Timber 290", "Тимбер 290"),
}

MODERN = {
    "001": loc("Սպիտակ 001", "White 001", "Белый 001"),
    "232": loc("Կապուչինո 232", "Cappuccino 232", "Капучино 232"),
    "418": loc("Մոխրագույն 418", "Gray 418", "Серый 418"),
    "428": loc("Անտրացիտ 428", "Anthracite 428", "Антрацит 428"),
    "600": loc("Սև 600", "Black 600", "Черный 600"),
    "705": loc("Օազիս 705", "Oasis 705", "Оазис 705"),
}

FASTENER = loc("Ամրակ", "Fastener", "Крепеж")

PRODUCTS = {
    "classic-skirting-boards": {
        "names": CLASSIC,
        "order": [
            "001", "081", "084", "063", "421", "438", "406", "435", "401", "437",
            "057", "424", "270", "204", "219", "220", "100", "217", "224", "226",
        ],
        "ready": True,
        "kits": True,
    },
    "modern-skirting-boards": {
        "names": MODERN,
        "order": ["001", "232", "418", "428", "600", "705"],
        "ready": False,
        "kits": False,
        "accessory_dir": "New Folder",
    },
    "system-skirting-boards": {
        "names": SYSTEM,
        "order": [
            "001", "449", "085", "086", "442", "446", "447", "443", "448", "444",
            "445", "290", "294", "112", "111", "291", "293", "292", "314", "313",
        ],
        "ready": False,
        "kits": True,
    },
}


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def color_code(filename: str) -> str:
    stem = nfc(Path(filename).stem)
    stem = re.sub(r"\s*\(\d+\)", "", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    leading = re.match(r"^(\d{3})\b", stem)
    if leading and not stem.lower().startswith("classic_"):
        return leading.group(1)
    trailing = re.search(r"(\d{3})\s*$", stem)
    if trailing:
        return trailing.group(1)
    raise ValueError(f"No color code in {filename}")


def images_in(folder: Path):
    if not folder.is_dir():
        return []
    files = [
        p
        for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    ]
    return sorted(files, key=lambda p: p.name)


def to_webp(src: Path, dest: Path, max_edge: int):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGBA") if im.mode in {"P", "LA"} else im
        if im.mode not in {"RGB", "RGBA"}:
            im = im.convert("RGB")
        im.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
        im.save(dest, "WEBP", quality=WEBP_QUALITY, method=4)
    return dest


def variant(name, url):
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "thumbUrl": url,
        "imageUrl": url,
    }


def texture(name, map_url, preview_url):
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "mapUrl": map_url,
        "previewUrl": preview_url,
    }


def index_by_code(files, names):
    found = {}
    for path in files:
        code = color_code(path.name)
        if code not in names:
            raise SystemExit(f"Unknown color code {code} in {path}")
        if code in found:
            raise SystemExit(f"Duplicate color {code}: {found[code]} and {path}")
        found[code] = path
    return found


def build():
    if STAGE.exists():
        for path in STAGE.rglob("*"):
            if path.is_file():
                path.unlink()
    STAGE.mkdir(parents=True, exist_ok=True)

    payload = {"products": [], "collections": [], "category": None}
    jobs = []

    def stage_image(src: Path, rel: str, max_edge: int) -> str:
        dest = STAGE / rel
        print(f"  encode {rel}", flush=True)
        to_webp(src, dest, max_edge)
        jobs.append(rel.replace("\\", "/"))
        return f"{PUBLIC_PREFIX}/{rel.replace(chr(92), '/')}"

    avatar = ROOT / "category avatar.png"
    if avatar.is_file():
        url = stage_image(avatar, "category-avatar.webp", GALLERY_EDGE)
        payload["category"] = {"slug": CATEGORY_SLUG, "image": url}

    for slug, spec in PRODUCTS.items():
        folder = ROOT / slug
        if not folder.is_dir():
            raise SystemExit(f"Missing folder {folder}")
        names = spec["names"]
        gallery_files = index_by_code(images_in(folder), names)
        missing = [code for code in spec["order"] if code not in gallery_files]
        if missing:
            raise SystemExit(f"{slug} missing product images: {missing}")

        gallery = []
        preview_by_code = {}
        for index, code in enumerate(spec["order"], start=1):
            rel = f"{slug}/gallery/{index:02d}-{code}.webp"
            url = stage_image(gallery_files[code], rel, GALLERY_EDGE)
            preview_by_code[code] = url
            gallery.append(variant(names[code], url))

        textures = []
        if spec["ready"]:
            ready = index_by_code(images_in(folder / "READY"), names)
            for code, src in sorted(ready.items(), key=lambda item: item[0]):
                rel = f"{slug}/textures/{code}.webp"
                url = stage_image(src, rel, TEXTURE_EDGE)
                textures.append(
                    texture(names[code], url, preview_by_code.get(code, url))
                )

        images = [gallery[0]["imageUrl"]]
        video = VIDEOS.get(slug)
        if video:
            images.append(video)

        payload["products"].append(
            {
                "slug": slug,
                "images": images,
                "galleryVariants": gallery,
                "textures": textures,
            }
        )

        accessory_files = []
        fastener = None
        if spec["kits"]:
            fastener = folder / "Комплекты" / "Крепеж.jpg"
            accessory_files = images_in(folder / "Комплекты" / "Новая папка")
        elif spec.get("accessory_dir"):
            accessory_files = images_in(folder / spec["accessory_dir"])

        acc_gallery = []
        if fastener and fastener.is_file():
            rel = f"{slug}/accessories/00-fastener.webp"
            url = stage_image(fastener, rel, GALLERY_EDGE)
            acc_gallery.append(variant(FASTENER, url))

        if accessory_files:
            by_code = index_by_code(accessory_files, names)
            missing_acc = [code for code in spec["order"] if code not in by_code]
            if missing_acc:
                print(f"WARNING {slug} accessories missing {missing_acc}", flush=True)
            for index, code in enumerate(spec["order"], start=1):
                if code not in by_code:
                    continue
                rel = f"{slug}/accessories/{index:02d}-{code}.webp"
                url = stage_image(by_code[code], rel, GALLERY_EDGE)
                acc_gallery.append(variant(names[code], url))

        if acc_gallery:
            urls = [item["imageUrl"] for item in acc_gallery]
            payload["collections"].append(
                {
                    "slug": f"acc-{slug}",
                    "image": urls[0],
                    "images": urls,
                    "galleryVariants": acc_gallery,
                }
            )

    manifest = STAGE / "manifest.json"
    manifest.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(
        f"staged {len(jobs)} images, {len(payload['products'])} products, "
        f"{len(payload['collections'])} accessory sets",
        flush=True,
    )
    return payload


APPLY_JS = r"""
const fs = require('fs');
const mysql = require('/var/www/comfort/server/node_modules/mysql2/promise');

for (const line of fs.readFileSync('/var/www/comfort/server/.env', 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = value;
}

(async () => {
  const payload = JSON.parse(fs.readFileSync('/tmp/shockproof-update.json', 'utf8'));
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'comfort',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'comfort',
  });
  for (const product of payload.products) {
    const [result] = await conn.query(
      `UPDATE products
       SET images = ?, gallery_variants = ?, textures = ?, updated_at = NOW()
       WHERE slug = ?`,
      [
        JSON.stringify(product.images),
        JSON.stringify(product.galleryVariants),
        JSON.stringify(product.textures),
        product.slug,
      ],
    );
    if (result.affectedRows !== 1) {
      throw new Error(`product ${product.slug} affected ${result.affectedRows}`);
    }
    console.log(
      'product',
      product.slug,
      'gallery',
      product.galleryVariants.length,
      'textures',
      product.textures.length,
    );
  }
  for (const collection of payload.collections) {
    const [result] = await conn.query(
      `UPDATE collections
       SET image = ?, images = ?, gallery_variants = ?, updated_at = NOW()
       WHERE slug = ?`,
      [
        collection.image,
        JSON.stringify(collection.images),
        JSON.stringify(collection.galleryVariants),
        collection.slug,
      ],
    );
    if (result.affectedRows !== 1) {
      throw new Error(`collection ${collection.slug} affected ${result.affectedRows}`);
    }
    console.log('collection', collection.slug, 'images', collection.images.length);
  }
  if (payload.category) {
    const [result] = await conn.query(
      `UPDATE categories SET image = ?, updated_at = NOW() WHERE slug = ?`,
      [payload.category.image, payload.category.slug],
    );
    if (result.affectedRows !== 1) {
      throw new Error(`category affected ${result.affectedRows}`);
    }
    console.log('category', payload.category.slug);
  }
  await conn.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
"""


def upload_and_apply():
    host = os.environ["SHOCKPROOF_HOST"]
    password = os.environ["SHOCKPROOF_SSH_PASS"]
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        host,
        username="root",
        password=password,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )
    sftp = client.open_sftp()

    def mkdir_p(path):
        parts = path.strip("/").split("/")
        current = ""
        for part in parts:
            current += "/" + part
            try:
                sftp.stat(current)
            except OSError:
                sftp.mkdir(current)

    mkdir_p(REMOTE_DIR)
    files = [p for p in STAGE.rglob("*") if p.is_file() and p.suffix != ".json"]
    for index, path in enumerate(files, start=1):
        rel = path.relative_to(STAGE).as_posix()
        remote = f"{REMOTE_DIR}/{rel}"
        mkdir_p(os.path.dirname(remote))
        print(f"  upload {index}/{len(files)} {rel}", flush=True)
        sftp.put(str(path), remote)
    sftp.close()

    sftp = client.open_sftp()
    with sftp.file("/tmp/shockproof-update.json", "w") as handle:
        handle.write((STAGE / "manifest.json").read_text(encoding="utf-8"))
    with sftp.file("/tmp/shockproof-apply.js", "w") as handle:
        handle.write(APPLY_JS)
    sftp.close()

    stdin, stdout, stderr = client.exec_command(
        "node /tmp/shockproof-apply.js",
        timeout=120,
    )
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    print(out)
    if err.strip():
        print(err)
    client.exec_command("rm -f /tmp/shockproof-update.json /tmp/shockproof-apply.js")
    client.close()
    if code != 0:
        raise SystemExit(f"apply failed with {code}")


def apply_only():
    host = os.environ["SHOCKPROOF_HOST"]
    password = os.environ["SHOCKPROOF_SSH_PASS"]
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        host,
        username="root",
        password=password,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )
    sftp = client.open_sftp()
    with sftp.file("/tmp/shockproof-update.json", "w") as handle:
        handle.write((STAGE / "manifest.json").read_text(encoding="utf-8"))
    with sftp.file("/tmp/shockproof-apply.js", "w") as handle:
        handle.write(APPLY_JS)
    sftp.close()
    stdin, stdout, stderr = client.exec_command("node /tmp/shockproof-apply.js", timeout=120)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    print(out)
    if err.strip():
        print(err)
    client.exec_command("rm -f /tmp/shockproof-update.json /tmp/shockproof-apply.js")
    client.close()
    if code != 0:
        raise SystemExit(f"apply failed with {code}")


def main():
    if "--apply-only" in sys.argv:
        apply_only()
    else:
        build()
        upload_and_apply()
    print("done")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(1)
