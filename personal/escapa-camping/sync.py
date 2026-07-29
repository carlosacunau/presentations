#!/usr/bin/env python3
"""
ES CA PA Camping Sync — reads Google Sheets via service account
and updates matrix.html + campeggio.html.

Runs both locally and in GitHub Actions.
"""
import json, re, os, sys, datetime, unicodedata, zoneinfo
from google.oauth2 import service_account
from googleapiclient.discovery import build
from namecase import name_case

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID', '1NutvWUnFoWsD0atbk9XYp02AIlxfotYGqMcweyqndSQ')
RANGE = 'A1:J300'

# --- Google Sheets ---
def read_sheet():
    creds_file = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if not creds_file:
        print("ERROR: GOOGLE_APPLICATION_CREDENTIALS not set", file=sys.stderr)
        sys.exit(1)
    creds = service_account.Credentials.from_service_account_file(creds_file, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID, range=RANGE
    ).execute()
    return result.get('values', [])

# --- Parsing helpers ---
def norm(s):
    return unicodedata.normalize('NFD', s).encode('ascii','ignore').decode().lower()

def first_name(full):
    full = full.strip()
    if not full or full in ('.', ' ', ''): return None
    return full.split()[0].title()

def parse_camps(camps_str):
    result = set()
    if 'Esploratori' in camps_str: result.add('e')
    if 'Campeggio' in camps_str: result.add('c')
    if 'Campisti' in camps_str: result.add('k')
    if 'Papimono' in camps_str: result.add('m')
    return result

def parse_sizes(size_str):
    if not size_str: return []
    return [s.strip() for s in size_str.split(',') if s.strip()]

def is_numeric_size(s):
    return bool(re.match(r'^\d', s))

def parse_kids_with_labels(text):
    camp_keywords = {'campisti':'k', 'campeggio':'c', 'esploratori':'e', 'papimono':'m'}
    kids = {}
    parts = re.split(r'[;.]', text)
    for part in parts:
        part = part.strip()
        if not part: continue
        found_camp = None
        clean_name = part
        for kw, key in camp_keywords.items():
            if kw.lower() in part.lower():
                found_camp = key
                clean_name = re.sub(r'[-\s]*' + kw, '', part, flags=re.IGNORECASE).strip()
                break
        name = first_name(clean_name)
        if name:
            kids[name] = found_camp
    return kids if any(v is not None for v in kids.values()) else None

def split_kids(raw):
    if not raw: return []
    raw = re.sub(r'\s+y\s+', ',', raw)
    raw = re.sub(r'\s+e\s+', ',', raw)
    parts = [p.strip() for p in raw.split(',') if p.strip()]
    return [first_name(p) for p in parts if first_name(p)]

