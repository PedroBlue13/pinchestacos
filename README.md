# Pinches Tacos — site

Site institucional de página única com cardápio completo, sacola e pedido pelo WhatsApp.

**HTML, CSS e JavaScript puros.** Sem build, sem `npm install`, sem CDN. Você abre o
`index.html` com dois cliques e ele funciona; publica arrastando a pasta.

---

## Como abrir

Dê dois cliques em `index.html`. É só isso.

Se quiser um servidor local (o mapa e as fontes carregam igual dos dois jeitos):

```bash
python -m http.server 8000
# depois abra http://localhost:8000
```

## Como publicar

Suba **o conteúdo da pasta** para a hospedagem, mantendo `index.html` na raiz.

| Onde | Como |
|---|---|
| Netlify / Vercel | arraste a pasta na janela do painel |
| GitHub Pages | Settings → Pages → Source: `Deploy from a branch`, pasta `/(root)` |
| Hospedagem com FTP | envie tudo para `public_html/` |

O que **não** precisa subir: `originais/`, `entrada/`, o HTML salvo do iFood e a pasta
`Pinches Tacos ... _files`. São arquivos de trabalho.

> ⚠️ Depois de publicar, **abra o endereço e confira**. Workflow verde não é site no ar.
> ```bash
> curl -s -o /dev/null -w "%{http_code}\n" https://SEU-DOMINIO/
> ```

### Antes de publicar em domínio próprio

Troque `https://pinchestacos.com.br/` pelo endereço real em **4 lugares** do `index.html`
(`canonical`, `og:url`, `og:image` e `url` do JSON-LD). A `og:image` precisa ser **URL
absoluta** — sem isso a prévia do link no WhatsApp não aparece.

---

## Estrutura

```
index.html          a página inteira: SEO, dados estruturados, cardápio e ícones
css/styles.css      tokens → base → utilitários → componentes → seções → motion → responsivo
js/main.js          sacola, modal, checkout e pedido no WhatsApp
fonts/              Bebas Neue e Inter em .woff2 (locais, sem CDN)
img/                logo, hero, og e as fotos do cardápio (.webp + .jpg de reserva)
originais/          fotos em resolução cheia, dados do cardápio e o gerador — NÃO vai pro ar
```

---

## Onde mexer em cada conteúdo

| O que | Onde |
|---|---|
| Preço, nome ou descrição de um prato | `index.html`, no card do prato (veja abaixo) |
| Telefone / WhatsApp | `js/main.js` linha 15 (`ZAP`) **e** os links no `index.html` |
| Endereço, Instagram, iFood | `index.html`, seção `<!-- LOCAL -->` e no rodapé |
| Textos do hero e da seção "A casa" | `index.html`, seções `<!-- HERO -->` e `<!-- SOBRE -->` |
| Perguntas do FAQ | `index.html`, seção `<!-- DÚVIDAS -->` — **e** o JSON-LD `FAQPage` no `<head>` |
| Cores e tipografia | `css/styles.css`, bloco `:root` no topo |

### Mudar o preço de um item

Cada prato aparece **duas vezes** no mesmo card e os dois precisam bater — um é o que o
cliente lê, o outro é o que a sacola soma:

```html
<li class="prato" data-prato
    data-preco="3400"          ← centavos: 3400 = R$ 34,00   (a sacola usa este)
    ...>
  ...
  <p class="prato__preco">R$ 34,00</p>   ← o que aparece na tela
```

Trocou um, troque o outro. Para conferir tudo de uma vez, rode a validação (adiante).

### Adicionar ou remover um prato

Copie um bloco `<li class="prato">` inteiro, cole e ajuste. Os atributos que importam:

| Atributo | Para que serve |
|---|---|
| `data-id` | identificador único (use o nome em minúsculas com hífens) |
| `data-nome` | nome que vai na sacola e na mensagem do WhatsApp |
| `data-preco` | preço **em centavos** |
| `data-img` | caminho da foto |
| `data-combo` | `sim` mostra a opção "+ bebida R$ 9,00"; `nao` esconde |
| `data-rapido` | `sim` adiciona direto (bebidas); `nao` abre a ficha do prato |

Ajuste também o número no chip da categoria (`<span class="categorias__contagem">`).

### Trocar o cardápio inteiro de uma vez

Só vale a pena se mudou muita coisa. Precisa de Python com Pillow.

1. Edite `originais/cardapio.json` (preços em centavos).
2. Rode:

```bash
python originais/gerar-cardapio.py
```

Ele reescreve o `index.html` a partir de `originais/index-modelo.html`. **Cuidado:**
qualquer edição manual que você tenha feito no `index.html` é perdida — se você mexe
direto no HTML, mexa no molde também.

### Trocar uma foto

As fotos do site são versões otimizadas. **Trocar o arquivo em `originais/` não muda
nada** — é preciso regerar. Cada prato tem `.webp` (o que carrega) e `.jpg` (reserva
para navegador antigo); os dois precisam existir.

```python
from PIL import Image
im = Image.open('originais/minha-foto.jpg')
# recorte central 4:3
p = 4/3
if im.width/im.height > p:
    n = round(im.height*p); x = (im.width-n)//2; im = im.crop((x,0,x+n,im.height))
else:
    n = round(im.width/p);  y = (im.height-n)//2; im = im.crop((0,y,im.width,y+n))
im = im.resize((640,480), Image.LANCZOS)
im.save('img/cardapio/NOME.webp','WEBP',quality=72,method=6)
im.save('img/cardapio/NOME.jpg','JPEG',quality=74,optimize=True,progressive=True)
```

Se o tamanho final mudar, atualize `width` e `height` no `<img>` — sem isso o layout pula
enquanto a foto carrega.

