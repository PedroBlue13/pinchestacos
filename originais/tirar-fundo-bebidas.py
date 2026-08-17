"""As fotos de bebida do iFood vem com fundo branco chapado. Sobre o card escuro isso
vira um retangulo branco. Aqui removemos SO o branco ligado a borda (preenchimento por
inundacao), preservando os brancos internos do rotulo — o gargalo da Corona, o 'ZERO'
da lata, a espuma."""
import json, os, sys
from collections import deque
from PIL import Image, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

RAIZ = r'c:\Users\Pedro\OneDrive\Documents\pinchestacos'
IFOOD = os.path.join(RAIZ, 'Pinches Tacos - comida mexicana _ CURITIBA _ iFood_files')
SCRATCH = os.path.dirname(os.path.abspath(__file__))
FUNDO = (13, 11, 10)
LARG, PROP = 420, 4 / 3
LIMITE = 236          # >= isso em todos os canais conta como fundo candidato


def slug(n):
    import re, unicodedata
    n = unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


def tirar_fundo(im):
    """Inundacao a partir das bordas: so o branco conectado a moldura vira transparente."""
    im = im.convert('RGB')
    w, h = im.size
    px = im.load()
    fundo = bytearray(w * h)           # 1 = fundo
    fila = deque()

    def claro(x, y):
        r, g, b = px[x, y]
        return r >= LIMITE and g >= LIMITE and b >= LIMITE

    for x in range(w):
        for y in (0, h - 1):
            if claro(x, y) and not fundo[y * w + x]:
                fundo[y * w + x] = 1; fila.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if claro(x, y) and not fundo[y * w + x]:
                fundo[y * w + x] = 1; fila.append((x, y))

    while fila:
        x, y = fila.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not fundo[ny * w + nx] and claro(nx, ny):
                fundo[ny * w + nx] = 1; fila.append((nx, ny))

    alfa = Image.frombytes('L', (w, h), bytes(255 if not v else 0 for v in fundo))
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.6))    # suaviza o serrilhado
    saida = im.convert('RGBA')
    saida.putalpha(alfa)
    return saida, sum(fundo) / (w * h)


def conter(im):
    alt = round(LARG / PROP)
    tela = Image.new('RGB', (LARG, alt), FUNDO)
    im = im.copy()
    im.thumbnail((int(LARG * 0.74), int(alt * 0.86)), Image.LANCZOS)   # respiro em volta
    tela.paste(im, ((LARG - im.width) // 2, (alt - im.height) // 2), im)
    return tela


dados = json.load(open(os.path.join(RAIZ, 'originais', 'cardapio.json'), encoding='utf-8'))
bebidas = next(g for g in dados['grupos'] if g['cat'] == 'Bebidas')

print(f'{"item":<48} {"fundo removido":>15}  saida')
for it in bebidas['itens']:
    if not it['img']:
        print(f'{it["nome"]:<48} {"— sem foto":>15}')
        continue
    origem = os.path.join(IFOOD, it['img'])
    if not os.path.exists(origem):
        print(f'{it["nome"]:<48} {"— arquivo ausente":>15}')
        continue
    rec, frac = tirar_fundo(Image.open(origem))
    final = conter(rec)
    nome = slug(it['nome'])
    final.save(os.path.join(RAIZ, 'img', 'cardapio', nome + '.webp'), 'WEBP', quality=82, method=6)
    final.save(os.path.join(RAIZ, 'img', 'cardapio', nome + '.jpg'), 'JPEG', quality=84,
               optimize=True, progressive=True)
    kb = os.path.getsize(os.path.join(RAIZ, 'img', 'cardapio', nome + '.webp')) / 1024
    print(f'{it["nome"]:<48} {frac*100:14.0f}%  {final.size[0]}x{final.size[1]} {kb:.0f}K')
