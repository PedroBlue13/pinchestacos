// Arquivo: src/menu-data.js
// Estrutura dos dados para o cardápio mexicano

// Categorias do menu
const categorias = [
  {
    id: "entradas",
    nome: "Entradas",
    icone: ""
  },
  {
    id: "burrito",
    nome: "Burrito",
    icone: ""
  },
  {
    id: "tacos",
    nome: "Tacos",
    icone: ""
  },
  {
    id: "dorados",
    nome: "Dorados",
    icone: ""
  },
  {
    id: "quesadilla",
    nome: "Quesadilla",
    icone: ""
  },
  {
    id: "tostada",
    nome: "Tostada",
    icone: ""
  },
  {
    id: "drinks",
    nome: "Drinks",
    icone: ""
  },
  {
    id: "bebidas",
    nome: "Bebidas",
    icone: ""
  }
];

// Produtos do cardápio
const produtos = [
  // ENTRADAS
  {
    id: 1,
    nome: "Chicharrón",
    categoria: "entradas",
    preco: 32.00,
    descricao: "Deliciosos pedaços de barriga de porco fritos até ficarem crocantes por fora e suculentos por dentro.",
    imagem: "./img/cardapio/chicharron.jpg",
    etiqueta: "Popular",
    destaque: true
  },
  {
    id: 2,
    nome: "Guacamole",
    categoria: "entradas",
    preco: 24.50,
    descricao: "Abacate amassado com tomate, cebola, coentro, limão e pimenta jalapeño, servido com tortilhas de milho.",
    imagem: "./img/cardapio/guaca.jpg",
    etiqueta: "Vegano",
    destaque: false
  },
  {
    id: 3,
    nome: "Nachos Supremos",
    categoria: "entradas",
    preco: 39.90,
    descricao: "Tortilhas de milho crocantes cobertas com feijão, carne moída, queijo derretido, pico de gallo, creme azedo e guacamole.",
    imagem: "./img/cardapio/nachos.jpg",
    etiqueta: "Para Compartilhar",
    destaque: true
  },

  // BURRITOS
  {
    id: 4,
    nome: "Burrito de Carne",
    categoria: "burrito",
    preco: 29.90,
    descricao: "Tortilha de trigo recheada com carne bovina, feijão preto, arroz, queijo, guacamole e molho picante.",
    imagem: "./img/cardapio/burrito_carne.jpg",
    etiqueta: null,
    destaque: false
  },
  {
    id: 6,
    nome: "Burrito Vegetariano",
    categoria: "burrito",
    preco: 25.90,
    descricao: "Tortilha de trigo recheada com feijão, arroz, guacamole, pimentões, cebola, milho, queijo e salsa.",
    imagem: "./img/cardapio/burrito_cogumelo.jpg",
    etiqueta: "Vegetariano",
    destaque: false
  },

  // TACOS
  {
    id: 8,
    nome: "Taco de Carnitas",
    categoria: "tacos",
    preco: 18.00,
    descricao: "Carne de porco marinada e cozida lentamente, servida em tortilha de milho com cebola e coentro.",
    imagem: "./img/cardapio/tacos.jpg",
    etiqueta: null,
    destaque: false
  },
  {
    id: 9,
    nome: "Taco de Camarão",
    categoria: "tacos",
    preco: 22.00,
    descricao: "Camarão grelhado com alho, servido em tortilha de milho com repolho roxo, abacaxi grelhado e molho chipotle.",
    imagem: "./img/cardapio/guaca.jpg",
    etiqueta: "Premium",
    destaque: true
  },

  // DORADOS
  {
    id: 10,
    nome: "Taco Dorado de Frango",
    categoria: "dorados",
    preco: 19.50,
    descricao: "Tortilha de milho frita recheada com frango desfiado temperado, servida com alface, queijo e creme azedo.",
    imagem: "./img/cardapio/dorados.jpg",
    etiqueta: null,
    destaque: false
  },
  // QUESADILLAS
  {
    id: 12,
    nome: "Quesadilla de Queijo",
    categoria: "quesadilla",
    preco: 22.00,
    descricao: "Tortilha de trigo recheada com queijo derretido, servida com guacamole e pico de gallo.",
    imagem: "./img/cardapio/quesadilaqjo.jpg",
    etiqueta: "Vegetariano",
    destaque: false
  },
  {
    id: 13,
    nome: "Quesadilla de Frango",
    categoria: "quesadilla",
    preco: 26.00,
    descricao: "Tortilha de trigo recheada com frango desfiado e queijo, servida com guacamole e pico de gallo.",
    imagem: "./img/cardapio/quesadilaqjo.jpg",
    etiqueta: null,
    destaque: false
  },
  {
    id: 14,
    nome: "Quesadilla Vegetariana",
    categoria: "quesadilla",
    preco: 24.00,
    descricao: "Tortilha de trigo recheada com queijo, pimentões, cogumelos, cebola roxa e guacamole.",
    imagem: "./img/cardapio/quesadilahongo.jpg",
    etiqueta: "Vegetariano",
    destaque: false
  },

  // TOSTADAS
  {
    id: 16,
    nome: "Tostada Picadillo",
    categoria: "tostada",
    preco: 20.00,
    descricao: "Tortilha de milho crocante coberta com feijão, carne moída temperada, alface, tomate, queijo e creme azedo.",
    imagem: "./img/cardapio/tostadapica.jpg",
    etiqueta: null,
    destaque: false
  },

  // DRINKS
  {
    id: 17,
    nome: "Margarita Clássica",
    categoria: "drinks",
    preco: 25.00,
    descricao: "Tequila, licor de laranja e suco de limão fresco, servida com borda de sal.",
    imagem: "./img/cardapio/marguerita.jpg",
    etiqueta: "Clássico",
    destaque: true
  },
  {
    id: 18,
    nome: "Margarita de Morango",
    categoria: "drinks",
    preco: 27.00,
    descricao: "Tequila, licor de laranja, suco de limão e morango fresco, servida com borda de açúcar.",
    imagem: "./img/cardapio/margueritamor.jpeg",
    etiqueta: null,
    destaque: false
  },
  {
    id: 19,
    nome: "Mojito Mexicano",
    categoria: "drinks",
    preco: 23.00,
    descricao: "Tequila, hortelã, limão, açúcar e água com gás.",
    imagem: "./img/cardapio/mojito.jpg",
    etiqueta: null,
    destaque: false
  },

  // BEBIDAS
  {
    id: 20,
    nome: "Água",
    categoria: "bebidas",
    preco: 5.00,
    descricao: "Água mineral sem gás (500ml).",
    imagem: "./img/cardapio/agua.jpg",
    etiqueta: null,
    destaque: false
  },
  {
    id: 21,
    nome: "Refrigerante",
    categoria: "bebidas",
    preco: 6.50,
    descricao: "Lata de refrigerante (350ml).",
    imagem: "./img/cardapio/Refrigerante-1.jpg",
    etiqueta: null,
    destaque: false
  },
  {
    id: 22,
    nome: "Limonada Mexicana",
    categoria: "bebidas",
    preco: 12.00,
    descricao: "Suco de limão fresco com água, açúcar e um toque de pimenta (500ml).",
    imagem: "./img/cardapio/limonadamexi.jpg",
    etiqueta: "Feito na hora",
    destaque: false
  }
];


// Exportando os dados
export { categorias, produtos };