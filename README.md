# Catálogo Online - Lux

Sistema de catálogo de produtos para loja, desenvolvido com Node.js, Express e SQLite.

## 📋 Funcionalidades

- **Catálogo público**: Visualização de produtos organizados por categorias
- **Área administrativa**: Login seguro para gerenciar produtos
- **CRUD completo**: Criar, editar e deletar produtos
- **Categorias**: Brinco, Pulseira, Tornozeleira, Colar, Kit, Diversos
- **Responsivo**: Interface adaptada para mobile, tablet e desktop
- **Seguro**: Autenticação JWT, validação de dados, proteção contra SQL injection

## 🚀 Como usar

### Instalação

```bash
# Instalar dependências
npm install

# Inicializar banco de dados
npm run init-db

# Iniciar servidor
npm start

# Ou em modo desenvolvimento (com nodemon)
npm run dev
```

### Configuração

Crie um arquivo `.env` na raiz do projeto (veja `.env.example`):

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXP=2h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
ALLOWED_ORIGINS=http://localhost:3000
```

**⚠️ IMPORTANTE**: Em produção, defina uma `JWT_SECRET` forte e única!

### Acessos

- **Catálogo público**: `http://localhost:3000`
- **Área administrativa**: `http://localhost:3000/admin.html`

## 🔒 Segurança

O projeto implementa várias medidas de segurança:

- ✅ Autenticação JWT com expiração
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de dados de entrada
- ✅ Sanitização de HTML (XSS protection)
- ✅ Proteção contra SQL Injection (prepared statements)
- ✅ CORS configurável
- ✅ Rate limiting
- ✅ Helmet.js para headers de segurança
- ✅ Validação de categorias e URLs

## 📱 Responsividade

O site é totalmente responsivo com breakpoints para:
- Desktop (> 768px)
- Tablet (≤ 768px)
- Mobile (≤ 480px)

## 🛠️ Tecnologias

- **Backend**: Node.js, Express
- **Banco de dados**: SQLite3
- **Autenticação**: JWT (jsonwebtoken)
- **Segurança**: bcrypt, helmet, express-rate-limit
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)

## 📁 Estrutura do Projeto

```
.
├── db/
│   ├── database.sqlite      # Banco de dados SQLite
│   └── init_db.js           # Script de inicialização
├── public/
│   ├── css/
│   │   └── styles.css       # Estilos principais
│   ├── js/
│   │   ├── app.js           # Frontend do catálogo
│   │   └── admin.js         # Frontend administrativo
│   ├── index.html           # Página do catálogo
│   └── admin.html           # Página administrativa
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   └── products.js          # Rotas de produtos
├── config.js                # Configurações
├── server.js                # Servidor Express
└── package.json             # Dependências
```

## 🔧 API Endpoints

### Públicos

- `GET /api/products` - Listar todos os produtos
- `GET /api/products?category=brinco` - Filtrar por categoria

### Administrativos (requer autenticação)

- `POST /api/auth/login` - Login
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Editar produto
- `DELETE /api/products/:id` - Deletar produto

## 📝 Notas

- O banco de dados é criado automaticamente na primeira execução
- As credenciais padrão são: `admin` / `admin123` (altere em produção!)
- Imagens devem ser URLs válidas ou caminhos relativos começando com `/images/`

## 🐛 Troubleshooting

**Erro ao iniciar o banco**: Execute `npm run init-db` manualmente

**Token inválido**: Faça logout e login novamente

**CORS errors**: Configure `ALLOWED_ORIGINS` no `.env`

---

Desenvolvido para estudo e aprendizado.


