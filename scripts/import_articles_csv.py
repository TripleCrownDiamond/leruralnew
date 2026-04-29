#!/usr/bin/env python3
import csv
import datetime as dt
import re
import sqlite3
import sys
from io import BytesIO
from pathlib import Path
from typing import Optional, Tuple

import requests
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / 'database' / 'database.sqlite'
PUBLIC_DIR = ROOT / 'public'
IMAGE_BASE_DIR = PUBLIC_DIR / 'uploads' / 'articles' / 'imported'


def parse_date(value: str) -> dt.datetime:
    value = (value or '').strip()
    if not value:
        return dt.datetime.now()
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
        try:
            return dt.datetime.strptime(value, fmt)
        except ValueError:
            continue
    return dt.datetime.now()


def slugify(value: str) -> str:
    value = (value or '').lower().strip()
    value = re.sub(r"[\s_]+", '-', value)
    value = re.sub(r"[^a-z0-9\-]", '', value)
    value = re.sub(r"-+", '-', value).strip('-')
    return value or 'article'


def excerpt(text: str, length: int = 280) -> str:
    text = re.sub(r'\s+', ' ', (text or '')).strip()
    if len(text) <= length:
        return text
    return text[: length - 1].rstrip() + '...'


def reading_time_minutes(content: str) -> int:
    words = re.findall(r"\w+", content or '')
    return max(1, round(len(words) / 220)) if words else 1


def ensure_slug_unique(cur: sqlite3.Cursor, base_slug: str, article_id_hint: str) -> str:
    slug = base_slug
    cur.execute('SELECT id FROM articles WHERE slug = ?', (slug,))
    if cur.fetchone() is None:
        return slug

    suffix = slugify(str(article_id_hint))
    slug = f"{base_slug}-{suffix}" if suffix else f"{base_slug}-import"
    cur.execute('SELECT id FROM articles WHERE slug = ?', (slug,))
    if cur.fetchone() is None:
        return slug

    i = 2
    while True:
        candidate = f"{slug}-{i}"
        cur.execute('SELECT id FROM articles WHERE slug = ?', (candidate,))
        if cur.fetchone() is None:
            return candidate
        i += 1


def download_and_compress_image(url: str, slug: str, published_at: dt.datetime, article_id: str) -> Tuple[Optional[str], Optional[str]]:
    url = (url or '').strip()
    if not url:
        return None, None

    try:
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; LeRuralImporter/1.0)'}
        r = requests.get(url, timeout=25, headers=headers)
        r.raise_for_status()

        img = Image.open(BytesIO(r.content))
        img = ImageOps.exif_transpose(img)
        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        elif img.mode == 'L':
            img = img.convert('RGB')

        max_width = 1600
        if img.width > max_width:
            ratio = max_width / float(img.width)
            new_h = int(img.height * ratio)
            img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)

        year = str(published_at.year)
        month = f"{published_at.month:02d}"
        rel_dir = Path('uploads') / 'articles' / 'imported' / year / month
        dest_dir = PUBLIC_DIR / rel_dir
        dest_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{slug}-{article_id}.jpg"
        dest = dest_dir / filename

        img.save(dest, format='JPEG', quality=82, optimize=True, progressive=True)

        return '/' + str((rel_dir / filename).as_posix()), None
    except (requests.RequestException, UnidentifiedImageError, OSError) as exc:
        return None, str(exc)


