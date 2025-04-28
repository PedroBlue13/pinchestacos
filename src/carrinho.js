// carrinho.js - Sistema de carrinho para o site mexicano
let carrinhoItens = [];
let etapaAtual = 1;
let dadosEntrega = { nome: '', telefone: '', rua: '', numero: '', bairro: '', complemento: '', referencia: '' };
let formaPagamento = { metodo: 'dinheiro', troco: 0, observacoes: '' };

document.addEventListener('DOMContentLoaded', function() {
  const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
  if (carrinhoSalvo) {
    carrinhoItens = JSON.parse(carrinhoSalvo);
    atualizarIconeCarrinho();
  }
  
  const btnCarrinho = document.getElementById('btn-carrinho');
  if (btnCarrinho) btnCarrinho.addEventListener('click', abrirCarrinho);
  
  configurarBotoesAddCarrinho();
});

function configurarBotoesAddCarrinho() {
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', function() {
      const cardItem = this.closest('.card-item');
      const contadorElement = this.previousElementSibling.previousElementSibling;
      const quantidade = parseInt(contadorElement.textContent);
      
      if (quantidade > 0) {
        const nome = cardItem.querySelector('.title-produto b').textContent;
        const preco = parseFloat(cardItem.querySelector('.price-produto b').textContent.replace('R$', '').replace(',', '.').trim());
        const imagem = cardItem.querySelector('.img-produto img').src;
        
        adicionarAoCarrinho(nome, quantidade, preco, imagem);
        contadorElement.textContent = '0';
      }
    });
  });
}

function adicionarAoCarrinho(nome, quantidade, preco, imagem) {
  const itemExistente = carrinhoItens.find(item => item.nome === nome);
  
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinhoItens.push({ nome, quantidade, preco, imagem });
  }
  
  localStorage.setItem('carrinhoMexicano', JSON.stringify(carrinhoItens));
  atualizarIconeCarrinho();
  mostrarNotificacao(`${quantidade}x ${nome} adicionado ao carrinho!`);
}

function atualizarIconeCarrinho() {
  const contadorCarrinho = document.querySelector('.carrinho-contador');
  if (contadorCarrinho) {
    contadorCarrinho.textContent = carrinhoItens.reduce((total, item) => total + item.quantidade, 0);
    contadorCarrinho.classList.add('pulse');
    setTimeout(() => contadorCarrinho.classList.remove('pulse'), 500);
  }
}

