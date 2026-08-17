"""Validacao por script: caminhos, ancoras, aria-controls, <use>, ordem de titulos, contraste."""
import os, re, sys, json
sys.stdout.reconfigure(encoding='utf-8')

RAIZ = r'c:\Users\Pedro\OneDrive\Documents\pinchestacos'
html = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
css = open(os.path.join(RAIZ, 'css', 'styles.css'), encoding='utf-8').read()
js = open(os.path.join(RAIZ, 'js', 'main.js'), encoding='utf-8').read()

erros, avisos = [], []

# ---------------------------------------------------------------- 1. arquivos
refs = set()
for m in re.finditer(r'(?:src|href)="([^"#:][^":]*?)"', html):
    u = m.group(1)
    if u.startswith(('http', 'mailto', 'tel', 'data:', '//')):
        continue
    refs.add(u.split('?')[0])
for m in re.finditer(r"this\.src='([^']+)'", html):      # fallback do onerror
    refs.add(m.group(1))
for m in re.finditer(r'url\(\.\./([^)]+)\)', css):
    refs.add(m.group(1))
for m in re.finditer(r'srcset="([^"]+)"', html):
    for parte in m.group(1).split(','):
        refs.add(parte.strip().split(' ')[0])

for r in sorted(refs):
    if not os.path.exists(os.path.join(RAIZ, r.replace('/', os.sep))):
        erros.append(f'arquivo inexistente: {r}')

# ---------------------------------------------------------------- 2. ancoras
ids = set(re.findall(r'\sid="([^"]+)"', html))
for m in re.finditer(r'href="#([^"]+)"', html):
    if m.group(1) and m.group(1) not in ids:
        erros.append(f'âncora sem destino: #{m.group(1)}')

# ------------------------------------------------------- 3. aria-controls etc
for attr in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
    for m in re.finditer(attr + r'="([^"]+)"', html):
        for alvo in m.group(1).split():
            if alvo not in ids:
                erros.append(f'{attr} aponta para id inexistente: {alvo}')
# os que o JS cria em tempo de execucao
for m in re.finditer(r"aria-controls=\"?'?\s*\+?", js):
    pass

# ---------------------------------------------------------------- 4. <use>
simbolos = set(re.findall(r'<symbol id="([^"]+)"', html))
usados = set(re.findall(r'<use href="#([^"]+)"', html)) | set(re.findall(r'#i-([a-z]+)"', js))
usados_js = set('i-' + s for s in re.findall(r"use href=\\?\"?#i-([a-z]+)", js))
for u in set(re.findall(r'<use href="#([^"]+)"', html)):
    if u not in simbolos:
        erros.append(f'<use> aponta para símbolo inexistente: #{u}')
for u in usados_js:
    if u not in simbolos:
        erros.append(f'JS usa símbolo inexistente: #{u}')
# icone dinamico lixo/menos
for extra in ('i-lixo', 'i-menos', 'i-mais', 'i-sacola', 'i-zap', 'i-volta', 'i-fechar'):
    if extra not in simbolos:
        erros.append(f'símbolo usado pelo JS não existe: #{extra}')
nao_usados = simbolos - set(re.findall(r'<use href="#([^"]+)"', html)) - usados_js
if nao_usados:
    avisos.append(f'símbolos declarados e nunca usados: {sorted(nao_usados)}')

# ------------------------------------------------------- 5. ordem de titulos
niveis = [int(m.group(1)) for m in re.finditer(r'<h([1-6])\b', html)]
h1 = niveis.count(1)
if h1 != 1:
    erros.append(f'deve haver exatamente um <h1>; encontrei {h1}')
ant = 0
for n in niveis:
    if ant and n > ant + 1:
        erros.append(f'pulo na hierarquia de títulos: h{ant} -> h{n}')
    ant = n