def load_categories(cat_csv: Path, conn: sqlite3.Connection) -> dict:
    cur = conn.cursor()
    slug_to_id = {}

    with cat_csv.open('r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            slug = slugify(row.get('Slug', ''))
            if not slug:
                continue
            name_fr = (row.get('Categorie') or '').strip() or slug.replace('-', ' ').title()
            name_en = (row.get('Traduction') or '').strip() or name_fr
            order = int((row.get('Ordre') or '0').strip() or 0)
            published = 1

            cur.execute('SELECT id FROM categories WHERE slug = ?', (slug,))
            found = cur.fetchone()
            now = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            if found:
                category_id = int(found[0])
                cur.execute(
                    '''
                    UPDATE categories
                    SET name_fr = ?, name_en = ?, "order" = ?, published = ?, updated_at = ?
                    WHERE id = ?
                    ''',
                    (name_fr, name_en, order, published, now, category_id),
                )
            else:
                cur.execute(
                    '''
                    INSERT INTO categories (slug, name_fr, name_en, "order", published, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''',
                    (slug, name_fr, name_en, order, published, now, now),
                )
                category_id = int(cur.lastrowid)

            slug_to_id[slug] = category_id

    conn.commit()
    return slug_to_id


def import_articles(article_csv: Path, category_map: dict, conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    total = 0
    inserted = 0
    updated = 0
    images_ok = 0
    images_failed = 0

    with article_csv.open('r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1

            article_id = (row.get('ArticleID') or '').strip() or str(total)
            title = (row.get('TitreOriginal') or row.get('TitreCamelCase') or '').strip()
            title_en = (row.get('TitreCamelCase') or title).strip() or 'Untitled'
            base_slug = slugify((row.get('SlugArticle') or '').strip() or title)
            if not base_slug:
                base_slug = f"article-{article_id}"

            content = (row.get('ContenuDeveloppe') or row.get('ContenuOriginal') or '').strip()
            if not content:
                content = (row.get('ContenuOriginal') or '').strip()

            excerpt_fr = excerpt(content)
            excerpt_en = excerpt(content)
            published_at = parse_date(row.get('DatePublication') or '')
            published_at_str = published_at.strftime('%Y-%m-%d %H:%M:%S')
            now = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            category_slug = slugify((row.get('CategorieSlug') or '').strip())
            category_id = category_map.get(category_slug)

            image_path, image_error = download_and_compress_image(
                row.get('ImageURL') or '',
                base_slug,
                published_at,
                article_id,
            )
            if image_path:
                images_ok += 1
            elif (row.get('ImageURL') or '').strip():
                images_failed += 1

            read_count = int(float((row.get('NombreVues') or '0').strip() or 0))
            comments_count = int(float((row.get('NombreCommentaires') or '0').strip() or 0))

            cur.execute('SELECT id, slug FROM articles WHERE slug = ?', (base_slug,))
            existing = cur.fetchone()

            if existing:
                article_db_id = int(existing[0])
                cur.execute(
                    '''
                    UPDATE articles
                    SET title_fr = ?, title_en = ?, excerpt_fr = ?, excerpt_en = ?,
                        content_fr = ?, content_en = ?, featured_image = ?,
                        is_premium = 0, price = NULL, published_at = NULL,
                        author_name = ?, read_count = ?, likes_count = 0, comments_count = ?,
                        category_id = ?, author_id = NULL,
                        meta_title = ?, meta_description = ?, focus_keyword = ?,
                        reading_time = ?, is_featured = 0, featured_until = NULL,
                        updated_at = ?
                    WHERE id = ?
                    ''',
                    (
                        title or 'Sans titre',
                        title_en,
                        excerpt_fr,
                        excerpt_en,
                        content,
                        content,
                        image_path,
                        'LE RURAL',
                        read_count,
                        comments_count,
                        category_id,
                        (title or 'Sans titre')[:255],
                        excerpt_fr,
                        (row.get('Categorie') or '').strip()[:255],
                        reading_time_minutes(content),
                        now,
                        article_db_id,
                    ),
                )
                updated += 1
            else:
                slug = ensure_slug_unique(cur, base_slug, article_id)
                cur.execute(
                    '''
                    INSERT INTO articles (
                        slug, title_fr, title_en, excerpt_fr, excerpt_en, content_fr, content_en,
                        featured_image, is_premium, price, published_at, author_name,
                        read_count, likes_count, comments_count, category_id,
                        created_at, updated_at, author_id,
                        meta_title, meta_description, focus_keyword, reading_time,
                        is_featured, featured_until
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?, ?, 0, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 0, NULL)
                    ''',
                    (
                        slug,
                        title or 'Sans titre',
                        title_en,
                        excerpt_fr,
                        excerpt_en,
                        content,
                        content,
                        image_path,
                        'LE RURAL',
                        read_count,
                        comments_count,
                        category_id,
                        published_at_str,
                        now,
                        (title or 'Sans titre')[:255],
                        excerpt_fr,
                        (row.get('Categorie') or '').strip()[:255],
                        reading_time_minutes(content),
                    ),
                )
                article_db_id = int(cur.lastrowid)
                inserted += 1

            if category_id:
                cur.execute(
                    'SELECT id FROM article_category WHERE article_id = ? AND category_id = ?',
                    (article_db_id, category_id),
                )
                if cur.fetchone() is None:
                    cur.execute(
                        'INSERT INTO article_category (article_id, category_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
                        (article_db_id, category_id, now, now),
                    )

            if total % 50 == 0:
                conn.commit()
                print(f"Processed {total} articles...", flush=True)

            if image_error and total % 200 == 0:
                print(f"Image warning sample ({base_slug}): {image_error}", flush=True)

    conn.commit()

    print('--- Import summary ---')
    print(f'Total rows: {total}')
    print(f'Inserted: {inserted}')
    print(f'Updated: {updated}')
    print(f'Images downloaded/compressed: {images_ok}')
    print(f'Images failed: {images_failed}')


def main() -> int:
    if len(sys.argv) != 3:
        print('Usage: python scripts/import_articles_csv.py <articles_csv> <categories_csv>')
        return 1

    article_csv = Path(sys.argv[1])
    categories_csv = Path(sys.argv[2])

    if not article_csv.exists() or not categories_csv.exists():
        print('CSV file not found.')
        return 1
    if not DB_PATH.exists():
        print(f'Database not found: {DB_PATH}')
        return 1

    IMAGE_BASE_DIR.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.execute('PRAGMA foreign_keys = ON')

    try:
        category_map = load_categories(categories_csv, conn)
        print(f'Categories ready: {len(category_map)}')
        import_articles(article_csv, category_map, conn)
    finally:
        conn.close()

    return 0


if __name__ == '__main__':
    raise SystemExit(main())