function abrirCarrinho() {
  let modalCarrinho = document.getElementById('modalCarrinho');
  
  if (!modalCarrinho) {
    modalCarrinho = document.createElement('div');
    modalCarrinho.id = 'modalCarrinho';
    modalCarrinho.className = 'modal-carrinho';
    document.body.appendChild(modalCarrinho);
  }
  
  etapaAtual = 1;
  renderizarEtapaCarrinho();
  modalCarrinho.classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function renderizarEtapaCarrinho() {
  const modalCarrinho = document.getElementById('modalCarrinho');
  if (!modalCarrinho) return;
  
  const titulos = ['Seu Carrinho', 'Dados de Entrega', 'Finalizar Pedido'];
  
  let conteudoModal = `
    <div class="modal-conteudo">
      <div class="modal-header">
        <h2>${titulos[etapaAtual - 1]}</h2>
        <button class="btn-fechar-modal" onclick="fecharCarrinho()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="etapas-carrinho">
          <div class="etapa ${etapaAtual >= 1 ? 'etapa-ativa' : ''}">1. Carrinho</div>
          <div class="etapa ${etapaAtual >= 2 ? 'etapa-ativa' : ''}">2. Entrega</div>
          <div class="etapa ${etapaAtual >= 3 ? 'etapa-ativa' : ''}">3. Pagamento</div>
        </div>
        ${etapaAtual === 1 ? renderizarEtapa1() : etapaAtual === 2 ? renderizarEtapa2() : renderizarEtapa3()}
      </div>
      <div class="modal-footer">
        ${etapaAtual > 1 ? `<button class="btn btn-voltar" onclick="voltarEtapa()">Voltar</button>` : ''}
        ${etapaAtual < 3 ? 
          `<button class="btn btn-continuar ${carrinhoItens.length === 0 && etapaAtual === 1 ? 'disabled' : ''}" 
            onclick="avancarEtapa()" ${carrinhoItens.length === 0 && etapaAtual === 1 ? 'disabled' : ''}>Continuar</button>` : 
          `<button class="btn btn-finalizar" onclick="finalizarPedido()">Finalizar Pedido</button>`}
      </div>
    </div>
  `;
  
  modalCarrinho.innerHTML = conteudoModal;
    // Adicionar eventos após renderizar o conteúdo
    const btnFechar = modalCarrinho.querySelector('.btn-fechar-modal');
    if (btnFechar) btnFechar.addEventListener('click', fecharCarrinho);
    
    if (etapaAtual > 1) {
      const btnVoltar = modalCarrinho.querySelector('.btn-voltar');
      if (btnVoltar) btnVoltar.addEventListener('click', voltarEtapa);
    }
    
    if (etapaAtual < 3) {
      const btnContinuar = modalCarrinho.querySelector('.btn-continuar');
      if (btnContinuar && !btnContinuar.hasAttribute('disabled')) {
        btnContinuar.addEventListener('click', avancarEtapa);
      }
    } else {
      const btnFinalizar = modalCarrinho.querySelector('.btn-finalizar');
      if (btnFinalizar) btnFinalizar.addEventListener('click', finalizarPedido);
    }
    
    if (etapaAtual === 1) configurarBotoesQuantidadeCarrinho();
    else if (etapaAtual === 2) configurarEventosFormularioEntrega();
    else configurarEventosFormaPagamento();
  }if (etapaAtual === 1 && carrinhoItens.length === 0) {
    const btnContinuarComprando = modalCarrinho.querySelector('.btn-continuar-comprando');
    if (btnContinuarComprando) btnContinuarComprando.addEventListener('click', fecharCarrinho);
  }
  

  

function renderizarEtapa1() {
  if (carrinhoItens.length === 0) {
    return `
      <div class="carrinho-vazio">
        <i class="fas fa-shopping-bag"></i>
        <p>Seu carrinho está vazio</p>
        <button class="btn btn-continuar-comprando">Continuar Comprando</button>
      </div>
    `;
  }
  
  let conteudo = `<div class="itens-carrinho">`;
  
  carrinhoItens.forEach((item, index) => {
    const subtotal = (item.preco * item.quantidade).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    });
    
    conteudo += `
      <div class="item-carrinho">
        <div class="item-imagem"><img src="${item.imagem}" alt="${item.nome}" /></div>
        <div class="item-detalhes">
          <h3>${item.nome}</h3>
          <p class="item-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
        </div>
        <div class="item-quantidade">
          <button class="btn-menos-carrinho" data-index="${index}"><i class="fas fa-minus"></i></button>
          <span class="quantidade-carrinho">${item.quantidade}</span>
          <button class="btn-mais-carrinho" data-index="${index}"><i class="fas fa-plus"></i></button>
        </div>
        <div class="item-subtotal">${subtotal}</div>
        <div class="item-remover">
          <button class="btn-remover" data-index="${index}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  });
  
  conteudo += `</div>`;
  
  const totalPedido = carrinhoItens.reduce((total, item) => total + (item.preco * item.quantidade), 0)
    .toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  
  conteudo += `
    <div class="carrinho-resumo">
      <div class="resumo-linha"><span>Subtotal:</span><span>${totalPedido}</span></div>
      <div class="resumo-linha"><span>Taxa de entrega:</span><span>A calcular</span></div>
      <div class="resumo-linha total"><span>Total:</span><span>${totalPedido}</span></div>
    </div>
  `;
  
  return conteudo;
}

function renderizarEtapa2() {
  return `
    <div class="form-entrega">
      <div class="form-grupo">
        <label for="nome">Nome completo</label>
        <input type="text" id="nome" name="nome" value="${dadosEntrega.nome}" required>
      </div>
      <div class="form-grupo">
        <label for="telefone">Telefone (com DDD)</label>
        <input type="tel" id="telefone" name="telefone" value="${dadosEntrega.telefone}" placeholder="(41) 99999-9999" required>
      </div>
      <div class="form-grupo">
        <label for="rua">Rua</label>
        <input type="text" id="rua" name="rua" value="${dadosEntrega.rua}" required>
      </div>
      <div class="form-row">
        <div class="form-grupo flex-1">
          <label for="numero">Número</label>
          <input type="text" id="numero" name="numero" value="${dadosEntrega.numero}" required>
        </div>
        <div class="form-grupo flex-3">
          <label for="bairro">Bairro</label>
          <input type="text" id="bairro" name="bairro" value="${dadosEntrega.bairro}" required>
        </div>
      </div>
      <div class="form-grupo">
        <label for="complemento">Complemento (opcional)</label>
        <input type="text" id="complemento" name="complemento" value="${dadosEntrega.complemento}" placeholder="Apto, bloco, etc.">
      </div>
      <div class="form-grupo">
        <label for="referencia">Ponto de referência (opcional)</label>
        <input type="text" id="referencia" name="referencia" value="${dadosEntrega.referencia}" placeholder="Próximo a...">
      </div>
    </div>
  `;
}

function renderizarEtapa3() {
  const totalPedido = carrinhoItens.reduce((total, item) => total + (item.preco * item.quantidade), 0)
    .toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  
  return `
    <div class="resumo-pedido">
      <h3>Resumo do Pedido</h3>
      <div class="resumo-itens">
        ${carrinhoItens.map(item => `
          <div class="resumo-item">
            <span>${item.quantidade}x ${item.nome}</span>
            <span>${(item.preco * item.quantidade).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
          </div>
        `).join('')}
      </div>
      <div class="resumo-total"><span>Total:</span><span>${totalPedido}</span></div>
      
      <h3 class="mt-4">Endereço de Entrega</h3>
      <div class="endereco-entrega">
        <p>${dadosEntrega.nome}</p>
        <p>${dadosEntrega.rua}, ${dadosEntrega.numero}</p>
        <p>${dadosEntrega.bairro}</p>
        ${dadosEntrega.complemento ? `<p>Complemento: ${dadosEntrega.complemento}</p>` : ''}
        ${dadosEntrega.referencia ? `<p>Referência: ${dadosEntrega.referencia}</p>` : ''}
        <p>Telefone: ${dadosEntrega.telefone}</p>
      </div>
      
      <h3 class="mt-4">Forma de Pagamento</h3>
      <div class="forma-pagamento">
        <div class="opcoes-pagamento">
          <div class="opcao-pagamento">
            <input type="radio" id="dinheiro" name="metodo-pagamento" value="dinheiro" ${formaPagamento.metodo === 'dinheiro' ? 'checked' : ''}>
            <label for="dinheiro">Dinheiro</label>
          </div>
          <div class="opcao-pagamento">
            <input type="radio" id="cartao" name="metodo-pagamento" value="cartao" ${formaPagamento.metodo === 'cartao' ? 'checked' : ''}>
            <label for="cartao">Cartão (na entrega)</label>
          </div>
          <div class="opcao-pagamento">
            <input type="radio" id="pix" name="metodo-pagamento" value="pix" ${formaPagamento.metodo === 'pix' ? 'checked' : ''}>
            <label for="pix">PIX</label>
          </div>
        </div>
        
        <div id="troco-container" class="${formaPagamento.metodo === 'dinheiro' ? '' : 'hidden'}">
          <div class="form-grupo">
            <label for="troco">Troco para (opcional)</label>
            <input type="number" id="troco" name="troco" value="${formaPagamento.troco}" placeholder="0.00">
          </div>
        </div>
        
        <div class="form-grupo">
          <label for="observacoes">Observações (opcional)</label>
          <textarea id="observacoes" name="observacoes" rows="3" placeholder="Ex: Sem cebola, entregar na portaria...">${formaPagamento.observacoes}</textarea>
        </div>
      </div>
    </div>
  `;
}

function configurarBotoesQuantidadeCarrinho() {
  document.querySelectorAll('.btn-mais-carrinho').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      carrinhoItens[index].quantidade++;
      atualizarCarrinho();
    });
  });
  
  document.querySelectorAll('.btn-menos-carrinho').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      if (carrinhoItens[index].quantidade > 1) {
        carrinhoItens[index].quantidade--;
        atualizarCarrinho();
      }
    });
  });
  
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      carrinhoItens.splice(index, 1);
      atualizarCarrinho();
    });
  });
}

function configurarEventosFormularioEntrega() {
  const inputTelefone = document.getElementById('telefone');
  if (inputTelefone) {
    inputTelefone.addEventListener('input', function(e) {
      let valor = e.target.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.substring(0, 11);
      if (valor.length > 0) {
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`;
      }
      e.target.value = valor;
    });
  }
  
  ['nome', 'telefone', 'rua', 'numero', 'bairro', 'complemento', 'referencia'].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.addEventListener('input', salvarDadosEntrega);
  });
}

