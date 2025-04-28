import { categorias, produtos } from './menu-data.js';

document.addEventListener('DOMContentLoaded', function() {
    // Renderizar as categorias
    renderizarCategorias();
    
    // Renderizar os produtos (inicialmente, mostrar todos ou uma categoria específica)
    renderizarProdutos('entradas'); // Começar com a categoria "entradas"
    
    // Configurar funcionalidades interativas
    configurarInteracoes();
  });
  
  // Função para renderizar as categorias (botões de filtro e dropdown mobile)
  function renderizarCategorias() {
    // Container para os botões de desktop
    const categoriaWrapper = document.querySelector('.categoria-wrapper');
    categoriaWrapper.innerHTML = '';
    
    // Container para o dropdown mobile (precisamos criar esse elemento se ainda não existir)
    let dropdownContainer = document.querySelector('.categoria-dropdown');
    
    if (!dropdownContainer) {
      dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'categoria-dropdown d-md-none';
      
      // Adicionar o dropdown container após o wrapper de desktop
      categoriaWrapper.parentNode.appendChild(dropdownContainer);
      
      // Criar a estrutura do dropdown
      dropdownContainer.innerHTML = `
        <div class="dropdown-toggle" id="categoriasDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span>Escolha uma categoria</span>
          <i class="fas fa-chevron-down ml-2"></i>
        </div>
        <div class="dropdown-menu" aria-labelledby="categoriasDropdown"></div>
      `;
    }
    
    const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu');
    dropdownMenu.innerHTML = '';
    
    // Renderizar cada categoria como botão e item de dropdown
    categorias.forEach(categoria => {
      // Criar botão para desktop
      const botaoDesktop = document.createElement('a');
      botaoDesktop.className = 'btn btn-white btn-categoria me-2 mr-3';
      botaoDesktop.href = `#${categoria.id}`;
      botaoDesktop.setAttribute('data-categoria', categoria.id);
      botaoDesktop.innerHTML = `
        <img src="${categoria.icone}" width="40px" alt="" class="categoria-icon" />
        <span>${categoria.nome}</span>
      `;
      categoriaWrapper.appendChild(botaoDesktop);
      
      // Criar item para dropdown mobile
      const itemMobile = document.createElement('a');
      itemMobile.className = 'dropdown-item';
      itemMobile.href = `#${categoria.id}`;
      itemMobile.setAttribute('data-categoria', categoria.id);
      itemMobile.innerHTML = `
        <img src="${categoria.icone}" width="25px" alt="" class="categoria-icon-small mr-2" />
        ${categoria.nome}
      `;
      dropdownMenu.appendChild(itemMobile);
    });
  }
  
  // Função para renderizar os produtos filtrados por categoria
  function renderizarProdutos(categoriaId = null) {
    const containerProdutos = document.getElementById('itensCardapio');
    containerProdutos.innerHTML = '';
    
    // Filtrar produtos pela categoria, se especificada
    let produtosFiltrados = categoriaId 
      ? produtos.filter(produto => produto.categoria === categoriaId)
      : produtos;
    
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
    
    // Se não houver produtos nesta categoria
    if (produtosFiltrados.length === 0) {
      containerProdutos.innerHTML = `
        <div class="col-12 text-center py-5">
          <p>Nenhum produto encontrado nesta categoria.</p>
        </div>
      `;
    }
    
    // Animação de entrada para os produtos
    const cards = containerProdutos.querySelectorAll('.card-item');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50 * index); // Atraso escalonado para cada card
    });
  }
  
  // Função para configurar interações
  function configurarInteracoes() {
    // Selecionar todos os botões de categoria (desktop e mobile)
    const botoesCategoria = document.querySelectorAll('.btn-categoria, .dropdown-item');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    // Adicionar evento de clique a cada botão
    botoesCategoria.forEach(botao => {
      botao.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remover classe ativa de todos os botões
        botoesCategoria.forEach(b => b.classList.remove('active'));
        
        // Adicionar classe ativa ao botão clicado
        this.classList.add('active');
        
        // Obter categoria selecionada
        const categoria = this.getAttribute('data-categoria');
        
        // Atualizar texto do dropdown no mobile
        if (dropdownToggle && this.classList.contains('dropdown-item')) {
          const spanElement = dropdownToggle.querySelector('span');
          if (spanElement) {
            spanElement.textContent = this.textContent.trim();
          }
          
          // Fechar o dropdown
          const dropdownMenu = document.querySelector('.dropdown-menu');
          dropdownMenu.classList.remove('show');
          dropdownToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Renderizar produtos da categoria selecionada
        renderizarProdutos(categoria);
      });
    });
    
    // Configurar a funcionalidade do dropdown toggle
    if (dropdownToggle) {
      dropdownToggle.addEventListener('click', function() {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // Toggle do dropdown
        if (isExpanded) {
          dropdownMenu.classList.remove('show');
          this.setAttribute('aria-expanded', 'false');
        } else {
          dropdownMenu.classList.add('show');
          this.setAttribute('aria-expanded', 'true');
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
    
    // Configurar os botões de adicionar/remover itens
    document.addEventListener('click', function(e) {
      // Botão de adicionar quantidade
      if (e.target.closest('.btn-mais')) {
        const btnMais = e.target.closest('.btn-mais');
        const contadorElement = btnMais.previousElementSibling;
        let contador = parseInt(contadorElement.textContent);
        contador++;
        contadorElement.textContent = contador;
        
        // Animação de clique
        btnMais.classList.add('clicked');
        setTimeout(() => {
          btnMais.classList.remove('clicked');
        }, 150);
      }
      
      // Botão de remover quantidade
      if (e.target.closest('.btn-menos')) {
        const btnMenos = e.target.closest('.btn-menos');
        const contadorElement = btnMenos.nextElementSibling;
        let contador = parseInt(contadorElement.textContent);
        if (contador > 0) {
          contador--;
          contadorElement.textContent = contador;
        }
        
        // Animação de clique
        btnMenos.classList.add('clicked');
        setTimeout(() => {
          btnMenos.classList.remove('clicked');
        }, 150);
      }
      
      // Botão de adicionar ao carrinho
      if (e.target.closest('.btn-add')) {
        const btnAdd = e.target.closest('.btn-add');
        const contadorElement = btnAdd.previousElementSibling.previousElementSibling;
        const contador = parseInt(contadorElement.textContent);
        
        if (contador > 0) {
          const cardItem = btnAdd.closest('.card-item');
          const nomeProduto = cardItem.querySelector('.title-produto b').textContent;
          const precoProduto = cardItem.querySelector('.price-produto b').textContent;
          
          // Adicionar ao carrinho (simulação)
          console.log(`Adicionado ao carrinho: ${contador}x ${nomeProduto} - ${precoProduto}`);
          
          // Feedback visual
          btnAdd.classList.add('added');
          setTimeout(() => {
            btnAdd.classList.remove('added');
          }, 500);
          
          // Reset contador
          contadorElement.textContent = '0';
          
          // Mostrar notificação
          mostrarNotificacao(`${contador}x ${nomeProduto} adicionado ao carrinho!`);
        }
      }
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
  
  // Inicializar o cardápio quando o documento estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    // Definir a estrutura inicial do HTML
    const containerMenu = document.querySelector('.container-menu');
    if (!containerMenu.querySelector('.categoria-wrapper')) {
      containerMenu.innerHTML = `
        <!-- Versão para Desktop -->
        <div class="categoria-wrapper d-none d-md-flex justify-content-center flex-wrap">
          <!-- Botões de categoria serão inseridos aqui -->
        </div>
        
        <!-- Versão Mobile com Dropdown -->
        <div class="categoria-dropdown d-md-none">
          <div class="dropdown-toggle" id="categoriasDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span>Escolha uma categoria</span>
            <i class="fas fa-chevron-down ml-2"></i>
          </div>
          <div class="dropdown-menu" aria-labelledby="categoriasDropdown">
            <!-- Itens do dropdown serão inseridos aqui -->
          </div>
        </div>
      `;
    }
    
    // Renderizar as categorias
    renderizarCategorias();
    
    // Renderizar produtos (começando com a primeira categoria)
    if (categorias.length > 0) {
      renderizarProdutos(categorias[0].id);
      
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
    }
    
    // Configurar interações
    configurarInteracoes();
  });