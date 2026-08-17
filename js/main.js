/* =============================================================================
   PINCHES TACOS — main.js
   1. Utilidades          5. Modal do prato
   2. Estado e memoria    6. Gaveta da sacola (3 passos)
   3. Cabecalho e nav     7. Pedido no WhatsApp
   4. FAQ, revelar, ano   8. Inicializacao
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------ 1. UTILIDADES */
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  var ZAP = '5541987316239';               // (41) 98731-6239 — confirmado com o Pedro
  var COMBO = 900;                         // centavos: bebida do combo, igual ao iFood

  function brl(c) {
    return 'R$ ' + (c / 100).toFixed(2).replace('.', ',');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function guardar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* modo privado */ }
  }

  function ler(chave, padrao) {
    try {
      var v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch (e) { return padrao; }
  }

  /* Avisos --------------------------------------------------------------- */
  var caixaAvisos = $('#avisos');

  function avisar(texto, tipo) {
    if (!caixaAvisos) return;
    var el = document.createElement('p');
    el.className = 'aviso aviso--' + (tipo || 'ok');
    el.textContent = texto;
    caixaAvisos.appendChild(el);
    setTimeout(function () {
      el.classList.add('saindo');
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* Foco preso dentro de um dialogo --------------------------------------- */
  var FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  var focoAnterior = null;

  function prenderFoco(caixa, ev) {
    var itens = $$(FOCAVEIS, caixa).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!itens.length) return;
    var primeiro = itens[0];
    var ultimo = itens[itens.length - 1];
    if (ev.shiftKey && document.activeElement === primeiro) {
      ev.preventDefault(); ultimo.focus();
    } else if (!ev.shiftKey && document.activeElement === ultimo) {
      ev.preventDefault(); primeiro.focus();
    }
  }

  /* ------------------------------------------------- 2. ESTADO E MEMORIA */
  var sacola = ler('pt-sacola', []);
  var cliente = ler('pt-cliente', {
    tipo: 'entrega', nome: '', fone: '', rua: '', numero: '', bairro: '',
    complemento: '', referencia: '', pagamento: 'pix', troco: '', obs: ''
  });
  var passo = 1;

  function salvarSacola() {
    guardar('pt-sacola', sacola);
    pintarContadores();
  }

  function totalItens() {
    return sacola.reduce(function (t, i) { return t + i.qtd; }, 0);
  }

  function totalPreco() {
    return sacola.reduce(function (t, i) { return t + i.unit * i.qtd; }, 0);
  }

  /* chave que distingue o mesmo prato com opcoes diferentes */
  function chave(item) {
    return [item.id, item.bebida || '', (item.obs || '').trim().toLowerCase()].join('|');
  }

  function adicionar(item) {
    var k = chave(item);
    var achou = null;
    for (var i = 0; i < sacola.length; i++) {
      if (chave(sacola[i]) === k) { achou = sacola[i]; break; }
    }
    if (achou) achou.qtd += item.qtd;
    else sacola.push(item);
    salvarSacola();
  }

  /* ------------------------------------------------ 3. CABECALHO E NAV */
  var cabecalho = $('#cabecalho');
  var nav = $('#nav');
  var btnNav = $('#abrir-nav');

  function fecharNav() {
    if (!nav || !btnNav) return;
    nav.removeAttribute('data-aberto');
    btnNav.setAttribute('aria-expanded', 'false');
  }

  if (btnNav && nav) {
    btnNav.addEventListener('click', function () {
      var aberto = nav.getAttribute('data-aberto') === 'sim';
      if (aberto) { fecharNav(); return; }
      nav.setAttribute('data-aberto', 'sim');
      btnNav.setAttribute('aria-expanded', 'true');
    });
    $$('.nav__link', nav).forEach(function (l) {
      l.addEventListener('click', fecharNav);
    });
    document.addEventListener('click', function (ev) {
      if (nav.getAttribute('data-aberto') !== 'sim') return;
      if (!nav.contains(ev.target) && !btnNav.contains(ev.target)) fecharNav();
    });
  }

  /* sombra do cabecalho + categoria ativa: um listener so, com limitador */
  var alvos = [];
  var links = {};

  function mapearCategorias() {
    $$('.categorias__link').forEach(function (a) {
      var id = a.getAttribute('data-cat');
      var sec = document.getElementById(id);
      if (sec) { alvos.push(sec); links[id] = a; }
    });
  }

  function aoRolar() {
    if (cabecalho) {
      cabecalho.setAttribute('data-preso', window.scrollY > 8 ? 'sim' : 'nao');
    }
    var linha = window.scrollY + (window.innerHeight * 0.28);
    var atual = null;
    for (var i = 0; i < alvos.length; i++) {
      if (alvos[i].offsetTop <= linha) atual = alvos[i].id;
    }
    for (var id in links) {
      if (id === atual) links[id].setAttribute('aria-current', 'true');
      else links[id].removeAttribute('aria-current');
    }
    if (atual && links[atual]) manterVisivel(links[atual]);
  }

  function manterVisivel(link) {
    var rolo = link.parentNode;
    if (!rolo || rolo.scrollWidth <= rolo.clientWidth) return;
    var esq = link.offsetLeft - rolo.offsetLeft;
    var dir = esq + link.offsetWidth;
    if (esq < rolo.scrollLeft) rolo.scrollLeft = esq - 16;
    else if (dir > rolo.scrollLeft + rolo.clientWidth) rolo.scrollLeft = dir - rolo.clientWidth + 16;
  }

  var esperando = false;
  window.addEventListener('scroll', function () {
    if (esperando) return;
    esperando = true;
    requestAnimationFrame(function () { aoRolar(); esperando = false; });
  }, { passive: true });

  /* --------------------------------------------- 4. FAQ, REVELAR E ANO */
  $$('.faq__botao').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var painel = document.getElementById(btn.getAttribute('aria-controls'));
      var aberto = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!aberto));
      if (painel) painel.hidden = aberto;
    });
  });

  function revelar() {
    var itens = $$('[data-revela]');
    if (!itens.length) return;
    if (!('IntersectionObserver' in window)) {
      itens.forEach(function (el) { el.classList.add('visivel'); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    itens.forEach(function (el) { obs.observe(el); });

    /* rede de seguranca: relogio, nao rAF (padroes.md) */
    var varre = setInterval(function () {
      var restam = 0;
      $$('[data-revela]:not(.visivel)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96) el.classList.add('visivel');
        else restam++;
      });
      if (!restam) clearInterval(varre);
    }, 700);
    setTimeout(function () { clearInterval(varre); }, 20000);
  }

  var elAno = $('#ano');
  if (elAno) elAno.textContent = String(new Date().getFullYear());

  /* botao de animacoes no rodape */
  var btnMotion = $('#btn-motion');
  if (btnMotion) {
    var raiz = document.documentElement;
    var pintarMotion = function () {
      btnMotion.textContent = raiz.getAttribute('data-motion') === 'reduced'
        ? 'Ativar animações' : 'Reduzir animações';
    };
    pintarMotion();
    btnMotion.addEventListener('click', function () {
      var novo = raiz.getAttribute('data-motion') === 'reduced' ? 'full' : 'reduced';
      raiz.setAttribute('data-motion', novo);
      guardar('pt-motion', novo);     /* so grava quando o visitante escolhe */
      pintarMotion();
    });
  }

  /* --------------------------------------------------- 5. MODAL DO PRATO */
  var modal = $('#modal-prato');
  var modalFoto = $('#modal-foto');
  var modalNome = $('#modal-nome');
  var modalCorpo = $('#modal-corpo');
  var modalPe = $('#modal-pe');
  var pratoAberto = null;
  var qtdModal = 1;
  var timerModal = null;
  var timerGaveta = null;

  function dadosDoCard(card) {
    return {
      id: card.getAttribute('data-id'),
      nome: card.getAttribute('data-nome'),
      preco: parseInt(card.getAttribute('data-preco'), 10),
      img: card.getAttribute('data-img'),
      desc: card.getAttribute('data-desc') || '',
      combo: card.getAttribute('data-combo') === 'sim'
    };
  }

  function precoModal() {
    if (!pratoAberto) return 0;
    var extra = 0;
    var op = $('input[name="bebida"]:checked', modal);
    if (op && op.value) extra = COMBO;
    return (pratoAberto.preco + extra) * qtdModal;
  }

  function pintarPeModal() {
    modalPe.innerHTML =
      '<div class="contador">' +
        '<button class="contador__btn" type="button" data-q="-1" aria-label="Diminuir quantidade">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-menos"></use></svg></button>' +
        '<span class="contador__valor" id="modal-qtd" aria-live="polite">' + qtdModal + '</span>' +
        '<button class="contador__btn" type="button" data-q="1" aria-label="Aumentar quantidade">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-mais"></use></svg></button>' +
      '</div>' +
      '<button class="btn btn--principal" type="button" id="modal-add">' +
        'Adicionar · <span id="modal-total">' + brl(precoModal()) + '</span>' +
      '</button>';

    $$('[data-q]', modalPe).forEach(function (b) {
      b.addEventListener('click', function () {
        qtdModal = Math.max(1, qtdModal + parseInt(b.getAttribute('data-q'), 10));
        $('#modal-qtd', modalPe).textContent = qtdModal;
        $('#modal-total', modalPe).textContent = brl(precoModal());
      });
    });

    $('#modal-add', modalPe).addEventListener('click', function () {
      var op = $('input[name="bebida"]:checked', modal);
      var obs = $('#modal-obs', modal);
      adicionar({
        id: pratoAberto.id,
        nome: pratoAberto.nome,
        unit: pratoAberto.preco + (op && op.value ? COMBO : 0),
        qtd: qtdModal,
        img: pratoAberto.img,
        bebida: op ? op.value : '',
        obs: obs ? obs.value.trim() : ''
      });
      fecharModal();
      avisar(qtdModal + '× ' + pratoAberto.nome + ' na sacola');
    });
  }

  function abrirModal(card) {
    pratoAberto = dadosDoCard(card);
    qtdModal = 1;

    modalFoto.innerHTML = pratoAberto.img
      ? '<img src="' + esc(pratoAberto.img) + '" alt="' + esc(pratoAberto.nome) + '" width="640" height="360">'
      : '';

    /* o titulo vive fora do innerHTML: aria-labelledby do dialogo aponta para ele
       e nao pode virar referencia pendurada enquanto o modal esta fechado */
    modalNome.textContent = pratoAberto.nome;

    var html = '';
    if (pratoAberto.desc) html += '<p class="modal__desc">' + esc(pratoAberto.desc) + '</p>';
    html += '<p class="modal__preco">' + brl(pratoAberto.preco) + '</p>';

    if (pratoAberto.combo) {
      html +=
        '<div class="modal__bloco">' +
          '<p class="bloco-titulo">Quer bebida junto?</p>' +
          '<div class="escolhas">' +
            escolha('bebida', '', 'Sem bebida', '', true) +
            escolha('bebida', 'Coca-Cola Lata 350ml', 'Coca-Cola Lata 350ml', '+ ' + brl(COMBO), false) +
            escolha('bebida', 'Coca-Cola Zero Lata 350ml', 'Coca-Cola Zero Lata 350ml', '+ ' + brl(COMBO), false) +
          '</div>' +
        '</div>';
    }

    html +=
      '<div class="modal__bloco">' +
        '<label class="campo__rotulo" for="modal-obs">Alguma observação? <span>(opcional)</span></label>' +
        '<textarea class="campo__entrada" id="modal-obs" rows="2" ' +
          'placeholder="Ex.: sem cebola, sem coentro, capricha no picante"></textarea>' +
      '</div>';

    modalCorpo.innerHTML = html;

    $$('input[name="bebida"]', modal).forEach(function (r) {
      r.addEventListener('change', function () {
        $('#modal-total', modalPe).textContent = brl(precoModal());
      });
    });

    pintarPeModal();

    focoAnterior = document.activeElement;
    clearTimeout(timerModal);        /* reabrir antes de 280ms nao pode ser desfeito
                                        pelo timer de esconder do fechamento anterior */
    modal.hidden = false;
    requestAnimationFrame(function () { modal.setAttribute('data-aberta', 'sim'); });
    document.body.style.overflow = 'hidden';
    $('#fechar-modal').focus();
  }

  function escolha(nome, valor, texto, preco, marcado) {
    return '<label class="escolha">' +
      '<input type="radio" name="' + nome + '" value="' + esc(valor) + '"' + (marcado ? ' checked' : '') + '>' +
      '<span class="escolha__marca" aria-hidden="true"></span>' +
      '<span class="escolha__texto">' + esc(texto) + '</span>' +
      (preco ? '<span class="escolha__preco">' + esc(preco) + '</span>' : '') +
      '</label>';
  }

  function fecharModal() {
    modal.removeAttribute('data-aberta');
    document.body.style.overflow = '';
    timerModal = setTimeout(function () { modal.hidden = true; }, 280);
    if (focoAnterior) focoAnterior.focus();
    pratoAberto = null;
  }

  $('#fechar-modal').addEventListener('click', fecharModal);
  modal.addEventListener('click', function (ev) {
    if (ev.target === modal) fecharModal();
  });

  /* clique nos botoes de adicionar do cardapio */
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('[data-add]') : null;
    if (!btn) return;
    var card = btn.closest('[data-prato]');
    if (!card) return;

    /* bebida entra direto; prato abre a ficha */
    if (card.getAttribute('data-rapido') === 'sim') {
      var d = dadosDoCard(card);
      adicionar({ id: d.id, nome: d.nome, unit: d.preco, qtd: 1, img: d.img, bebida: '', obs: '' });
      btn.classList.add('feito');
      setTimeout(function () { btn.classList.remove('feito'); }, 600);
      avisar('1× ' + d.nome + ' na sacola');
      return;
    }
    abrirModal(card);
  });

  /* ------------------------------------------- 6. GAVETA DA SACOLA */
  var gaveta = $('#sacola');
  var tela = $('#tela');
  var corpo = $('#sacola-corpo');
  var pe = $('#sacola-pe');
  var tituloGaveta = $('#sacola-titulo');
  var elPassos = $('#passos');

  function abrirSacola(irPara) {
    passo = irPara || 1;
    focoAnterior = document.activeElement;
    clearTimeout(timerGaveta);       /* idem para a gaveta (550ms) */
    tela.hidden = false;
    gaveta.hidden = false;
    requestAnimationFrame(function () {
      tela.setAttribute('data-aberta', 'sim');
      gaveta.setAttribute('data-aberta', 'sim');
    });
    document.body.style.overflow = 'hidden';
    pintarSacola();
    $('#fechar-sacola').focus();
  }

  function fecharSacola() {
    tela.removeAttribute('data-aberta');
    gaveta.removeAttribute('data-aberta');
    document.body.style.overflow = '';
    timerGaveta = setTimeout(function () { tela.hidden = true; gaveta.hidden = true; }, 550);
    if (focoAnterior) focoAnterior.focus();
  }

  $('#abrir-sacola').addEventListener('click', function () { abrirSacola(1); });
  $('#fechar-sacola').addEventListener('click', fecharSacola);
  tela.addEventListener('click', fecharSacola);
  $('#flutuante').addEventListener('click', function () { abrirSacola(1); });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if (modal.getAttribute('data-aberta') === 'sim') { fecharModal(); return; }
      if (gaveta.getAttribute('data-aberta') === 'sim') { fecharSacola(); return; }
      if (nav && nav.getAttribute('data-aberto') === 'sim') fecharNav();
    }
    if (ev.key === 'Tab') {
      if (modal.getAttribute('data-aberta') === 'sim') prenderFoco(modal, ev);
      else if (gaveta.getAttribute('data-aberta') === 'sim') prenderFoco(gaveta, ev);
    }
  });

  /* --- desenho dos 3 passos ------------------------------------------- */
  function pintarSacola() {
    var titulos = ['Sua sacola', 'Dados da entrega', 'Confira o pedido'];
    tituloGaveta.textContent = titulos[passo - 1];

    elPassos.hidden = sacola.length === 0;
    $$('.passo', elPassos).forEach(function (p) {
      var n = parseInt(p.getAttribute('data-passo'), 10);
      if (n <= passo) p.setAttribute('data-ativo', 'sim');
      else p.removeAttribute('data-ativo');
    });

    if (passo === 1) pintarPasso1();
    else if (passo === 2) pintarPasso2();
    else pintarPasso3();
  }

  /* passo 1 — itens ------------------------------------------------------ */
  function pintarPasso1() {
    if (!sacola.length) {
      corpo.innerHTML =
        '<div class="sacola-vazia">' +
          '<svg class="icone sacola-vazia__icone" aria-hidden="true"><use href="#i-sacola"></use></svg>' +
          '<p>Sua sacola está vazia.</p>' +
          '<p style="font-size:.8125rem;color:var(--texto-3);margin-top:.5rem">' +
            'Escolha seus tacos no cardápio e eles aparecem aqui.</p>' +
        '</div>';
      pe.innerHTML = '<button class="btn btn--linha btn--bloco" type="button" id="ir-cardapio">Ver o cardápio</button>';
      $('#ir-cardapio').addEventListener('click', function () {
        fecharSacola();
        var alvo = document.getElementById('cardapio');
        if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    corpo.innerHTML = sacola.map(function (it, i) {
      return '<div class="linha-item">' +
        '<img class="linha-item__foto" src="' + esc(it.img) + '" alt="" width="62" height="62" loading="lazy">' +
        '<div>' +
          '<p class="linha-item__nome">' + esc(it.nome) + '</p>' +
          (it.bebida ? '<p class="linha-item__opcoes">+ ' + esc(it.bebida) + '</p>' : '') +
          (it.obs ? '<p class="linha-item__obs">“' + esc(it.obs) + '”</p>' : '') +
          '<div class="linha-item__pe">' +
            '<div class="contador">' +
              '<button class="contador__btn" type="button" data-i="' + i + '" data-d="-1" ' +
                'aria-label="Diminuir ' + esc(it.nome) + '">' +
                '<svg class="icone" aria-hidden="true"><use href="#i-' + (it.qtd === 1 ? 'lixo' : 'menos') + '"></use></svg>' +
              '</button>' +
              '<span class="contador__valor">' + it.qtd + '</span>' +
              '<button class="contador__btn" type="button" data-i="' + i + '" data-d="1" ' +
                'aria-label="Aumentar ' + esc(it.nome) + '">' +
                '<svg class="icone" aria-hidden="true"><use href="#i-mais"></use></svg>' +
              '</button>' +
            '</div>' +
            '<span class="linha-item__total">' + brl(it.unit * it.qtd) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    $$('[data-d]', corpo).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = parseInt(b.getAttribute('data-i'), 10);
        var d = parseInt(b.getAttribute('data-d'), 10);
        if (!sacola[i]) return;
        sacola[i].qtd += d;
        if (sacola[i].qtd <= 0) {
          var nome = sacola[i].nome;
          sacola.splice(i, 1);
          avisar(nome + ' saiu da sacola');
        }
        salvarSacola();
        pintarSacola();
      });
    });

    pe.innerHTML =
      '<div class="resumo">' +
        '<div class="resumo__linha"><span>Subtotal (' + totalItens() + ' ' +
          (totalItens() === 1 ? 'item' : 'itens') + ')</span><span>' + brl(totalPreco()) + '</span></div>' +
        '<div class="resumo__linha"><span>Entrega</span><span>a combinar</span></div>' +
        '<div class="resumo__linha resumo__linha--total"><span>Total</span><span>' + brl(totalPreco()) + '</span></div>' +
        '<p class="resumo__aviso">A taxa de entrega é combinada no WhatsApp, pelo seu endereço.</p>' +
      '</div>' +
      '<button class="btn btn--principal btn--bloco btn--g" type="button" id="ir-2">Continuar</button>';

    $('#ir-2').addEventListener('click', function () { passo = 2; pintarSacola(); });
  }

  /* passo 2 — dados ------------------------------------------------------ */
  function campo(id, rotulo, valor, opcoes) {
    opcoes = opcoes || {};
    var tipo = opcoes.tipo || 'text';
    var extra = (opcoes.opcional ? ' <span>(opcional)</span>' : '');
    var entrada = tipo === 'textarea'
      ? '<textarea class="campo__entrada" id="' + id + '" rows="2" placeholder="' +
          esc(opcoes.dica || '') + '">' + esc(valor) + '</textarea>'
      : '<input class="campo__entrada" type="' + tipo + '" id="' + id + '" value="' + esc(valor) + '" ' +
          'placeholder="' + esc(opcoes.dica || '') + '" ' +
          (opcoes.modo ? 'inputmode="' + opcoes.modo + '" ' : '') +
          (opcoes.auto ? 'autocomplete="' + opcoes.auto + '" ' : '') + '>';
    return '<div class="campo">' +
      '<label class="campo__rotulo" for="' + id + '">' + rotulo + extra + '</label>' +
      entrada +
      '<p class="campo__erro" id="erro-' + id + '" aria-live="polite"></p>' +
    '</div>';
  }

  function pintarPasso2() {
    var ent = cliente.tipo !== 'retirada';
    corpo.innerHTML =
      '<p class="bloco-titulo">Como você quer receber?</p>' +
      '<div class="escolhas escolhas--linha">' +
        escolha('tipo', 'entrega', 'Entrega', '', ent) +
        escolha('tipo', 'retirada', 'Retirar na loja', '', !ent) +
      '</div>' +
      campo('c-nome', 'Seu nome', cliente.nome, { auto: 'name' }) +
      campo('c-fone', 'WhatsApp com DDD', cliente.fone, { tipo: 'tel', modo: 'tel', dica: '(41) 99999-9999', auto: 'tel' }) +
      '<div id="bloco-endereco"' + (ent ? '' : ' hidden') + '>' +
        campo('c-rua', 'Rua', cliente.rua, { auto: 'address-line1' }) +
        '<div class="dupla">' +
          campo('c-numero', 'Número', cliente.numero) +
          campo('c-bairro', 'Bairro', cliente.bairro) +
        '</div>' +
        campo('c-complemento', 'Complemento', cliente.complemento, { opcional: true, dica: 'Apto, bloco, casa' }) +
        campo('c-referencia', 'Ponto de referência', cliente.referencia, { opcional: true, dica: 'Perto de...' }) +
      '</div>';

    var blocoEnd = $('#bloco-endereco', corpo);
    $$('input[name="tipo"]', corpo).forEach(function (r) {
      r.addEventListener('change', function () {
        cliente.tipo = r.value;
        blocoEnd.hidden = r.value === 'retirada';
      });
    });

    /* mascara do telefone */
    var fone = $('#c-fone', corpo);
    fone.addEventListener('input', function () {
      var v = fone.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) fone.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) fone.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else fone.value = v;
    });

    pe.innerHTML =
      '<div style="display:flex;gap:.75rem">' +
        '<button class="btn btn--linha" type="button" id="volta-1">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-volta"></use></svg> Voltar</button>' +
        '<button class="btn btn--principal btn--g" type="button" id="ir-3" style="flex:1">Continuar</button>' +
      '</div>';

    $('#volta-1').addEventListener('click', function () { passo = 1; pintarSacola(); });
    $('#ir-3').addEventListener('click', function () {
      if (!validarPasso2()) return;
      passo = 3;
      pintarSacola();
    });
  }

  function erro(id, msg) {
    var campoEl = $('#' + id, corpo);
    var alvo = $('#erro-' + id, corpo);
    if (alvo) alvo.textContent = msg || '';
    if (campoEl) {
      if (msg) campoEl.setAttribute('aria-invalid', 'true');
      else campoEl.removeAttribute('aria-invalid');
    }
    return campoEl;
  }

  function validarPasso2() {
    var ent = $('input[name="tipo"]:checked', corpo).value === 'entrega';
    var obrig = [['c-nome', 'Precisamos do seu nome.'], ['c-fone', 'Precisamos do seu WhatsApp.']];
    if (ent) {
      obrig.push(['c-rua', 'Informe a rua.'], ['c-numero', 'Informe o número.'], ['c-bairro', 'Informe o bairro.']);
    }

    var primeiroRuim = null;
    obrig.forEach(function (par) {
      var el = $('#' + par[0], corpo);
      if (!el || !el.value.trim()) {
        var ruim = erro(par[0], par[1]);
        if (!primeiroRuim) primeiroRuim = ruim;
      } else {
        erro(par[0], '');
      }
    });

    var fone = $('#c-fone', corpo);
    if (fone && fone.value.trim() && fone.value.replace(/\D/g, '').length < 10) {
      var ruimFone = erro('c-fone', 'Telefone incompleto — use DDD + número.');
      if (!primeiroRuim) primeiroRuim = ruimFone;
    }

    if (primeiroRuim) {
      primeiroRuim.focus();
      avisar('Faltou preencher algum campo.', 'erro');
      return false;
    }

    cliente.tipo = ent ? 'entrega' : 'retirada';
    ['nome', 'fone', 'rua', 'numero', 'bairro', 'complemento', 'referencia'].forEach(function (k) {
      var el = $('#c-' + k, corpo);
      if (el) cliente[k] = el.value.trim();
    });
    guardar('pt-cliente', cliente);
    return true;
  }

  /* passo 3 — revisao ---------------------------------------------------- */
  function pintarPasso3() {
    var ent = cliente.tipo === 'entrega';
    corpo.innerHTML =
      '<div class="revisao">' +
        sacola.map(function (it) {
          return '<div class="revisao__linha"><span>' + it.qtd + '× ' + esc(it.nome) +
            (it.bebida ? ' <em>+ ' + esc(it.bebida) + '</em>' : '') +
            '</span><span>' + brl(it.unit * it.qtd) + '</span></div>';
        }).join('') +
        '<div class="revisao__linha" style="border-top:1px solid var(--borda);padding-top:.5rem;' +
          'color:var(--texto);font-weight:800"><span>Total</span><span>' + brl(totalPreco()) + '</span></div>' +
      '</div>' +

      '<div class="revisao">' +
        '<h4>' + (ent ? 'Entregar em' : 'Retirada na loja') + '</h4>' +
        (ent
          ? '<p>' + esc(cliente.rua) + ', ' + esc(cliente.numero) + ' — ' + esc(cliente.bairro) +
            (cliente.complemento ? '<br>' + esc(cliente.complemento) : '') +
            (cliente.referencia ? '<br>Ref.: ' + esc(cliente.referencia) : '') + '</p>'
          : '<p>R. Brasílio Itiberê, 3642 — Água Verde</p>') +
        '<p style="color:var(--texto-2)">' + esc(cliente.nome) + ' · ' + esc(cliente.fone) + '</p>' +
      '</div>' +

      '<p class="bloco-titulo">Como vai pagar?</p>' +
      '<div class="escolhas">' +
        escolha('pgto', 'PIX', 'PIX', '', cliente.pagamento === 'PIX') +
        escolha('pgto', 'Dinheiro', 'Dinheiro', '', cliente.pagamento === 'Dinheiro') +
        escolha('pgto', 'Cartão na entrega', 'Cartão na entrega', '', cliente.pagamento === 'Cartão na entrega') +
      '</div>' +
      '<div id="bloco-troco"' + (cliente.pagamento === 'Dinheiro' ? '' : ' hidden') + '>' +
        campo('c-troco', 'Precisa de troco para quanto?', cliente.troco, { opcional: true, modo: 'decimal', dica: 'Ex.: 100' }) +
      '</div>' +
      campo('c-obs', 'Observações do pedido', cliente.obs, { tipo: 'textarea', opcional: true, dica: 'Ex.: entregar na portaria' }) +
      '<p class="resumo__aviso" style="margin-top:-.5rem">' +
        'As formas de pagamento aceitas são confirmadas na conversa do WhatsApp.</p>';

    if (!$('input[name="pgto"]:checked', corpo)) {
      var primeiro = $('input[name="pgto"]', corpo);
      if (primeiro) primeiro.checked = true;
    }

    var blocoTroco = $('#bloco-troco', corpo);
    $$('input[name="pgto"]', corpo).forEach(function (r) {
      r.addEventListener('change', function () {
        cliente.pagamento = r.value;
        blocoTroco.hidden = r.value !== 'Dinheiro';
      });
    });

    pe.innerHTML =
      '<div style="display:flex;gap:.75rem">' +
        '<button class="btn btn--linha" type="button" id="volta-2">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-volta"></use></svg> Voltar</button>' +
        '<button class="btn btn--zap btn--g" type="button" id="enviar" style="flex:1">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-zap"></use></svg> Enviar no WhatsApp</button>' +
      '</div>';

    $('#volta-2').addEventListener('click', function () { passo = 2; pintarSacola(); });
    $('#enviar').addEventListener('click', enviarPedido);
  }

  /* ------------------------------------------- 7. PEDIDO NO WHATSAPP */
  function enviarPedido() {
    if (!sacola.length) { avisar('Sua sacola está vazia.', 'erro'); return; }

    var pg = $('input[name="pgto"]:checked', corpo);
    cliente.pagamento = pg ? pg.value : 'PIX';
    var elTroco = $('#c-troco', corpo);
    cliente.troco = elTroco ? elTroco.value.trim() : '';
    var elObs = $('#c-obs', corpo);
    cliente.obs = elObs ? elObs.value.trim() : '';
    guardar('pt-cliente', cliente);

    var L = [];
    L.push('*NOVO PEDIDO — PINCHES TACOS*');
    L.push('');
    L.push('*Itens*');
    sacola.forEach(function (it) {
      L.push('• ' + it.qtd + 'x ' + it.nome + ' — ' + brl(it.unit * it.qtd));
      if (it.bebida) L.push('   + ' + it.bebida);
      if (it.obs) L.push('   obs: ' + it.obs);
    });
    L.push('');
    L.push('*Total dos itens: ' + brl(totalPreco()) + '*');
    L.push('(taxa de entrega a combinar)');
    L.push('');

    if (cliente.tipo === 'entrega') {
      L.push('*Entrega*');
      L.push(cliente.rua + ', ' + cliente.numero + ' — ' + cliente.bairro);
      if (cliente.complemento) L.push('Complemento: ' + cliente.complemento);
      if (cliente.referencia) L.push('Referência: ' + cliente.referencia);
    } else {
      L.push('*Retirada na loja*');
    }
    L.push('');
    L.push('*Cliente*');
    L.push(cliente.nome + ' — ' + cliente.fone);
    L.push('');
    L.push('*Pagamento*');
    L.push(cliente.pagamento + (cliente.pagamento === 'Dinheiro' && cliente.troco
      ? ' (troco para R$ ' + cliente.troco + ')' : ''));
    if (cliente.obs) {
      L.push('');
      L.push('*Observações*');
      L.push(cliente.obs);
    }

    var url = 'https://api.whatsapp.com/send?phone=' + ZAP + '&text=' + encodeURIComponent(L.join('\n'));
    var janela = window.open(url, '_blank', 'noopener');

    if (!janela) {
      /* bloqueador de pop-up: nao perde o pedido, oferece o link */
      pe.innerHTML = '<a class="btn btn--zap btn--bloco btn--g" href="' + esc(url) + '" ' +
        'target="_blank" rel="noopener" id="link-zap">Abrir o WhatsApp com meu pedido</a>';
      $('#link-zap').addEventListener('click', limparAposEnvio);
      avisar('Toque no botão verde para abrir o WhatsApp.', 'erro');
      return;
    }
    limparAposEnvio();
  }

  function limparAposEnvio() {
    sacola = [];
    salvarSacola();
    passo = 1;
    setTimeout(function () {
      fecharSacola();
      avisar('Pedido montado! Confirme o envio no WhatsApp.');
    }, 350);
  }

  /* --------------------------------------------------- 8. CONTADORES */
  var elContador = $('#sacola-contador');
  var btnSacola = $('#abrir-sacola');
  var flutuante = $('#flutuante');
  var flutTxt = $('#flutuante-txt');
  var flutTotal = $('#flutuante-total');

  function pintarContadores() {
    var n = totalItens();
    if (elContador) {
      elContador.textContent = n;
      elContador.classList.add('pulsa');
      setTimeout(function () { elContador.classList.remove('pulsa'); }, 460);
    }
    if (btnSacola) btnSacola.setAttribute('data-cheia', n > 0 ? 'sim' : 'nao');
    if (flutuante) {
      flutuante.setAttribute('data-ver', n > 0 ? 'sim' : 'nao');
      if (flutTxt) flutTxt.textContent = n === 1 ? '1 item' : n + ' itens';
      if (flutTotal) flutTotal.textContent = brl(totalPreco());
    }
  }

  /* --------------------------------------------------- INICIALIZACAO */
  mapearCategorias();
  aoRolar();
  revelar();
  pintarContadores();
})();
