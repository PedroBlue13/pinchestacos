// carrinho.js - Sistema de carrinho refatorado para o site mexicano
let carrinhoItens = [];
let etapaAtual = 1;
let dadosEntrega = { nome: '', telefone: '', rua: '', numero: '', bairro: '', complemento: '', referencia: '' };
let formaPagamento = { metodo: 'dinheiro', troco: 0, observacoes: '' };

// Função centralizada para adicionar produtos ao carrinho
// Exposta globalmente para ser acessível a outros scripts
window.adicionarProdutoAoCarrinho = function(nome, quantidade, preco, imagem) {
  console.log('Função centralizada: adicionando ao carrinho:', { nome, quantidade, preco, imagem });
  
  // Sempre recupere o estado atual do localStorage
  const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
  
  // Inicialize o carrinho a partir do localStorage ou como um array vazio
  if (carrinhoSalvo) {
    try {
      carrinhoItens = JSON.parse(carrinhoSalvo);
      console.log('Carrinho recuperado do localStorage:', carrinhoItens);
    } catch (e) {
      console.error('Erro ao carregar carrinho:', e);
      carrinhoItens = [];
    }
  } else {
    console.log('Nenhum carrinho encontrado no localStorage, iniciando vazio');
    carrinhoItens = [];
  }
  
  // Encontrar item existente ou adicionar novo
  const itemExistente = carrinhoItens.find(item => item.nome === nome);
  
  if (itemExistente) {
    console.log('Item já existe, atualizando quantidade');
    itemExistente.quantidade += quantidade;
  } else {
    console.log('Adicionando novo item');
    carrinhoItens.push({ nome, quantidade, preco, imagem });
  }
  
  console.log('Carrinho atualizado:', carrinhoItens);
  console.log('Total de itens no carrinho:', carrinhoItens.length);
  
  // Salvar no localStorage
  localStorage.setItem('carrinhoMexicano', JSON.stringify(carrinhoItens));
  
  // Verificar se foi salvo corretamente
  const verificacao = localStorage.getItem('carrinhoMexicano');
  console.log('Verificação do localStorage após salvar:', verificacao);
  console.log('Número de itens após verificação:', JSON.parse(verificacao).length);
  
  // Atualizar a interface
  atualizarIconeCarrinho();
  mostrarNotificacao(`${quantidade}x ${nome} adicionado ao carrinho!`);
  atualizarBotaoFinalizarPedido();
  return carrinhoItens;
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando carrinho...');
  const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
  console.log('Carrinho salvo no localStorage:', carrinhoSalvo);
  
  if (carrinhoSalvo) {
    try {
      carrinhoItens = JSON.parse(carrinhoSalvo);
      console.log('Carrinho carregado com sucesso:', carrinhoItens);
      console.log('Número de itens carregados:', carrinhoItens.length);
    } catch (e) {
      console.error('Erro ao carregar carrinho:', e);
      carrinhoItens = [];
    }
    atualizarIconeCarrinho();
  } else {
    console.log('Nenhum carrinho salvo encontrado');
  }
  
  const btnCarrinho = document.getElementById('btn-carrinho');
  if (btnCarrinho) btnCarrinho.addEventListener('click', abrirCarrinho);
  
  configurarBotoesAddCarrinho();
  atualizarBotaoFinalizarPedido();
});