function salvarDadosEntrega() {
  dadosEntrega = {
    nome: document.getElementById('nome')?.value || '',
    telefone: document.getElementById('telefone')?.value || '',
    rua: document.getElementById('rua')?.value || '',
    numero: document.getElementById('numero')?.value || '',
    bairro: document.getElementById('bairro')?.value || '',
    complemento: document.getElementById('complemento')?.value || '',
    referencia: document.getElementById('referencia')?.value || ''
  };
  
  localStorage.setItem('dadosEntregaMexicano', JSON.stringify(dadosEntrega));
}

function configurarEventosFormaPagamento() {
  const trocoContainer = document.getElementById('troco-container');
  
  document.querySelectorAll('input[name="metodo-pagamento"]').forEach(opcao => {
    opcao.addEventListener('change', function() {
      formaPagamento.metodo = this.value;
      if (trocoContainer) trocoContainer.classList.toggle('hidden', formaPagamento.metodo !== 'dinheiro');
      localStorage.setItem('formaPagamentoMexicano', JSON.stringify(formaPagamento));
    });
  });
  
  const inputTroco = document.getElementById('troco');
  if (inputTroco) {
    inputTroco.addEventListener('input', function() {
      formaPagamento.troco = this.value;
      localStorage.setItem('formaPagamentoMexicano', JSON.stringify(formaPagamento));
    });
  }
  
  const inputObservacoes = document.getElementById('observacoes');
  if (inputObservacoes) {
    inputObservacoes.addEventListener('input', function() {
      formaPagamento.observacoes = this.value;
      localStorage.setItem('formaPagamentoMexicano', JSON.stringify(formaPagamento));
    });
  }
}