# ---------------------------------------------------------------- 6. imagens
for m in re.finditer(r'<img\b[^>]*>', html):
    tag = m.group(0)
    if 'alt=' not in tag:
        erros.append('img sem alt: ' + tag[:90])
    if 'width=' not in tag or 'height=' not in tag:
        avisos.append('img sem width/height (layout pula): ' + tag[:90])

# --------------------------------------------------------------- 7. contraste
def lum(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [(x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4) for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def contraste(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)

tok = dict(re.findall(r'--([\w-]+):\s*(#[0-9a-fA-F]{6});', css))
pares = [
    ('texto', 'fundo', 4.5), ('texto-2', 'fundo', 4.5), ('texto-3', 'fundo', 3.0),
    ('texto', 'superficie', 4.5), ('texto-2', 'superficie', 4.5),
    ('vermelho-vivo', 'fundo', 3.0), ('verde-vivo', 'fundo', 3.0),
    ('milho', 'fundo', 3.0), ('texto-2', 'fundo-2', 4.5),
]
print('--- contraste (WCAG) ---')
for fg, bg, alvo in pares:
    if fg in tok and bg in tok:
        r = contraste(tok[fg], tok[bg])
        ok = 'OK ' if r >= alvo else 'RUIM'
        linha = f'  {ok} {r:5.2f}:1  (min {alvo})  --{fg} sobre --{bg}'
        print(linha)
        if r < alvo:
            erros.append(f'contraste insuficiente {r:.2f}:1 — --{fg} sobre --{bg} (mínimo {alvo})')
# branco sobre vermelho (botao principal)
r = contraste('#ffffff', tok['vermelho'])
print(f'  {"OK " if r >= 4.5 else "RUIM"} {r:5.2f}:1  (min 4.5)  #fff sobre --vermelho (botão)')
if r < 4.5:
    avisos.append(f'branco sobre --vermelho dá {r:.2f}:1 — abaixo de 4.5 para texto normal')

# --------------------------------------------------------- 8. dados do menu
dados = json.load(open(os.path.join(RAIZ, 'originais', 'cardapio.json'), encoding='utf-8'))
n_dados = sum(len(g['itens']) for g in dados['grupos'])
n_html = len(re.findall(r'data-prato', html))
if n_dados != n_html:
    erros.append(f'{n_dados} itens nos dados mas {n_html} no HTML')

precos_html = re.findall(r'data-preco="(\d+)"', html)
soma_dados = sorted(str(it['centavos']) for g in dados['grupos'] for it in g['itens'])
if sorted(precos_html) != soma_dados:
    erros.append('preços do HTML não batem com os dados de origem')

# combos
n_combo = len(re.findall(r'data-combo="sim"', html))
if n_combo != len(dados['com_combo']):
    erros.append(f'{len(dados["com_combo"])} itens com combo nos dados, {n_combo} no HTML')

# --------------------------------------------------------------- 9. resumo
print(f'\nitens: {n_html} · combos: {n_combo} · ids: {len(ids)} · imagens: {len(re.findall(r"<img", html))}')
print(f'\n{"="*62}')
if erros:
    print(f'ERROS ({len(erros)}):')
    for e in erros:
        print('  x', e)
else:
    print('Nenhum erro.')
if avisos:
    print(f'\nAVISOS ({len(avisos)}):')
    for a in avisos:
        print('  !', a)

# ------------------------------------------------------------------ 10. peso
print(f'\n--- peso do primeiro carregamento (medido) ---')
primeiro = ['index.html', 'css/styles.css', 'js/main.js',
            'fonts/bebas-neue-latin.woff2', 'fonts/inter-latin.woff2',
            'img/hero-1100.webp', 'img/logo-96.webp']
tot = 0
for f in primeiro:
    p = os.path.join(RAIZ, f.replace('/', os.sep))
    s = os.path.getsize(p)
    tot += s
    print(f'  {s/1024:7.1f} KB  {f}')
print(f'  {"-"*7}')
print(f'  {tot/1024:7.1f} KB  TOTAL (meta: abaixo de 300 KB)')
