import './style.css'
import { categorias, produtos } from './menu-data.js';



// Espera o documento carregar completamente
document.addEventListener('DOMContentLoaded', function() {
  // Funcionalidade dos botões de categoria
  const botoesCategoria = document.querySelectorAll('.btn-categoria');
  
  botoesCategoria.forEach(botao => {
    botao.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove a classe ativa de todos os botões
      botoesCategoria.forEach(b => b.classList.remove('active'));
      
      // Adiciona a classe ativa ao botão clicado
      this.classList.add('active');
      
      // Aqui você pode adicionar lógica para filtrar os itens do cardápio
      const categoria = this.getAttribute('data-categoria');
      filtrarProdutosPorCategoria(categoria);
    });
  });
  
  // Funcionalidade dos botões de quantidade
  const botoesAdicionar = document.querySelectorAll('.btn-mais');
  const botoesRemover = document.querySelectorAll('.btn-menos');
  const botoesAddCarrinho = document.querySelectorAll('.btn-add');
  
  botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', function() {
      const contadorElement = this.previousElementSibling;
      let contador = parseInt(contadorElement.textContent);
      contador++;
      contadorElement.textContent = contador;
      
      // Anima o botão quando clicado
      this.classList.add('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 150);
    });
  });
  
  botoesRemover.forEach(botao => {
    botao.addEventListener('click', function() {
      const contadorElement = this.nextElementSibling;
      let contador = parseInt(contadorElement.textContent);
      if (contador > 0) {
        contador--;
        contadorElement.textContent = contador;
      }
      
      // Anima o botão quando clicado
      this.classList.add('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 150);
    });
  });
  
  botoesAddCarrinho.forEach(botao => {
    botao.addEventListener('click', function() {
      const contadorElement = this.previousElementSibling.previousElementSibling;
      const contador = parseInt(contadorElement.textContent);
      
      if (contador > 0) {
        const cardItem = this.closest('.card-item');
        const nomeProduto = cardItem.querySelector('.title-produto b').textContent;
        const precoProduto = cardItem.querySelector('.price-produto b').textContent;
        
        // Adiciona ao carrinho
        adicionarAoCarrinho(nomeProduto, contador, precoProduto);
        
        // Feedback visual
        this.classList.add('added');
        setTimeout(() => {
          this.classList.remove('added');
        }, 500);
        
        // Reset contador após adicionar
        contadorElement.textContent = '0';
        
        // Mostrar mensagem de sucesso
        mostrarNotificacao(`${contador}x ${nomeProduto} adicionado ao carrinho!`);
      }
    });
  });
  
  // Função para filtrar produtos por categoria
  function filtrarProdutosPorCategoria(categoria) {
    // Aqui você implementaria a lógica para mostrar apenas os produtos
    // da categoria selecionada, possivelmente fazendo uma chamada AJAX
    // ou filtrando os elementos já presentes na página
    
    console.log(`Filtrando produtos por categoria: ${categoria}`);
    
    // Exemplo de implementação básica (simulação)
    const todosCards = document.querySelectorAll('.card-item');
    
    // Animação de saída para todos os cards
    todosCards.forEach(card => {
      card.style.opacity = '0.3';
      card.style.transform = 'scale(0.95)';
    });
    
    // Simula carregamento de dados
    setTimeout(() => {
      // Animação de entrada para os cards filtrados
      todosCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      });
    }, 300);
  }
  
  // Função para adicionar ao carrinho (simulação)
  function adicionarAoCarrinho(produto, quantidade, preco) {
    console.log(`Adicionado ao carrinho: ${quantidade}x ${produto} - ${preco}`);
    
    // Aqui você implementaria a lógica para adicionar ao carrinho
    // possivelmente usando localStorage ou enviando para um backend
    
    // Atualiza o contador do carrinho (se existir)
    const carrinhoContador = document.querySelector('.carrinho-contador');
    if (carrinhoContador) {
      let total = parseInt(carrinhoContador.textContent || '0');
      total += quantidade;
      carrinhoContador.textContent = total;
      
      // Anima o contador
      carrinhoContador.classList.add('pulse');
      setTimeout(() => {
        carrinhoContador.classList.remove('pulse');
      }, 500);
    }
  }
  
  // Função para mostrar notificação
  function mostrarNotificacao(mensagem) {
    // Verifica se já existe uma notificação
    let notificacao = document.querySelector('.notificacao-carrinho');
    
    if (!notificacao) {
      // Cria o elemento de notificação
      notificacao = document.createElement('div');
      notificacao.className = 'notificacao-carrinho';
      document.body.appendChild(notificacao);
    }
    
    // Atualiza o texto e mostra a notificação
    notificacao.textContent = mensagem;
    notificacao.classList.add('mostrar');
    
    // Remove a notificação após 2 segundos
    setTimeout(() => {
      notificacao.classList.remove('mostrar');
    }, 2000);
  }
  
  // Adiciona efeito de hover aos cards
  const cards = document.querySelectorAll('.card-item');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Adiciona sombra mais profunda no hover
      this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
      this.style.transform = 'translateY(-10px)';
      
      // Escala a imagem suavemente
      const img = this.querySelector('.img-produto img');
      if (img) {
        img.style.transform = 'scale(1.1)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      // Retorna à sombra normal
      this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
      this.style.transform = 'translateY(0)';
      
      // Retorna a imagem ao tamanho normal
      const img = this.querySelector('.img-produto img');
      if (img) {
        img.style.transform = 'scale(1)';
      }
    });
  });
  
  // Inicializa com a primeira categoria selecionada
  if (botoesCategoria.length > 0) {
    botoesCategoria[0].classList.add('active');
    const primeiraCategoria = botoesCategoria[0].getAttribute('data-categoria');
    filtrarProdutosPorCategoria(primeiraCategoria);
  }
});