function atualizarCarrinho() {
  localStorage.setItem('carrinhoMexicano', JSON.stringify(carrinhoItens));
  atualizarIconeCarrinho();
  renderizarEtapaCarrinho();
}

function avancarEtapa() {
  if (etapaAtual === 1) {
    if (carrinhoItens.length === 0) {
      mostrarNotificacao('Seu carrinho está vazio!', 'erro');
      return;
    }
    const dadosEntregaSalvos = localStorage.getItem('dadosEntregaMexicano');
    if (dadosEntregaSalvos) dadosEntrega = JSON.parse(dadosEntregaSalvos);
  } else if (etapaAtual === 2) {
    if (!validarFormularioEntrega()) return;
    salvarDadosEntrega();
    const formaPagamentoSalva = localStorage.getItem('formaPagamentoMexicano');
    if (formaPagamentoSalva) formaPagamento = JSON.parse(formaPagamentoSalva);
  }
  
  etapaAtual++;
  renderizarEtapaCarrinho();
}

function voltarEtapa() {
  if (etapaAtual > 1) {
    etapaAtual--;
    renderizarEtapaCarrinho();
  }
}

function validarFormularioEntrega() {
  const nome = document.getElementById('nome')?.value;
  const telefone = document.getElementById('telefone')?.value;
  const rua = document.getElementById('rua')?.value;
  const numero = document.getElementById('numero')?.value;
  const bairro = document.getElementById('bairro')?.value;
  
  if (!nome || !telefone || !rua || !numero || !bairro) {
    mostrarNotificacao('Preencha todos os campos obrigatórios!', 'erro');
    return false;
  }
  
  if (telefone.replace(/\D/g, '').length < 10) {
    mostrarNotificacao('Digite um telefone válido com DDD!', 'erro');
    return false;
  }
  
  return true;
}