function configurarBotoesAddCarrinho() {
  // Adicionar log para debug
  console.log('Configurando botões de adicionar - total:', document.querySelectorAll('.btn-add').length);
  
  // Assegurar que todos os botões de adicionar sejam selecionados
  document.querySelectorAll('.btn-add').forEach((btn, index) => {
    console.log(`Configurando botão ${index}`);
    
    // Remover event listeners existentes para evitar duplicação
    const clonedBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(clonedBtn, btn);
    
    clonedBtn.addEventListener('click', function() {
      const cardItem = this.closest('.card-item');
      if (!cardItem) {
        console.error('Elemento .card-item não encontrado para o botão', index);
        return;
      }
      
      const contadorElement = this.previousElementSibling.previousElementSibling;
      if (!contadorElement) {
        console.error('Elemento contador não encontrado');
        return;
      }
      
      const quantidade = parseInt(contadorElement.textContent);
      
      if (quantidade > 0) {
        const nomeElement = cardItem.querySelector('.title-produto b');
        const precoElement = cardItem.querySelector('.price-produto b');
        const imagemElement = cardItem.querySelector('.img-produto img');
        
        if (!nomeElement || !precoElement || !imagemElement) {
          console.error('Elementos do produto não encontrados', { 
            nome: !!nomeElement, 
            preco: !!precoElement, 
            imagem: !!imagemElement 
          });
          return;
        }
        
        const nome = nomeElement.textContent;
        const preco = parseFloat(precoElement.textContent.replace('R$', '').replace(',', '.').trim());
        const imagem = imagemElement.src;
        
        console.log('Adicionando ao carrinho:', { nome, quantidade, preco, imagem });
        window.adicionarProdutoAoCarrinho(nome, quantidade, preco, imagem);
        contadorElement.textContent = '0';
      }
    });
  });
}

function atualizarIconeCarrinho() {
  const contadorCarrinho = document.querySelector('.carrinho-contador');
  if (contadorCarrinho) {
    const totalItens = carrinhoItens.reduce((total, item) => total + item.quantidade, 0);
    console.log('Atualizando ícone do carrinho com total:', totalItens);
    contadorCarrinho.textContent = totalItens;
    contadorCarrinho.classList.add('pulse');
    setTimeout(() => contadorCarrinho.classList.remove('pulse'), 500);
  }
}