// CSS adicional para as notificações (adicionar ao seu arquivo CSS)
const estiloNotificacao = `
.notificacao-carrinho {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--color-red);
  color: white;
  padding: 15px 25px;
  border-radius: 50px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.notificacao-carrinho.mostrar {
  transform: translateY(0);
  opacity: 1;
}

.carrinho-contador.pulse {
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.btn-menos.clicked, .btn-mais.clicked {
  transform: scale(0.8);
}

.btn-add.added {
  background-color: var(--verde-mexicano);
  transform: translateX(5px);
}
`;

// Adiciona os estilos de notificação ao documento
const styleElement = document.createElement('style');
styleElement.textContent = estiloNotificacao;
document.head.appendChild(styleElement);






//RENDERIZAR ITENS DO CARDAPIO //
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script de renderização carregado!');

  // Adicionar a estrutura do dropdown mobile se ainda não existir
  setupMobileDropdown();
  
  // Configurar eventos de clique para categorias
  setupCategoryEvents();
  
  // Configurar funcionalidade do dropdown
  setupDropdownToggle();
  
  // Renderizar produtos da primeira categoria por padrão
  if (categorias && categorias.length > 0) {
    // Marcar o primeiro botão como ativo
    const primeiroBotaoDesktop = document.querySelector('.btn-categoria');
    const primeiroBotaoMobile = document.querySelector('.dropdown-item');
    
    if (primeiroBotaoDesktop) primeiroBotaoDesktop.classList.add('active');
    if (primeiroBotaoMobile) {
      primeiroBotaoMobile.classList.add('active');
      
      // Atualizar o texto do dropdown
      const dropdownToggle = document.querySelector('.dropdown-toggle');
      if (dropdownToggle) {
        const spanElement = dropdownToggle.querySelector('span');
        if (spanElement) {
          spanElement.textContent = categorias[0].nome;
        }
      }
    }
    
    // Renderizar produtos da primeira categoria
    renderizarProdutos(categorias[0].id);
  } else {
    console.error('Erro: Dados de categorias não disponíveis.');
  }
});

// Configurar a estrutura do dropdown mobile se não existir
function setupMobileDropdown() {
  const containerMenu = document.querySelector('.container-menu');
  
  // Verificar se já existe a estrutura do dropdown
  if (!containerMenu.querySelector('.categoria-dropdown') && !containerMenu.querySelector('.categoria-wrapper.d-none.d-md-flex')) {
    const categoriaWrapper = containerMenu.querySelector('.categoria-wrapper');
    
    if (categoriaWrapper) {
      // Adicionar classe para esconder em mobile
      categoriaWrapper.classList.add('d-none', 'd-md-flex', 'justify-content-center', 'flex-wrap');
      
      // Criar o dropdown para mobile
      const dropdownHTML = `
        <div class="categoria-dropdown d-md-none">
          <div class="dropdown-toggle" id="categoriasDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span>Escolha uma categoria</span>
            <i class="fas fa-chevron-down ms-2"></i>
          </div>
          <div class="dropdown-menu" aria-labelledby="categoriasDropdown">
            ${categorias.map(categoria => `
              <a class="dropdown-item" href="#${categoria.id}" data-categoria="${categoria.id}">
                <img src="${categoria.icone}" width="25px" alt="" class="categoria-icon-small me-2" />
                ${categoria.nome}
              </a>
            `).join('')}
          </div>
        </div>
      `;
      
      // Inserir após o wrapper de categorias
      categoriaWrapper.insertAdjacentHTML('afterend', dropdownHTML);
    }
  }
}

