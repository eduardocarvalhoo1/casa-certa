# CasaCerta

### Simulador Inteligente de Financiamento e Consórcio Imobiliário

O **CasaCerta** é uma plataforma web desenvolvida para auxiliar pessoas na tomada de decisão na compra de um imóvel, permitindo comparar cenários de **financiamento imobiliário** e **consórcio** de forma simples, visual e organizada.

---

## Sobre o projeto

A compra de um imóvel envolve uma decisão financeira importante. Porém, muitas pessoas têm dificuldade para entender as diferenças entre financiamento e consórcio, calcular os custos envolvidos e identificar qual alternativa é mais adequada para sua situação.

O CasaCerta foi criado para solucionar esse problema, reunindo simulações, cálculos, comparação de resultados e recomendações em uma única plataforma.

---

## Problema

Muitas pessoas que desejam comprar um imóvel encontram dificuldades para:

- Entender a diferença entre financiamento e consórcio;
- Calcular o valor das parcelas;
- Identificar o impacto dos juros e das taxas;
- Comparar o custo total de cada alternativa;
- Avaliar diferentes prazos e valores de entrada;
- Escolher a opção mais adequada ao seu objetivo.

A falta de informações claras pode levar a decisões financeiras pouco vantajosas.

---

## Solução proposta

O CasaCerta permite que o usuário informe seus dados e simule diferentes cenários de financiamento e consórcio.

A plataforma apresenta os resultados de forma organizada, permitindo uma comparação direta entre as opções e oferecendo uma recomendação com base nos cenários simulados.

### Fluxo principal

1. Acessar o Dashboard;
2. Criar uma nova simulação;
3. Informar o objetivo da simulação;
4. Inserir os dados do imóvel;
5. Configurar os parâmetros do financiamento;
6. Configurar os parâmetros do consórcio;
7. Comparar os resultados;
8. Visualizar a recomendação;
9. Consultar o histórico de simulações.

---

## Funcionalidades

### Simulações

Permite realizar simulações de:

- Financiamento imobiliário;
- Consórcio imobiliário;
- Diferentes valores de imóvel;
- Diferentes valores de entrada;
- Diferentes prazos;
- Diferentes taxas.

### Financiamento

A simulação de financiamento permite trabalhar com:

- Sistema SAC;
- Sistema PRICE;
- Valor do imóvel;
- Valor da entrada;
- Prazo;
- Taxa de juros;
- Valor financiado;
- Parcela inicial;
- Parcela final;
- Total pago;
- Total de juros;
- Evolução das parcelas.

### Consórcio

A simulação de consórcio permite informar:

- Valor do crédito;
- Prazo;
- Taxa de administração;
- Fundo de reserva;
- Lance inicial;
- Parcela mensal;
- Total pago;
- Total de taxas;
- Estimativa de prazo com lance;
- Evolução do saldo devedor.

### Comparação

A plataforma apresenta os resultados de financiamento e consórcio lado a lado, permitindo comparar:

- Parcela inicial;
- Custo total;
- Juros ou taxas;
- Prazo;
- Entrada ou lance.

### Recomendação

Após a comparação, o sistema apresenta uma recomendação indicando a alternativa que apresenta o melhor resultado dentro dos cenários simulados.

### Histórico

O usuário pode consultar suas simulações anteriores, visualizando:

- Nome da simulação;
- Data;
- Tipo de simulação;
- Valor do imóvel;
- Melhor opção identificada.

### Conta do usuário

Permite manter os dados e preferências do usuário associados à sua conta.

---

## Protótipo

O projeto possui protótipos das principais telas da aplicação:

| Tela | Descrição |
|------|-----------|
| Dashboard | Visão geral das simulações e informações do usuário |
| Nova Simulação | Início do processo de simulação |
| Financiamento | Cálculo do financiamento imobiliário |
| Consórcio | Cálculo do consórcio imobiliário |
| Comparação | Comparação entre financiamento e consórcio |
| Histórico | Consulta das simulações realizadas |

---

## Backend

O backend fica em `backend/` e é construído com **Node.js + Express**, **Sequelize 6 + MySQL 8.4** (via Docker) e documentação **Swagger**.

### Tecnologias

- Node.js + Express
- Sequelize 6 + mysql2 (MySQL 8.4 em container Docker)
- Autenticação com JWT (`jsonwebtoken`)
- Documentação com Swagger (`swagger-ui-express` + `swagger-jsdoc`)
- Testes com Jest

### Pré-requisitos

- Node.js 18+
- Docker + Docker Compose

### Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example backend/.env
```

| Variável | Descrição |
|----------|-----------|
| `MYSQL_ROOT_PASSWORD` | Senha do root do MySQL (usada pelo Docker) |
| `MYSQL_PASSWORD` | Senha do usuário da aplicação no MySQL |
| `NODE_ENV` | Ambiente (`development`) |
| `PORT` | Porta do servidor (padrão `3000`) |
| `DB_HOST` | Host do banco (`localhost`) |
| `DB_PORT` | Porta do banco (padrão `3306`) |
| `DB_NAME` | Nome do banco (`casacerta`) |
| `DB_USER` | Usuário da aplicação (`casacerta_user`) |
| `DB_PASSWORD` | Senha da aplicação (deve bater com `MYSQL_PASSWORD`) |
| `JWT_SECRET` | Segredo para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `1h`) |

> Observação: o `docker-compose.yaml` fica em `backend/`, então o `.env` deve estar nessa mesma pasta.

### Como rodar

Todos os comandos a partir de `backend/`:

```bash
# 1. Subir o MySQL via Docker
docker compose up -d

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor (cria as tabelas via sequelize.sync no boot)
npm run dev      # desenvolvimento (nodemon)
# ou
npm start        # execução simples
```

O servidor sobe em `http://localhost:3000`. Health check em `http://localhost:3000/health`.

> Se a porta 3306 já estiver em uso por um MySQL local, ajuste `DB_PORT` no `.env` (ex.: `3307`) — o container mapeia `${DB_PORT}:3306`.

### Documentação da API (Swagger)

Com o servidor rodando, acesse:

```
http://localhost:3000/api-docs
```

Fluxo para testar rotas protegidas:

1. Crie um usuário em **POST /users**.
2. Autentique em **POST /auth/login** e copie o `token` da resposta.
3. Clique em **Authorize** (cadeado), cole o token e confirme.
4. As rotas de **Simulations** passam a enviar o token automaticamente.

### Rotas do núcleo

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/users` | Cadastra um usuário | — |
| `POST` | `/auth/login` | Autentica e retorna um token JWT | — |
| `POST` | `/api/simulations` | Cria uma simulação (financiamento + consórcio + recomendação) | Bearer |
| `GET` | `/api/simulations` | Lista o histórico do usuário autenticado | Bearer |
| `GET` | `/api/simulations/:id` | Detalha uma simulação | Bearer |

### Testes

```bash
npm test
```

Cobre os serviços de cálculo (financiamento SAC/PRICE, consórcio, recomendação) e a validação de entrada.