function abrirCarrinho() {
  console.log('Abrindo carrinho...');
  // Recarregar o carrinho do localStorage antes de abrir
  const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
  if (carrinhoSalvo) {
    try {
      carrinhoItens = JSON.parse(carrinhoSalvo);
      console.log('Carrinho recarregado do localStorage ao abrir:', carrinhoItens.length, 'itens');
    } catch (e) {
      console.error('Erro ao recarregar carrinho:', e);
    }
  }
  
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
  console.log('Renderizando etapa do carrinho:', etapaAtual);
  console.log('Número de itens no carrinho para renderizar:', carrinhoItens.length);
  
  const modalCarrinho = document.getElementById('modalCarrinho');
  if (!modalCarrinho) return;
  
  const titulos = ['Seu Carrinho', 'Dados de Entrega', 'Finalizar Pedido'];
  
  let conteudoModal = `
    <div class="modal-conteudo">
      <div class="modal-header">
        <h2>${titulos[etapaAtual - 1]}</h2>
        <button class="btn-fechar-modal">&times;</button>
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
        ${etapaAtual > 1 ? `<button class="btn btn-voltar">Voltar</button>` : ''}
        ${etapaAtual < 3 ? 
          `<button class="btn btn-continuar ${carrinhoItens.length === 0 && etapaAtual === 1 ? 'disabled' : ''}" 
            ${carrinhoItens.length === 0 && etapaAtual === 1 ? 'disabled' : ''}>Continuar</button>` : 
          `<button class="btn btn-finalizar">Finalizar Pedido</button>`}
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
  
  // Configurar eventos específicos para cada etapa
  if (etapaAtual === 1) {
    setTimeout(() => {
      configurarBotoesQuantidadeCarrinho();
      
      if (carrinhoItens.length === 0) {
        const btnContinuarComprando = modalCarrinho.querySelector('.btn-continuar-comprando');
        if (btnContinuarComprando) btnContinuarComprando.addEventListener('click', fecharCarrinho);
      }
    }, 100); // Pequeno delay para garantir que o DOM foi totalmente atualizado
  } 
  else if (etapaAtual === 2) {
    configurarEventosFormularioEntrega();
  }
  else {
    configurarEventosFormaPagamento();
  }
}

function renderizarEtapa1() {
  console.log('Renderizando etapa 1 com', carrinhoItens.length, 'itens');
  
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
    console.log('Renderizando item:', item.nome, 'na posição', index);
    const subtotal = (item.preco * item.quantidade).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    });
    
    conteudo += `
      <div class="item-carrinho" data-nome="${item.nome}">
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

function configurarBotoesQuantidadeCarrinho() {
  setTimeout(() => {   
    document.querySelectorAll('.btn-mais-carrinho').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        console.log('Incrementando item no índice:', index);
        if (index >= 0 && index < carrinhoItens.length) {
          carrinhoItens[index].quantidade++;
          atualizarCarrinho();
        } else {
          console.error('Índice inválido ao incrementar:', index);
        }
      });
    });
    
    document.querySelectorAll('.btn-menos-carrinho').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        console.log('Decrementando item no índice:', index);
        if (index >= 0 && index < carrinhoItens.length && carrinhoItens[index].quantidade > 1) {
          carrinhoItens[index].quantidade--;
          atualizarCarrinho();
        } else {
          console.error('Índice inválido ou quantidade mínima atingida:', index);
        }
      });
    });
    
    document.querySelectorAll('.btn-remover').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        console.log('Removendo item no índice:', index);
        if (index >= 0 && index < carrinhoItens.length) {
          carrinhoItens.splice(index, 1);
          atualizarCarrinho();
        } else {
          console.error('Índice inválido ao remover:', index);
        }
      });
    });
  }, 100);
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
  console.log('Atualizando carrinho. Número de itens a salvar:', carrinhoItens.length);
  localStorage.setItem('carrinhoMexicano', JSON.stringify(carrinhoItens));
  
  // Verificar se foi salvo corretamente
  const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
  console.log('Carrinho salvo após atualização:', carrinhoSalvo);
  if (carrinhoSalvo) {
    const parsedCarrinho = JSON.parse(carrinhoSalvo);
    console.log('Número de itens salvos:', parsedCarrinho.length);
  }
  
  atualizarIconeCarrinho();
  renderizarEtapaCarrinho();
  atualizarBotaoFinalizarPedido();
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
  
  // Usando entidades HTML para emojis
  let mensagem = "🌮 *NOVO PEDIDO PINCHES TACOS* 🌮\n\n";
  
  mensagem += "*ITENS DO PEDIDO:*\n";
  carrinhoItens.forEach(item => {
    mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
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
  
  try {
    // Simplificar o processo de codificação da URL
    const numeroWhatsApp = "554188017564"; // Substitua pelo número real
    
    // Use encodeURIComponent para codificar toda a mensagem para URL
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;
    
    // Limpar o carrinho após finalizar o pedido
    carrinhoItens = [];
    localStorage.removeItem('carrinhoMexicano');
    atualizarIconeCarrinho();
    fecharCarrinho();
    
    window.open(urlWhatsApp, '_blank');
    mostrarNotificacao('Pedido enviado com sucesso!', 'sucesso');
  } catch (e) {
    console.error("Erro ao enviar mensagem:", e);
    mostrarNotificacao('Erro ao enviar pedido. Tente novamente.', 'erro');
  }
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



// Adicionar esta função ao final do arquivo carrinho.js
function atualizarBotaoFinalizarPedido() {
    const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');
    
    // Se o botão ainda não existir, vamos criá-lo
    if (!btnFinalizarPedido && carrinhoItens.length > 0) {
      const btnContainer = document.querySelector('.navbar-buttons');
      
      if (btnContainer) {
        const btn = document.createElement('a');
        btn.id = 'btn-finalizar-pedido';
        btn.className = 'btn btn-yellow btn-menu mt-4 mr-3 animate__animated animate__flipInX wow';
        btn.href = '#';
        btn.textContent = 'Finalizar Pedido';
        
        // Inserir antes do botão do carrinho
        const btnCarrinho = document.getElementById('btn-carrinho');
        if (btnCarrinho) {
          btnContainer.insertBefore(btn, btnCarrinho);
        } else {
          btnContainer.appendChild(btn);
        }
        
        // Adicionar evento para abrir o carrinho
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          abrirCarrinho();
        });
      }
    } 
    // Se o botão já existe, mostrá-lo ou ocultá-lo conforme necessário
    else if (btnFinalizarPedido) {
      if (carrinhoItens.length > 0) {
        btnFinalizarPedido.style.display = 'inline-block';
      } else {
        btnFinalizarPedido.style.display = 'none';
      }
    }
  }

  // Adicionar esta função no final do seu arquivo carrinho.js
