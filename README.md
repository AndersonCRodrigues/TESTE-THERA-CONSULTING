# TESTE-THERA-CONSULTING

**Status:** Concluído
**Backend:** NestJS
**Linguagem:** TypeScript
**Banco de Dados:** MySQL (via Sequelize)
**Container:** Docker + Docker Compose
**Autenticação:** JWT
**Testes:** Jest
**Documentação:** Swagger
**Licença:** MIT

API RESTful robusta e segura para gerenciamento de produtos, pedidos e usuários, com autenticação JWT e arquitetura modular em NestJS.

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#️-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rotas da API](#-rotas-da-api)
- [Testes](#-testes)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Contato](#-contato)

## 🧠 Visão Geral

Este projeto consiste em uma API RESTful desenvolvida como parte de um desafio técnico com foco em:

- Organização de código em camadas (Controller, Service, Repository)
- Princípios SOLID e Clean Code
- Autenticação e autorização com JWT
- Integração com banco de dados relacional (MySQL)
- Boas práticas com Docker, testes unitários e documentação

## ⚙️ Funcionalidades

### Produtos

- CRUD completo (create, findAll, findOne, update, delete)
- Validação de dados
- Controle de estoque

### Pedidos

- Criação com verificação de estoque
- Listagem de pedidos
- Status de pedido: Pendente, Concluído, Cancelado
- Atualização de estoque automática

### Usuários

- Cadastro de novo usuário
- Atribuição de perfil administrador via variáveis de ambiente

### Autenticação

- Login com email e senha
- Emissão de JWT
- Middleware de autenticação em rotas protegidas

## 🧱 Arquitetura

```
NestJS (Modular)
├── Módulo de Autenticação (auth)
├── Módulo de Usuários (users)
├── Módulo de Produtos (products)
└── Módulo de Pedidos (orders)
```

Separação clara por responsabilidades:

- **Controller** → Define os endpoints
- **Service** → Contém a lógica de negócio
- **Repository** → Responsável pela persistência no banco de dados

## 🚀 Tecnologias

| Categoria       | Ferramentas                          |
|-----------------|--------------------------------------|
| Framework       | NestJS, TypeScript                   |
| Banco de Dados  | MySQL, Sequelize ORM                 |
| Segurança       | JWT, Passport                        |
| Validação       | class-validator, class-transformer   |
| Containerização | Docker, Docker Compose               |
| Testes          | Jest                                 |
| Documentação    | Swagger                              |

## 📦 Instalação e Execução

### Pré-requisitos

- Docker
- Docker Compose
- Git

### Etapas

1. Clone o repositório:

```bash
git clone https://github.com/AndersonCRodrigues/TESTE-THERA-CONSULTING.git
cd TESTE-THERA-CONSULTING
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```
NODE_ENV=production
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_USER=nestjs_user
DATABASE_PASSWORD=nestjs_password
DATABASE_NAME=nestjs_app
JWT_SECRET=sua_chave_secreta
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=Admin@123
```

3. Inicie a aplicação com Docker Compose:

```bash
docker-compose up --build
```

A API estará disponível em: `http://localhost:5000`
Documentação Swagger: `http://localhost:5000/api`

## 🔐 Variáveis de Ambiente

| Variável           | Descrição                               |
|--------------------|----------------------------------------|
| NODE_ENV           | Ambiente de execução (production)       |
| DATABASE_HOST      | Host do banco de dados                  |
| DATABASE_PORT      | Porta do banco (3306 padrão MySQL)      |
| DATABASE_USER      | Usuário do banco                        |
| DATABASE_PASSWORD  | Senha do banco                          |
| DATABASE_NAME      | Nome do banco de dados                  |
| JWT_SECRET         | Chave secreta para geração de tokens JWT|
| ADMIN_EMAIL        | Email do usuário administrador inicial  |
| ADMIN_PASSWORD     | Senha do administrador                  |

## 📚 Rotas da API

### 🔑 Auth (`/auth`)

| Método | Rota    | Ação             |
|--------|---------|------------------|
| POST   | /login  | Login do usuário |

### 👤 Users (`/usuarios`)

| Método | Rota  | Ação                      |
|--------|-------|---------------------------|
| POST   | /     | Criação de usuário        |
| GET    | /     | Listagem de usuários      |
| GET    | /:id  | Obter detalhes de usuário |
| PUT    | /:id  | Atualizar dados do usuário|
| DELETE | /:id  | Remover usuário           |

### 📦 Products (`/produtos`)

| Método | Rota  | Ação                    |
|--------|-------|-------------------------|
| POST   | /     | Criar novo produto      |
| GET    | /     | Listar todos os produtos|
| GET    | /:id  | Obter um produto específico |
| PUT    | /:id  | Atualizar produto       |
| DELETE | /:id  | Deletar produto         |

### 🧾 Orders (`/pedidos`)

| Método | Rota  | Ação                    |
|--------|-------|-------------------------|
| POST   | /     | Criar novo pedido       |
| GET    | /     | Listar todos os pedidos |
| GET    | /:id  | Obter um pedido específico |

## 🧪 Testes

Execute os testes localmente:

```bash
npm install
npm run test
```

Ou via Docker:

```bash
docker-compose exec app npm run test
```

## 🗂 Estrutura de Pastas

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
├── products/
│   ├── products.controller.ts
│   ├── products.service.ts
├── orders/
│   ├── orders.controller.ts
│   ├── orders.service.ts
├── database/
│   ├── models/
│   └── providers/
└── main.ts
```

## 🤝 Contribuição

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

MIT License — veja o arquivo LICENSE para mais informações.

## 📬 Contato

Anderson Rodrigues
📧 andersonrodc@gmail.com
🔗 https://github.com/AndersonCRodrigues/TESTE-THERA-CONSULTING