function finalizarPedido() {
  const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked')?.value || 'dinheiro';
  const troco = metodoPagamento === 'dinheiro' ? document.getElementById('troco')?.value || '0' : '0';
  const observacoes = document.getElementById('observacoes')?.value || '';
  
  formaPagamento = { metodo: metodoPagamento, troco, observacoes };
  
  const totalPedido = carrinhoItens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  
  let mensagem = "🌮 *NOVO PEDIDO PINCHES TACOS* 🌮\n\n";
  
  mensagem += "*ITENS DO PEDIDO:*\n";
  carrinhoItens.forEach(item => {
    mensagem += `▪️ ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
  });
  
  mensagem += `\n*TOTAL: R$ ${totalPedido.toFixed(2).replace('.', ',')}*\n\n`;
  
  mensagem += "*DADOS DE ENTREGA:*\n";
  mensagem += `📋 Nome: ${dadosEntrega.nome}\n`;
  mensagem += `📞 Telefone: ${dadosEntrega.telefone}\n`;
  mensagem += `📍 Endereço: ${dadosEntrega.rua}, ${dadosEntrega.numero}, ${dadosEntrega.bairro}\n`;
  
  if (dadosEntrega.complemento) mensagem += `🏠 Complemento: ${dadosEntrega.complemento}\n`;
  if (dadosEntrega.referencia) mensagem += `🔍 Referência: ${dadosEntrega.referencia}\n`;
  
  mensagem += `\n*FORMA DE PAGAMENTO:*\n`;
  mensagem += `💰 ${metodoPagamento === 'dinheiro' ? 'Dinheiro' : metodoPagamento === 'cartao' ? 'Cartão (na entrega)' : 'PIX'}\n`;
  
  if (metodoPagamento === 'dinheiro' && troco > 0) {
    mensagem += `💵 Troco para: R$ ${troco.replace('.', ',')}\n`;
  }
  
  if (observacoes) mensagem += `\n*OBSERVAÇÕES:*\n${observacoes}\n`;
  
  const mensagemCodificada = encodeURIComponent(mensagem);
  const numeroWhatsApp = "554188017564"; // Substitua pelo número real
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
  
  carrinhoItens = [];
  localStorage.removeItem('carrinhoMexicano');
  atualizarIconeCarrinho();
  fecharCarrinho();
  
  window.open(urlWhatsApp, '_blank');
  mostrarNotificacao('Pedido enviado com sucesso!', 'sucesso');
}

function fecharCarrinho() {
  const modalCarrinho = document.getElementById('modalCarrinho');
  if (modalCarrinho) {
    modalCarrinho.classList.remove('aberto');
    document.body.style.overflow = '';
  }
}

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  let notificacao = document.querySelector('.notificacao-carrinho');
  
  if (!notificacao) {
    notificacao = document.createElement('div');
    notificacao.className = 'notificacao-carrinho';
    document.body.appendChild(notificacao);
  }
  
  notificacao.className = `notificacao-carrinho ${tipo}`;
  notificacao.textContent = mensagem;
  notificacao.classList.add('mostrar');
  
  setTimeout(() => {
    notificacao.classList.remove('mostrar');
  }, 3000);
}