// Configurar eventos de clique para as categorias
function setupCategoryEvents() {
  const botoesCategoria = document.querySelectorAll('.btn-categoria, .dropdown-item');
  
  botoesCategoria.forEach(botao => {
    botao.addEventListener('click', function(e) {
      e.preventDefault();
      
      const categoria = this.getAttribute('data-categoria');
      if (categoria) {
        // Remover classe ativa de todos os botões
        botoesCategoria.forEach(b => b.classList.remove('active'));
        
        // Adicionar classe ativa ao botão clicado
        this.classList.add('active');
        
        // Renderizar produtos da categoria
        renderizarProdutos(categoria);
        
        // Se for item do dropdown, atualizar o texto e fechar o dropdown
        if (this.classList.contains('dropdown-item')) {
          const dropdownToggle = document.querySelector('.dropdown-toggle');
          if (dropdownToggle) {
            const spanElement = dropdownToggle.querySelector('span');
            if (spanElement) {
              spanElement.textContent = this.textContent.trim();
            }
            
            const dropdownMenu = document.querySelector('.dropdown-menu');
            if (dropdownMenu) {
              dropdownMenu.classList.remove('show');
              dropdownToggle.setAttribute('aria-expanded', 'false');
            }
          }
        }
      }
    });
  });
}

// Configurar funcionalidade do dropdown toggle
function setupDropdownToggle() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdownMenu = document.querySelector('.dropdown-menu');
      if (dropdownMenu) {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          dropdownMenu.classList.remove('show');
          this.setAttribute('aria-expanded', 'false');
        } else {
          dropdownMenu.classList.add('show');
          this.setAttribute('aria-expanded', 'true');
        }
      }
    });
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.categoria-dropdown')) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
          dropdownMenu.classList.remove('show');
          dropdownToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
}

// Função para renderizar os produtos por categoria
function renderizarProdutos(categoriaId = null) {
  console.log('Renderizando produtos para categoria:', categoriaId);
  
  const containerProdutos = document.getElementById('itensCardapio');
  if (!containerProdutos) {
    console.error('Erro: Container de produtos não encontrado!');
    return;
  }
  
  containerProdutos.innerHTML = '';
  
  // Filtrar produtos pela categoria
  let produtosFiltrados = categoriaId 
    ? produtos.filter(produto => produto.categoria === categoriaId)
    : produtos;
  
  console.log('Produtos filtrados:', produtosFiltrados);
  
  // Se não houver produtos
  if (produtosFiltrados.length === 0) {
    containerProdutos.innerHTML = `
      <div class="col-12 text-center py-5">
        <p>Nenhum produto encontrado nesta categoria.</p>
      </div>
    `;
    return;
  }
  
  // Renderizar cada produto
  produtosFiltrados.forEach(produto => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-3 col-sm-6 mb-4';
    
    // Formatar o preço corretamente
    const precoFormatado = produto.preco.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
    
    // HTML do card de produto
    colDiv.innerHTML = `
      <div class="card card-item">
        ${produto.etiqueta ? `<div class="etiqueta-especial">${produto.etiqueta}</div>` : ''}
        <div class="img-produto">
          <img src="${produto.imagem}" alt="${produto.nome}" />
        </div>
        <p class="title-produto text-center mt-4">
          <b>${produto.nome}</b>
        </p>
        <p class="descricao-produto text-muted text-center">
          ${produto.descricao}
        </p>
        <p class="price-produto text-center">
          <b>${precoFormatado}</b>
        </p>
        <div class="add-carrinho">
          <span class="btn-menos"><i class="fas fa-minus"></i></span>
          <span class="add-numero-itens">0</span>
          <span class="btn-mais"><i class="fas fa-plus"></i></span>
          <span class="btn btn-add"><i class="fas fa-shopping-bag"></i></span>
        </div>
      </div>
    `;
    
    containerProdutos.appendChild(colDiv);
  });
  
  // Configurar eventos dos botões de adicionar/remover
  setupCartButtons();
}