document.addEventListener('DOMContentLoaded', function() {
    // Criando o botão "Finalizar Pedido" fixo e o adicionando logo após o cardápio
    const secaoCardapio = document.getElementById('Cardapio');
    
    if (secaoCardapio) {
      const botaoContainer = document.createElement('div');
      botaoContainer.className = 'container text-center my-4';
      
      const botaoFinalizarPedido = document.createElement('a');

      
      botaoFinalizarPedido.addEventListener('click', function(e) {
        e.preventDefault();
        abrirCarrinho(); // Abre diretamente o carrinho
      });
      
      botaoContainer.appendChild(botaoFinalizarPedido);
      secaoCardapio.parentNode.insertBefore(botaoContainer, secaoCardapio.nextSibling);
      
      // Verifica se há itens no carrinho para mostrar o botão
      const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
      if (carrinhoSalvo) {
        try {
          const itens = JSON.parse(carrinhoSalvo);
          if (itens && itens.length > 0) {
            botaoFinalizarPedido.style.display = 'inline-block';
          }
        } catch (e) {
          console.error('Erro ao verificar carrinho:', e);
        }
      }
    }
    
    // Modificar a função atualizarCarrinho para também atualizar a visibilidade do botão
    const originalAtualizarCarrinho = window.atualizarCarrinho;
    window.atualizarCarrinho = function() {
      // Chama a função original
      if (typeof originalAtualizarCarrinho === 'function') {
        originalAtualizarCarrinho.apply(this, arguments);
      }
      
      // Atualiza o botão fixo
      const botaoFixo = document.getElementById('btn-finalizar-fixo');
      if (botaoFixo) {
        botaoFixo.style.display = carrinhoItens.length > 0 ? 'inline-block' : 'none';
      }
    };
    
    // Modificar a função adicionarProdutoAoCarrinho para atualizar o botão
    const originalAdicionarProduto = window.adicionarProdutoAoCarrinho;
    window.adicionarProdutoAoCarrinho = function(nome, quantidade, preco, imagem) {
      // Chama a função original
      const resultado = originalAdicionarProduto.apply(this, arguments);
      
      // Atualiza o botão fixo
      const botaoFixo = document.getElementById('btn-finalizar-fixo');
      if (botaoFixo) {
        botaoFixo.style.display = 'inline-block';
      }
      
      return resultado;
    };
    
    // Alternativa simples: Botão flutuante sempre visível quando há itens
    const botaoFlutuante = document.createElement('a');
    botaoFlutuante.id = 'btn-finalizar-flutuante';
    botaoFlutuante.className = 'btn btn-yellow animate__animated animate__bounceIn';
    botaoFlutuante.href = '#';
    botaoFlutuante.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="ml-2">Finalizar Pedido</span>';
    botaoFlutuante.style.position = 'fixed';
    botaoFlutuante.style.bottom = '20px';
    botaoFlutuante.style.right = '20px';
    botaoFlutuante.style.zIndex = '9999';
    botaoFlutuante.style.padding = '10px 15px';
    botaoFlutuante.style.borderRadius = 'px';
    botaoFlutuante.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    botaoFlutuante.style.display = 'none'; // Começa oculto
    
    botaoFlutuante.addEventListener('click', function(e) {
      e.preventDefault();
      abrirCarrinho(); // Abre diretamente o carrinho
    });
    
    document.body.appendChild(botaoFlutuante);
    
    // Verifica inicialmente se há itens no carrinho
    const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
    if (carrinhoSalvo) {
      try {
        const itens = JSON.parse(carrinhoSalvo);
        if (itens && itens.length > 0) {
          botaoFlutuante.style.display = 'flex';
        }
      } catch (e) {
        console.error('Erro ao verificar carrinho para botão flutuante:', e);
      }
    }
    
    // Atualize o botão flutuante sempre que o carrinho for atualizado
    const intervalVerificacao = setInterval(function() {
      const carrinhoSalvo = localStorage.getItem('carrinhoMexicano');
      if (carrinhoSalvo) {
        try {
          const itens = JSON.parse(carrinhoSalvo);
          botaoFlutuante.style.display = itens && itens.length > 0 ? 'flex' : 'none';
        } catch (e) {
          console.error('Erro ao verificar carrinho:', e);
        }
      } else {
        botaoFlutuante.style.display = 'none';
      }
    }, 1000); // Verifica a cada segundo
  });