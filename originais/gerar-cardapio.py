"""Gera o bloco HTML do cardapio a partir dos dados extraidos do iFood.

USO
    python originais/gerar-cardapio.py

Le  : originais/cardapio.json           (dados)
Le  : originais/index-modelo.html       (molde com os marcadores)
Grava: index.html                       (o site que vai pro ar)

O index.html gerado e HTML puro e comum — voce pode edita-lo direto na mao.
Este script so existe para reimportar o cardapio inteiro de uma vez.
Ver README, secao "Trocar o cardapio".
"""
import html as H
import json
import os
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
PRECO_BEBIDA_COMBO = 900          # centavos — conferido: todos os combos do iFood sao +R$ 9,00


def slug(n):
    n = unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


def brl(centavos):
    return f'R$ {centavos // 100},{centavos % 100:02d}'


def e(t):
    return H.escape(t, quote=True)


def existe_img(nome):
    return os.path.exists(os.path.join(RAIZ, 'img', 'cardapio', nome + '.webp'))


# ---------------------------------------------------------------- selos
def selos_do_item(it, e_bebida):
    out = []
    if it.get('promo'):
        out.append(('promo', 'Promo'))
    for s in it.get('selos', []):
        if s == 'Vegano':
            out.append(('vegano', 'Vegano'))
        elif s == 'Vegetariano' and 'Vegano' not in it.get('selos', []):
            out.append(('veg', 'Vegetariano'))
    d = it.get('desc', '').lower()
    if 'picante)' in d or 'chipotle' in d:
        out.append(('picante', 'Picante'))
    return out


def meta_do_item(it):
    """Selos discretos que ficam no corpo do card, nao sobre a foto."""
    out = []
    if it.get('serve') == 1:
        out.append('Serve 1 pessoa')
    elif it.get('serve'):
        out.append(f"Serve {it['serve']} pessoas")
    if 'picante é enviado a parte' in it.get('desc', '') or 'picante e enviado a parte' in it.get('desc', ''):
        out.append('Picante à parte')
    return out


# ---------------------------------------------------------------- cards
def card(it, com_combo, e_bebida):
    nome = it['nome']
    sl = slug(nome)
    cent = it['centavos']
    tem_combo = nome in com_combo
    img_ok = existe_img(sl)

    selos = selos_do_item(it, e_bebida)
    bloco_selos = ''
    if selos:
        bloco_selos = '\n            <div class="prato__selos">' + ''.join(
            f'<span class="selo selo--{k}">{e(v)}</span>' for k, v in selos) + '</div>'

    if img_ok:
        classe_foto = 'prato__foto prato__foto--conter' if e_bebida else 'prato__foto'
        foto = f'''<div class="{classe_foto}">
            <img src="img/cardapio/{sl}.webp" alt="{e(nome)}" width="640" height="480"
                 loading="lazy" decoding="async"
                 onerror="this.onerror=null;this.src='img/cardapio/{sl}.jpg'">{bloco_selos}
          </div>'''
    else:
        foto = f'''<div class="prato__foto prato__foto--vazia">
            <svg class="icone" style="width:34px;height:34px" aria-hidden="true"><use href="#i-sacola"></use></svg>{bloco_selos}
          </div>'''

    metas = meta_do_item(it)
    bloco_meta = ''
    if metas:
        bloco_meta = '\n            <div class="prato__meta">' + ''.join(
            f'<span class="selo">{e(m)}</span>' for m in metas) + '</div>'

    desc = f'\n            <p class="prato__desc">{e(it["desc"])}</p>' if it['desc'] else ''
    combo_nota = ('\n              <span class="prato__combo">bebida +R$ 9,00</span>' if tem_combo else '')

    return f'''        <li class="prato" data-prato
            data-id="{sl}"
            data-nome="{e(nome)}"
            data-preco="{cent}"
            data-img="img/cardapio/{sl}.webp"
            data-desc="{e(it['desc'])}"
            data-combo="{'sim' if tem_combo else 'nao'}"
            data-rapido="{'sim' if e_bebida else 'nao'}">
          {foto}
          <div class="prato__corpo">
            <h4 class="prato__nome">{e(nome)}</h4>{desc}{bloco_meta}
            <div class="prato__pe">
              <p class="prato__preco">{brl(cent)}{combo_nota}</p>
              <button class="prato__add" type="button" data-add
                      aria-label="Adicionar {e(nome)} à sacola">
                <svg class="icone" aria-hidden="true"><use href="#i-mais"></use></svg>
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </li>'''


def main():
    dados = json.load(open(os.path.join(AQUI, 'cardapio.json'), encoding='utf-8'))
    grupos, com_combo = dados['grupos'], set(dados['com_combo'])

    # --- navegacao por ancora
    nav = []
    for g in grupos:
        gs = slug(g['cat'])
        nav.append(f'''          <a class="categorias__link" href="#cat-{gs}" data-cat="cat-{gs}">
            {e(g['cat'])} <span class="categorias__contagem">{len(g['itens'])}</span>
          </a>''')

    # --- grupos
    blocos = []
    for g in grupos:
        gs = slug(g['cat'])
        e_bebida = g['cat'] == 'Bebidas'
        nota = ''
        if g['cat'] == 'Pinches Promos':
            nota = ('<p class="grupo__nota">Combos com cerveja. Bebida alcoólica só para maiores '
                    'de 18 anos — a idade é conferida na entrega.</p>')
        elif e_bebida:
            nota = ('<p class="grupo__nota">Cervejas são bebidas alcoólicas e só saem para maiores '
                    'de 18 anos, com conferência de documento na entrega.</p>')
        cards = '\n'.join(card(it, com_combo, e_bebida) for it in g['itens'])
        blocos.append(f'''      <section class="grupo" id="cat-{gs}" aria-labelledby="t-{gs}">
        <div class="grupo__cabeca">
          <h3 class="grupo__titulo" id="t-{gs}">{e(g['cat'])}</h3>
          <span class="grupo__conta">{len(g['itens'])} {'item' if len(g['itens']) == 1 else 'itens'}</span>
        </div>
        {nota}
        <ul class="pratos">
{cards}
        </ul>
      </section>''')

    modelo = open(os.path.join(AQUI, 'index-modelo.html'), encoding='utf-8').read()
    saida = (modelo
             .replace('<!--{{NAV_CATEGORIAS}}-->', '\n'.join(nav))
             .replace('<!--{{GRUPOS}}-->', '\n\n'.join(blocos)))

    assert '<!--{{' not in saida, 'sobrou marcador sem preencher no molde'   # armadilhas 21

    destino = os.path.join(RAIZ, 'index.html')
    open(destino, 'w', encoding='utf-8', newline='\n').write(saida)

    n = sum(len(g['itens']) for g in grupos)
    print(f'index.html gerado: {len(grupos)} categorias, {n} itens, '
          f'{len(com_combo)} com opção de bebida ({os.path.getsize(destino)/1024:.0f} KB)')


if __name__ == '__main__':
    main()