// Configurar botões de adicionar/remover do carrinho
function setupCartButtons() {
  // Botões de adicionar quantidade
  const btnMais = document.querySelectorAll('.btn-mais');
  btnMais.forEach(btn => {
    btn.addEventListener('click', function() {
      const contadorElement = this.previousElementSibling;
      let contador = parseInt(contadorElement.textContent);
      contador++;
      contadorElement.textContent = contador;
      
      // Adicionar classe para animação
      this.classList.add('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 150);
    });
  });
  
  // Botões de remover quantidade
  const btnMenos = document.querySelectorAll('.btn-menos');
  btnMenos.forEach(btn => {
    btn.addEventListener('click', function() {
      const contadorElement = this.nextElementSibling;
      let contador = parseInt(contadorElement.textContent);
      if (contador > 0) {
        contador--;
        contadorElement.textContent = contador;
      }
      
      // Adicionar classe para animação
      this.classList.add('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 150);
    });
  });
  
  // Botões de adicionar ao carrinho
  const btnAdd = document.querySelectorAll('.btn-add');
  btnAdd.forEach(btn => {
    btn.addEventListener('click', function() {
      const contadorElement = this.previousElementSibling.previousElementSibling;
      const contador = parseInt(contadorElement.textContent);
      
      if (contador > 0) {
        const cardItem = this.closest('.card-item');
        const nomeProduto = cardItem.querySelector('.title-produto b').textContent;
        const precoProduto = cardItem.querySelector('.price-produto b').textContent;
        
        // Adicionar ao carrinho (simulação)
        console.log(`Adicionado ao carrinho: ${contador}x ${nomeProduto} - ${precoProduto}`);
        
        // Feedback visual
        this.classList.add('added');
        setTimeout(() => {
          this.classList.remove('added');
        }, 500);
        
        // Reset contador
        contadorElement.textContent = '0';
        
        // Mostrar notificação
        mostrarNotificacao(`${contador}x ${nomeProduto} adicionado ao carrinho!`);
      }
    });
  });
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem) {
  // Verificar se já existe uma notificação
  let notificacao = document.querySelector('.notificacao-carrinho');
  
  if (!notificacao) {
    // Criar elemento de notificação
    notificacao = document.createElement('div');
    notificacao.className = 'notificacao-carrinho';
    document.body.appendChild(notificacao);
  }
  
  // Atualizar texto e mostrar notificação
  notificacao.textContent = mensagem;
  notificacao.classList.add('mostrar');
  
  // Remover após 2 segundos
  setTimeout(() => {
    notificacao.classList.remove('mostrar');
  }, 2000);
}


document.addEventListener('DOMContentLoaded', function() {
  // Elementos da navbar
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarNavDropdown');
  
  if (navbarToggler && navbarCollapse) {
    // Função para fechar o menu
    function closeMenu() {
      if (navbarCollapse.classList.contains('show')) {
        // Tenta usar a API do Bootstrap 5 se disponível
        if (typeof bootstrap !== 'undefined') {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          } else {
            // Fallback se não conseguir obter a instância
            navbarCollapse.classList.remove('show');
          }
        } else {
          // Fallback para Bootstrap 4 ou método manual
          navbarCollapse.classList.remove('show');
        }
        
        // Remove a classe do body que controla o overlay
        document.body.classList.remove('menu-open');
      }
    }
    
    // Adicionar evento ao botão de menu
    navbarToggler.addEventListener('click', function() {
      setTimeout(function() {
        if (navbarCollapse.classList.contains('show')) {
          document.body.classList.add('menu-open');
        } else {
          document.body.classList.remove('menu-open');
        }
      }, 150);
    });
    
    // Adicionar evento para o botão X (pseudo-elemento)
    // Como não podemos acessar diretamente o pseudo-elemento, vamos usar uma área clicável
    navbarCollapse.addEventListener('click', function(e) {
      // Verificar se o clique foi na área do X (canto superior direito)
      const rect = navbarCollapse.getBoundingClientRect();
      // Define uma área maior para facilitar o clique no X (30x30 pixels)
      if (e.clientX > rect.left + rect.width - 50 && e.clientX < rect.left + rect.width &&
          e.clientY > rect.top && e.clientY < rect.top + 50) {
        e.preventDefault();
        closeMenu();
      }
    });
    
    // Adicionar evento para fechar o menu quando clicar em links
    const navLinks = document.querySelectorAll('#navbarNavDropdown .nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        // Verificar se estamos em viewport mobile
        if (window.innerWidth <= 767) {  // Combina com seu media query
          // Se for link interno com hash, permitir comportamento normal após fechar
          const href = this.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            closeMenu();
            setTimeout(function() {
              window.location.hash = href;
            }, 350); // Tempo para animação completar
          } else {
            // Para links normais, apenas fechar o menu
            closeMenu();
          }
        }
      });
    });
    
    // Adicionar evento para fechar o menu ao clicar no overlay
    document.addEventListener('click', function(e) {
      if (document.body.classList.contains('menu-open')) {
        // Verificar se o clique foi fora do menu e não no botão do menu
        if (!navbarCollapse.contains(e.target) && 
            e.target !== navbarToggler && 
            !navbarToggler.contains(e.target)) {
          closeMenu();
        }
      }
    });
  }
});




