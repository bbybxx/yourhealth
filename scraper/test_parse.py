import sys
sys.path.insert(0, '.')
import scraper

out = []

# 1. Categories from home page
html = open('/tmp/vit_home.html', encoding='utf-8').read()
cats = scraper.parse_categories(html)
out.append('top-level cats: %d' % len(cats))
for c in cats[:25]:
    out.append('  %s %s children=%d' % (c.get('id'), c.get('name'), len(c.get('children') or [])))

# 1b. menuData: все вкладки
menu = scraper.parse_menu(html)
out.append('menuData keys: %s' % sorted(menu.keys()))
for key in ('catalog_categories', 'catalog_supplements', 'brands', 'food_additives'):
    nodes = menu.get(key) or []
    rows = scraper.flatten_categories(nodes)
    out.append('  %s: top=%d flat=%d' % (key, len(nodes), len(rows)))

# 2. Product ids from category page
cat_html = open('/tmp/vit_cat.html', encoding='utf-8').read()
ids = scraper.parse_product_ids_from_page(cat_html)
out.append('product ids on cat page: %d %s' % (len(ids), sorted(ids)[:5]))
pag = scraper.parse_pagination(cat_html)
out.append('pagination: %r' % (pag,))

# 2b. Product ids from brand page
brand_html = open('/tmp/mollers.html', encoding='utf-8').read()
bids = scraper.parse_product_ids_from_page(brand_html)
out.append('product ids on brand page: %d %s' % (len(bids), sorted(bids)[:5]))

# 3. Product card
prod_html = open('/tmp/vit_prod.html', encoding='utf-8').read()
data = scraper.parse_product(prod_html, 2518)
if data:
    out.append('product name: %s' % data['name'])
    out.append('  desc len: %d' % len(data['description'] or ''))
    out.append('  specs len: %d' % len(data['specs'] or ''))
    out.append('  app len: %d' % len(data['application'] or ''))
    out.append('  comp len: %d' % len(data['composition'] or ''))
    out.append('  disc len: %d' % len(data['disclaimer'] or ''))
    out.append('  price: %s final: %s' % (data['price'], data['final_price']))
    out.append('  images: %d' % len(data['images']))
    for im in data['images'][:3]:
        out.append('    %s main=%s' % (im['url'][:80], im['is_main']))
else:
    out.append('PRODUCT PARSE FAILED')

with open('/tmp/out.txt', 'w') as f:
    f.write('\n'.join(out))
