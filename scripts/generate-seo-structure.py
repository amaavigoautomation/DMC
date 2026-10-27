"""Generate static canonical tags and JSON-LD. Run from the repository root."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'SEO_SITE_CONFIG.json').read_text())
ORIGIN = CONFIG['canonical_origin'].rstrip('/')
META = json.loads((ROOT / 'SEO_PAGE_METADATA.json').read_text())

def plain(value):
    return html.unescape(re.sub(r'<[^>]+>', '', value)).strip()

def url(slug):
    if slug == 'uae': slug = 'dubai'
    return ORIGIN + ('/' if slug == 'index' else '/' + slug)

organization = {'@type': 'Organization', '@id': ORIGIN + '/#organization',
                'name': 'Puratech', 'url': url('about-puratech')}
website = {'@type': 'WebSite', '@id': ORIGIN + '/#website', 'name': 'DMC24',
           'url': url('index'), 'inLanguage': 'en',
           'publisher': {'@id': organization['@id']}}
software = {'@type': 'SoftwareApplication', '@id': ORIGIN + '/#software',
            'name': 'DMC24', 'url': url('what-is-dmc24'),
            'applicationCategory': 'BusinessApplication',
            'featureList': ['Sales and CRM', 'Supplier contracting', 'FIT and group quotations', 'Bookings and reservations', 'Operations and logistics', 'Operational finance and profitability', 'Dashboards and reporting'],
            'description': META['what-is-dmc24']['description'],
            'publisher': {'@id': organization['@id']}}
TRAILS = json.loads((ROOT / 'BREADCRUMBS.json').read_text())
PROFILE = json.loads((ROOT / 'AUTHOR_PROFILE.json').read_text())
DATES = json.loads((ROOT / 'ARTICLE_DATES.json').read_text())
person = {'@type':'Person', '@id':url(PROFILE['slug'])+'#person', 'name':PROFILE['author'], 'url':url(PROFILE['slug']), 'description':PROFILE['authorBio'], 'sameAs':[PROFILE['authorUrl']]}
report = {}
for path in sorted((ROOT / 'website').glob('*.html')):
    slug = path.stem
    # Existing owner/review tools are intentionally outside the public SEO manifest.
    if slug.endswith("-review") and slug not in META:
        continue
    source = path.read_text()
    meta = META[slug]
    source = re.sub(r'<title>.*?</title>', '<title>' + html.escape(meta['title']) + '</title>', source, count=1, flags=re.S)
    source = re.sub(r'<meta name="description" content="[^"]*"\s*/?>', '<meta name="description" content="' + html.escape(meta['description'], quote=True) + '">', source, count=1)
    page_type = CONFIG['page_types'].get(slug, 'WebPage')
    page = {'@type': page_type, '@id': url(slug) + '#webpage', 'url': url(slug),
            'name': meta['title'], 'description': meta['description'],
            'inLanguage': 'en', 'isPartOf': {'@id': website['@id']}}
    graph = [page, website, organization]
    if slug == PROFILE['slug']:
        page['mainEntity'] = {'@id':person['@id']}
        graph.append(person)
    if slug not in CONFIG['non_software_pages']:
        page['about'] = {'@id': software['@id']}
        graph.append(software)
    if slug in ['index', 'what-is-dmc24', 'about']:
        page['mainEntity'] = {'@id': software['@id']}
    if slug == 'about-puratech':
        page['mainEntity'] = {'@id': organization['@id']}
    if page_type == 'FAQPage':
        main = re.search(r'<main\b[^>]*>(.*?)</main>', source, re.S)[1]
        questions = re.findall(r'<div class="card"><h3>(.*?)</h3><p>(.*?)</p></div>', main, re.S)
        if not questions:
            questions = re.findall(r'<span class="faq-question">(.*?)</span>.*?<div class="faq-answer">(.*?)</div>', main, re.S)
        assert questions, 'FAQ content not found; update parser to match current markup'
        page['mainEntity'] = [{'@type': 'Question', 'name': plain(q),
                              'acceptedAnswer': {'@type': 'Answer', 'text': plain(a)}} for q,a in questions]
    if slug.startswith('case-study-') or slug in ['real-time-reports-dmc-leaders', 'how-to-adopt-dmc24', 'international-market-control', 'enquiry-to-confirmation', 'file-wise-booking-profitability', 'ai-itinerary-creation', 'contracts-and-travel-api-inventory', 'grow-revenue-through-local-sales', 'why-dmcs-need-specialist-software', 'connected-dmc-workflow', 'b2b-distribution-agent-needs', 'local-sales-revenue-after-arrival', 'what-multi-dmc-really-means', 'why-file-wise-pnl-matters']:
        article = {'@type': 'Article', '@id': url(slug) + '#article',
                   'headline': meta['h1'], 'description': meta['description'],
                   'inLanguage': 'en', 'mainEntityOfPage': {'@id': page['@id']},
                   'about': {'@id': software['@id']},
                   'publisher': {'@id': organization['@id']}}
        if slug in DATES:
            article['datePublished'] = DATES[slug]['publishedDate']
            if DATES[slug].get('modifiedAt'): article['dateModified'] = DATES[slug]['modifiedAt']
        if slug == 'how-to-adopt-dmc24':
            article['author'] = {'@id':person['@id']}
            graph.append(person)
        graph.append(article)
        page['mainEntity'] = {'@id': article['@id']}
    trail = TRAILS[slug]
    if len(trail) > 1:
        breadcrumb = {'@type': 'BreadcrumbList', '@id': url(slug) + '#breadcrumb',
                      'itemListElement': [{'@type': 'ListItem', 'position': i + 1,
                                           'name': item['name'], 'item': url(item['slug'])}
                                          for i, item in enumerate(trail)]}
        graph.append(breadcrumb)
        page['breadcrumb'] = {'@id': breadcrumb['@id']}
    items = []
    for i, item in enumerate(trail):
        label = html.escape(item['name'])
        if i == len(trail) - 1:
            content = '<span aria-current="page">' + label + '</span>'
        else:
            content = '<a href="' + item['slug'] + '.html">' + label + '</a>'
        items.append('<li>' + content + '</li>')
    nav = '<nav class="site-breadcrumbs" aria-label="Breadcrumb"><div class="container"><ol>' + ''.join(items) + '</ol></div></nav>'
    source = re.sub(r'<nav class="site-breadcrumbs".*?</nav>\n?', '', source, flags=re.S)
    if re.search(r'<main\b', source):
        source = re.sub(r'(<main\b)', lambda m: nav + '\n' + m[0], source, count=1)
    else:
        source = re.sub(r'(<body\b[^>]*>)', lambda m: m[0] + '\n' + nav, source, count=1)
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2).replace('<', '\\u003c')
    block = '\n<!-- BEGIN GENERATED SEO STRUCTURE -->\n' + '<link rel="canonical" href="' + html.escape(url(slug), quote=True) + '">\n' + '<script type="application/ld+json">\n' + data + '\n</script>\n<!-- END GENERATED SEO STRUCTURE -->\n'
    source = re.sub(r'\n?<!-- BEGIN GENERATED SEO STRUCTURE -->.*?<!-- END GENERATED SEO STRUCTURE -->\n?', '', source, flags=re.S)
    assert not re.search(r'rel=[\"\']canonical', source), f'Unmanaged canonical in {path}'
    source = source.replace('</head>', block + '</head>', 1)
    path.write_text(source)
    report[slug] = {'canonical': url(slug), 'page_type': page_type, 'schema_types': [x['@type'] for x in graph]}
(ROOT / 'SEO_SCHEMA_MANIFEST.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'Generated canonical and JSON-LD for {len(report)} pages')
