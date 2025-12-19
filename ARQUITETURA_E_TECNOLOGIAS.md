# Arquitetura e Tecnologias do Projeto

## 📋 Status Atual do Projeto

### ✅ Tecnologias Implementadas

1. **Backend:**
   - Node.js com Express
   - EJS (Embedded JavaScript) para templates server-side
   - Supabase para banco de dados
   - Express Session para autenticação
   - Bcrypt para hash de senhas

2. **Frontend:**
   - Bootstrap 5.3.3
   - CSS customizado com tema preto e dourado
   - Design responsivo
   - JavaScript vanilla

3. **Integrações:**
   - ✅ Supabase (banco de dados)
   - ✅ Mercado Pago (via link direto)
   - ✅ WhatsApp (botão de contato)

### 🔄 Sobre React.js

**Situação Atual:** O projeto utiliza **EJS (server-side rendering)** ao invés de React.js.

**Por quê?**
- EJS é mais simples para projetos que não precisam de muita interatividade no frontend
- Renderização no servidor é mais rápida para catálogos estáticos
- Menos complexidade de build e deploy

**Se você quiser migrar para React.js:**
1. Seria necessário criar uma API REST separada (backend)
2. Frontend React consumiria essa API
3. Mais complexo para deploy (precisa de build do React)
4. Melhor para aplicações com muita interatividade

**Recomendação:** Para um catálogo simples, EJS é suficiente. Se no futuro precisar de mais interatividade (carrinho, filtros dinâmicos, etc.), a migração para React pode ser considerada.

## 🚀 Hospedagem

### Render (Backend)
- O projeto Node.js pode ser deployado no Render
- Configure as variáveis de ambiente:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `WHATSAPP_NUMBER`
  - `PORT` (gerenciado automaticamente pelo Render)
  - `SESSION_SECRET` (recomendado alterar)

### Supabase (Banco de Dados)
- Dados persistem mesmo quando o Render "dorme"
- Execute o script `migration_supabase.sql` no Supabase SQL Editor
- Se a tabela já existe, execute `update_products_table.sql` para adicionar o campo `mercado_pago_link`

### Netlify (Opcional - Frontend)
- Se migrar para React, o frontend pode ser hospedado no Netlify
- Atualmente não é necessário, pois o projeto usa server-side rendering

## 📝 Próximos Passos

1. **Executar migração SQL no Supabase:**
   - Se a tabela `products` já existe, execute `update_products_table.sql`
   - Se não existe, execute `migration_supabase.sql`

2. **Configurar variáveis de ambiente no Render:**
   - Criar arquivo `.env` ou configurar no painel do Render

3. **Testar integração Mercado Pago:**
   - Criar um produto de teste
   - Adicionar link do Mercado Pago
   - Verificar se o botão "Comprar Agora" aparece e funciona

4. **Personalizar design (opcional):**
   - Ajustar cores no arquivo `public/css/styles.css`
   - Adicionar mais animações ou efeitos visuais

## 🔐 Segurança

- ✅ Senhas hashadas com bcrypt
- ✅ Sessões protegidas
- ⚠️ **IMPORTANTE:** Alterar `SESSION_SECRET` no `app.js` para um valor aleatório seguro
- ⚠️ Configurar RLS (Row Level Security) no Supabase adequadamente

## 📦 Estrutura do Projeto

```
project7$-acaradoluxo/
├── app.js                 # Servidor Express principal
├── supabaseClient.js      # Cliente Supabase
├── package.json           # Dependências
├── migration_supabase.sql # Script inicial do banco
├── update_products_table.sql # Script para atualizar tabela existente
├── public/
│   └── css/
│       └── styles.css     # Estilos customizados
└── views/
    ├── layout.ejs         # Layout principal
    ├── index.ejs          # Página inicial (catálogo)
    ├── category.ejs       # Página de categoria
    └── admin/             # Área administrativa
        ├── login.ejs
        ├── products_list.ejs
        ├── product_form.ejs
        └── categories_list.ejs
```


