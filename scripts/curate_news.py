#!/usr/bin/env python3
"""
scripts/curate_news.py - Automated News Ingest & Importance Scorer for DEFLOCK NWA.
Fetches public RSS feeds, scores relevance/authority/locality, and maintains data/news.json.
Runs via GitHub Actions or locally without external dependencies.
"""

import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'news.json')

RSS_FEEDS = [
    'https://news.google.com/rss/search?q=Flock+Safety+license+plate&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=ALPR+surveillance+Arkansas&hl=en-US&gl=US&ceid=US:en',
]

LOCAL_KEYWORDS = [
    'arkansas', 'benton', 'washington county', 'fayetteville', 'springdale',
    'rogers', 'bentonville', 'pea ridge', 'centerton', 'farmington',
    'bella vista', 'siloam springs', 'nwa', 'northwest arkansas'
]

AUTHORITY_DOMAINS = [
    'eff.org', 'aclu.org', 'ij.org', 'washingtonpost.com', 'wired.com',
    'forbes.com', '404media.co', 'apnews.com', 'reuters.com', 'cbsnews.com',
    'nbcnews.com', 'theintercept.com', 'gizmodo.com', 'techdirt.com'
]

WIN_KEYWORDS = [
    'ban', 'banned', 'bans', 'discontinue', 'discontinues', 'reject', 'rejects',
    'terminate', 'terminates', 'cancel', 'canceled', 'expire', 'unanimous',
    'halt', 'halts', 'end contract', 'prohibit', 'prohibits', 'removal', 'walk away'
]

FLAG_KEYWORDS = [
    'abuse', 'misuse', 'stalking', 'stalk', 'charged', 'arrested', 'fired',
    'wrongful', 'innocent', 'warrantless', 'ice', 'abortion', 'lawsuit', 'sued',
    'secret', 'leak', 'investigation', 'lied', 'tracking', 'hack', 'breach'
]

def load_existing():
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {DATA_PATH}: {e}")
    return []

def save_data(articles):
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(articles)} articles to {DATA_PATH}")

def fetch_rss(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            xml_text = resp.read()
            return ET.fromstring(xml_text)
    except Exception as e:
        print(f"Failed to fetch RSS from {url}: {e}")
        return None

def score_article(title, snippet, url):
    text = f"{title} {snippet} {url}".lower()

    # Locality check
    is_local = any(kw in text for kw in LOCAL_KEYWORDS)
    locality_score = 40 if is_local else 0

    # Authority check
    is_authority = any(dom in url.lower() for dom in AUTHORITY_DOMAINS)
    authority_score = 25 if is_authority else 0

    # Type detection
    win_matches = sum(1 for kw in WIN_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', text))
    flag_matches = sum(1 for kw in FLAG_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', text))

    if win_matches > flag_matches:
        art_type = 'win'
        type_score = min(win_matches * 8, 25)
    else:
        art_type = 'flag'
        type_score = min(flag_matches * 8, 25)

    base_score = 30 + locality_score + authority_score + type_score
    return min(base_score, 100), art_type, ('local' if is_local else 'national')

def clean_source(title):
    parts = title.rsplit(' - ', 1)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    return title.strip(), 'News Report'

def normalize_title(title):
    return re.sub(r'[^a-z0-9]', '', title.lower())

def run():
    existing = load_existing()
    existing_titles = {normalize_title(a.get('headline', '')): a for a in existing}
    existing_urls = {a.get('url', ''): a for a in existing}

    new_candidates = []

    for feed_url in RSS_FEEDS:
        root = fetch_rss(feed_url)
        if root is None:
            continue

        channel = root.find('channel')
        if channel is None:
            continue

        for item in channel.findall('item'):
            raw_title = item.findtext('title', '')
            link = item.findtext('link', '')
            pub_date = item.findtext('pubDate', '')
            desc = item.findtext('description', '')

            headline, source = clean_source(raw_title)
            norm = normalize_title(headline)

            if norm in existing_titles or link in existing_urls:
                continue

            score, art_type, scope = score_article(headline, desc, link)

            # Only accept stories with a reasonable significance score
            if score < 50:
                continue

            # Format date: e.g. "Oct 2026"
            date_str = pub_date
            try:
                dt = datetime.strptime(pub_date[:16], '%a, %d %b %Y')
                date_str = dt.strftime('%b %Y')
            except Exception:
                pass

            clean_excerpt = re.sub(r'<[^>]+>', '', desc).strip()
            if len(clean_excerpt) > 180:
                clean_excerpt = clean_excerpt[:177] + '...'

            candidate = {
                "type": art_type,
                "scope": scope,
                "headline": headline,
                "excerpt": clean_excerpt or headline,
                "source": source,
                "date": date_str,
                "url": link,
                "score": score,
                "pinned": False,
                "added_at": datetime.now(timezone.utc).isoformat()
            }
            new_candidates.append(candidate)
            existing_titles[norm] = candidate
            existing_urls[link] = candidate

    print(f"Ingested {len(new_candidates)} new candidate articles.")

    # Merge candidates into existing list
    all_articles = existing + new_candidates

    # Partition by type
    wins = [a for a in all_articles if a.get('type') == 'win']
    flags = [a for a in all_articles if a.get('type') == 'flag']

    # Sort each list: pinned first, then by score descending
    def sort_key(a):
        return (1 if a.get('pinned') else 0, a.get('score', 50))

    wins.sort(key=sort_key, reverse=True)
    flags.sort(key=sort_key, reverse=True)

    # Keep top 12 wins and top 16 flags (while preserving ALL pinned items)
    final_wins = [a for a in wins if a.get('pinned')]
    for a in wins:
        if not a.get('pinned') and len(final_wins) < 12:
            final_wins.append(a)

    final_flags = [a for a in flags if a.get('pinned')]
    for a in flags:
        if not a.get('pinned') and len(final_flags) < 16:
            final_flags.append(a)

    final_articles = final_wins + final_flags
    save_data(final_articles)

if __name__ == '__main__':
    run()