---

## Horários

**Ainda não estão no site**, porque não foram confirmados — e horário errado é o tipo de
erro que faz o cliente bater na porta fechada. Está tudo pronto para entrar:

1. No `index.html`, procure por `BLOCO HORÁRIOS` e descomente o bloco, preenchendo os dias.
2. No `<head>`, descomente o bloco `openingHoursSpecification` (é o que o Google lê) e
   ajuste os dias e as horas.

Os dois blocos já vêm com o formato certo — é só preencher.

---

## Como o pedido chega até você

O site **não** tem servidor nem banco de dados. A sacola vive no navegador do cliente
(`localStorage`) e, ao finalizar, o site monta a mensagem e abre o WhatsApp já preenchido:

```
*NOVO PEDIDO — PINCHES TACOS*

*Itens*
• 2x 2 Tacos Pastor — R$ 68,00
   + Coca-Cola Lata 350ml
   obs: sem coentro

*Total dos itens: R$ 68,00*
(taxa de entrega a combinar)

*Entrega*
Rua Petit Carneiro, 420 — Água Verde
...
```

O cliente ainda precisa **tocar em enviar** no WhatsApp. Enquanto ele não enviar, o pedido
não existe — por isso a confirmação, o prazo e a taxa são combinados na conversa.

Se o navegador bloquear o pop-up, o site mostra um botão verde com o link, em vez de
perder o pedido em silêncio.

---

## Verificar antes de entregar

```bash
python originais/validar.py
```

Confere caminhos quebrados, âncoras sem destino, `aria-controls` órfão, ícones inexistentes,
hierarquia de títulos, `alt` faltando, contraste das cores, se os preços do HTML batem com
`originais/cardapio.json` e o peso do primeiro carregamento.

Para olhar o resultado de verdade (é isso que pega o que script nenhum pega):

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CH" --headless=new --disable-gpu --hide-scrollbars \
      --user-data-dir="C:\Temp\perfil-novo" \
      --virtual-time-budget=12000 --window-size=1440,2200 \
      --screenshot="saida.png" "file:///CAMINHO/index.html"
```

`--user-data-dir` **novo a cada execução**, senão o Chrome usa cache e você fotografa a
versão antiga.

Para mobile, não use `--window-size=390`: o Windows limita a janela do Chrome em ~485px e a
imagem sai recortada, parecendo um bug que não existe. Renderize dentro de um iframe:

```html
<!-- _frame.html — o .gitignore já ignora _*.html -->
<iframe src="index.html" style="width:390px;height:3400px;border:0"></iframe>
```

---

## Decisões tomadas

**Fundo escuro.** Não por gosto: as fotos do restaurante são feitas em mesa preta, com luz
lateral. Em fundo claro cada foto vira um retângulo brilhante brigando com a página; no
escuro elas se fundem e a comida é a única fonte de luz.

**Combo virou opção, não item separado.** O iFood lista 84 itens, mas 47 são o mesmo prato
repetido com Coca ou Coca Zero. Conferimos por script: a diferença é **sempre R$ 9,00**, e a
Coca avulsa custa exatamente R$ 9,00 — ou seja, o "combo" é a bebida pelo preço de tabela,
sem desconto. Em vez de 84 cards repetidos, são 37 pratos com um seletor de bebida que soma
os mesmos R$ 9,00. O preço final é idêntico ao do iFood.

**O cardápio é HTML de verdade.** Nada é montado por JavaScript. Sem JS o cliente continua
vendo o cardápio inteiro com os preços (e um aviso com o WhatsApp e o iFood) — e o Google
indexa cada prato.

**Fotos vieram do CDN do iFood em resolução cheia**, não as cópias da página salva. As
cópias locais eram 300×225; os originais são até 1300×975. O logo saltou de 150×150 para
828×828, e o fundo branco dele foi removido para flutuar sobre o escuro.

**Movimento reduz, não congela.** No Windows, desligar os efeitos de animação faz o
navegador pedir `prefers-reduced-motion: reduce`; a regra clássica que zera as transições
deixaria o site inteiro travado. Aqui o deslocamento some mas o fade continua, e há um
botão no rodapé para ligar as animações de volta.

---

## Pendências

| O que | Por quê |
|---|---|
| **Horários de funcionamento** | não confirmados — blocos prontos e comentados |
| **CNPJ e razão social** | o site antigo trazia `00.0000.0000/0000-00`, um marcador. Ficou de fora até você mandar o número real |
| **Foto do Guaraná Zero** | não existe no iFood; o card mostra um ícone no lugar |
| **Sincronizada Longaniza** | o iFood só vende dentro do combo (R$ 27,45); o preço avulso não é publicado. Me passe o valor e entra em uma linha |
| **Taxa de entrega e área** | não publicadas; o site diz "a combinar" no WhatsApp |
| **10 fotos de bebida em baixa resolução** | são 300×300, o CDN do iFood não serve maior. Ficam pequenas no card, então passam — trocar por fotos próprias é o próximo ganho |
| **Pedido mínimo** | R$ 30,00 é regra do iFood. No WhatsApp o site não bloqueia nada; se valer lá também, dá para checar antes de finalizar |

### Direito de uso das fotos

As fotos dos pratos vieram do perfil do restaurante no iFood — presumidamente enviadas por
vocês. Se alguma foi feita por terceiro, confirme se pode usar no site antes de divulgar.

---

## O que sobrou do site antigo

`src/`, `public/`, `package.json` e `package-lock.json` são do projeto Vite anterior e **não
são mais usados** por nada. Pode apagar quando quiser — o `index.html` antigo está salvo em
`originais/index-antigo.html` e também no histórico do git.