# --- Main processing ---
def process_rows(raw_rows):
    grade_order = {'e':1, 'c':2, 'k':4, 'm':6}

    # Deduplicate: keep latest entry per normalized parent name
    seen = {}
    for row in raw_rows:
        if len(row) < 10: row += [''] * (10 - len(row))
        ts, camps, parent, phone, kid_major, kid_minor, exp, sizes, rating, comment = row[:10]
        if not parent or parent.strip() == '' or ts == 'Timestamp': continue
        key = norm(parent.strip())
        seen[key] = row

    data = []
    for row in seen.values():
        ts, camps_str, parent, phone, kid_major_raw, kid_minor_raw, exp, sizes_str, rating, comment = row[:10]

        parent = parent.strip()
        phone = (phone or '').strip()
        exp = (exp or '').strip()
        rating = (rating or '').strip()
        comment = (comment or '').strip()
        kid_major_raw = (kid_major_raw or '').strip()
        kid_minor_raw = (kid_minor_raw or '').strip()

        camps = parse_camps(camps_str)
        sizes = parse_sizes(sizes_str)

        parent_size = "—"
        kid_sizes = sizes[:]
        if sizes:
            if is_numeric_size(sizes[0]):
                kid_sizes = sizes
            else:
                parent_size = sizes[0]
                kid_sizes = sizes[1:]

        entry = {"p": name_case(parent), "ps": parent_size, "ph": phone, "ex": exp, "rt": rating, "cm": comment,
                 "e": [], "c": [], "k": [], "m": []}

        # Check for explicit camp labels in kid names
        labeled_major = parse_kids_with_labels(kid_major_raw)
        labeled_minor = parse_kids_with_labels(kid_minor_raw)

        if labeled_major or labeled_minor:
            size_idx = 0
            all_labeled = {}
            if labeled_major: all_labeled.update(labeled_major)
            if labeled_minor: all_labeled.update(labeled_minor)

            for name, camp_key in all_labeled.items():
                if camp_key and camp_key in camps:
                    s = kid_sizes[size_idx] if size_idx < len(kid_sizes) else "—"
                    entry[camp_key].append({"n": name, "s": s})
                    size_idx += 1

            unlabeled = {n for n, c in all_labeled.items() if c is None}
            if unlabeled:
                used_camps = {c for n, c in all_labeled.items() if c is not None}
                remaining = camps - used_camps
                for name in unlabeled:
                    if remaining:
                        camp = sorted(remaining, key=lambda x: grade_order.get(x, 0))[0]
                        s = kid_sizes[size_idx] if size_idx < len(kid_sizes) else "—"
                        entry[camp].append({"n": name, "s": s})
                        size_idx += 1
        else:
            major_kids = split_kids(kid_major_raw)
            minor_kids = split_kids(kid_minor_raw)

            # Remove duplicates (same kid in both fields)
            if minor_kids and major_kids and set(minor_kids) == set(major_kids):
                minor_kids = []

            # Filter bogus names
            major_kids = [n for n in major_kids if n and n not in ('.', 'Campegio')]
            minor_kids = [n for n in minor_kids if n and n not in ('.', ' ')]

            # Carlos Peralta typo: "Campegio" as kid name
            if kid_major_raw.strip().lower().startswith('campegio') and minor_kids:
                major_kids = minor_kids
                minor_kids = []

            camp_list = sorted(camps, key=lambda x: grade_order.get(x, 0))

            if len(camp_list) == 1:
                camp = camp_list[0]
                size_idx = 0
                for name in major_kids + minor_kids:
                    s = kid_sizes[size_idx] if size_idx < len(kid_sizes) else "—"
                    entry[camp].append({"n": name, "s": s})
                    size_idx += 1

            elif len(camp_list) >= 2:
                if len(major_kids) == 1 and len(minor_kids) <= 1:
                    highest = camp_list[-1]
                    lowest = camp_list[0]
                    entry[highest].append({"n": major_kids[0], "s": kid_sizes[0] if kid_sizes else "—"})
                    if minor_kids:
                        entry[lowest].append({"n": minor_kids[0], "s": kid_sizes[1] if len(kid_sizes) > 1 else "—"})

                    if 'm' in camps and len(camp_list) >= 3 and highest != 'm':
                        entry['m'].append({"n": major_kids[0], "s": kid_sizes[0] if kid_sizes else "—"})

                elif len(major_kids) > 1:
                    size_idx = 0
                    sorted_camps = sorted(camps, key=lambda x: grade_order.get(x, 0), reverse=True)
                    # Minors claim the lowest camps, so majors only fan out across
                    # what's left. When majors outnumber those camps the extras are
                    # siblings in the same camp (twins) and share the highest one.
                    major_camps = sorted_camps[:max(1, len(sorted_camps) - len(minor_kids))]
                    for i, name in enumerate(major_kids):
                        camp = major_camps[i] if i < len(major_camps) else major_camps[-1]
                        s = kid_sizes[size_idx] if size_idx < len(kid_sizes) else "—"
                        entry[camp].append({"n": name, "s": s})
                        size_idx += 1
                    for name in minor_kids:
                        lowest = camp_list[0]
                        s = kid_sizes[size_idx] if size_idx < len(kid_sizes) else "—"
                        entry[lowest].append({"n": name, "s": s})
                        size_idx += 1

                else:
                    # Fallback: one kid per camp, highest grade first.
                    # Majors get the highest camps, minors fill the rest going down.
                    # Covers e.g. 1 major + 2 minors across 3 camps (Piero).
                    size_idx = 0
                    sorted_camps = sorted(camps, key=lambda x: grade_order.get(x, 0), reverse=True)
                    camp_idx = 0
                    for name in major_kids + minor_kids:
                        camp = sorted_camps[camp_idx] if camp_idx < len(sorted_camps) else sorted_camps[-1]
                        s = kid_sizes[size_idx] if size_idx < len(kid_sizes) else "—"
                        entry[camp].append({"n": name, "s": s})
                        size_idx += 1
                        camp_idx += 1

        data.append(entry)

    data.sort(key=lambda d: norm(d['p'].split()[0]))
    return data

def update_html(filepath, data, timestamp):
    with open(filepath, 'r') as f:
        content = f.read()

    old_data = re.search(r'const DATA = \[.*?\];', content, re.DOTALL).group(0)
    content = content.replace(old_data, 'const DATA = ' + json.dumps(data, ensure_ascii=False) + ';')
    content = re.sub(r"const LAST_UPDATED = '[^']*';", "const LAST_UPDATED = '" + timestamp + "';", content)

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))

    rows = read_sheet()
    data = process_rows(rows)
    timestamp = datetime.datetime.now(zoneinfo.ZoneInfo('America/Santiago')).strftime('%d/%m %H:%M')

    update_html(os.path.join(script_dir, 'matrix.html'), data, timestamp)

    campeggio = [d for d in data if d['c']]
    update_html(os.path.join(script_dir, 'campeggio.html'), campeggio, timestamp)

    print(f"Synced — {len(data)} parents, {len(campeggio)} campeggio. Updated: {timestamp}")
