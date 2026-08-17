import sys, time
sys.path.insert(0, '.')
import scraper

t0 = time.time()
html = open('/tmp/vit_home.html', encoding='utf-8').read()
print('read', len(html), 'bytes in', round(time.time()-t0, 2), 's')

t0 = time.time()
payloads = scraper.extract_json_payloads(html)
print('payloads:', len(payloads), 'in', round(time.time()-t0, 2), 's')

# menuData: все вкладки
menu = scraper.parse_menu(html)
print('menuData keys:', sorted(menu.keys()))
for key in ('catalog_categories', 'catalog_supplements', 'brands', 'food_additives'):
    nodes = menu.get(key) or []
    rows = scraper.flatten_categories(nodes)
    print('  %s: top=%d flat=%d' % (key, len(nodes), len(rows)))

# Показать контекст initialProducts из декодированного payload
for p in payloads:
    if 'initialProducts' in p:
        i = p.find('initialProducts')
        print('CTX:', repr(p[i:i+300]))
        break
