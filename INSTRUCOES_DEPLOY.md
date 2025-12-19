# 📦 Instruções de Deploy

## ✅ O que foi implementado

1. **Integração com Mercado Pago:**
   - Campo `mercado_pago_link` adicionado ao formulário de produtos
   - Botão "🛒 Comprar Agora" aparece quando o link está configurado
   - Redirecionamento direto para o link do Mercado Pago

2. **Design melhorado:**
   - Visual premium de loja de grife
   - Cores preto e dourado refinadas
   - Animações suaves e efeitos hover
   - Totalmente responsivo

3. **Banco de dados:**
   - Script SQL atualizado com campo `mercado_pago_link`
   - Script adicional para atualizar tabelas existentes

## 🚀 Passo a Passo para Deploy

### 1. Preparar o Supabase

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Execute o script `migration_supabase.sql` (se for primeira vez)
   - OU execute `update_products_table.sql` (se a tabela já existe)
4. Verifique se a coluna `mercado_pago_link` foi criada

### 2. Configurar Variáveis de Ambiente

#### 2.1. Gerar SESSION_SECRET

Execute o script fornecido para gerar um secret seguro:

```bash
node generate-secret.js
```

O script irá gerar um secret aleatório. **Copie o valor gerado** (será algo como `SESSION_SECRET=ghXAerxVm2JGyVK...`)

#### 2.2. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
WHATSAPP_NUMBER=5511999999999
PORT=3000
SESSION_SECRET=cole_aqui_o_secret_gerado_pelo_script
NODE_ENV=development
```

**⚠️ IMPORTANTE:** 
- Não commite o arquivo `.env` no Git (já está no .gitignore)
- Use o script `generate-secret.js` para gerar um SESSION_SECRET único
- No Render, configure essas variáveis no painel de configurações
- Gere um novo SESSION_SECRET para produção (não use o mesmo do desenvolvimento)

### 3. Deploy no Render

1. **Criar conta no Render:**
   - Acesse https://render.com
   - Faça login com GitHub/GitLab

2. **Criar novo Web Service:**
   - Clique em "New" → "Web Service"
   - Conecte seu repositório Git
   - Configure:
     - **Name:** acaradoluxo (ou o nome que preferir)
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free (ou pago, se preferir)

3. **Configurar Variáveis de Ambiente no Render:**
   - Vá em "Environment"
   - Adicione todas as variáveis do `.env`
   - Salve

4. **Deploy:**
   - Render fará o deploy automaticamente
   - Aguarde o build completar
   - Seu site estará disponível em `https://seu-app.onrender.com`

### 4. Configurar Domínio Personalizado (Opcional)

1. No Render, vá em "Settings" → "Custom Domains"
2. Adicione seu domínio
3. Configure os DNS conforme instruções do Render

### 5. Testar o Site

1. Acesse a URL do Render
2. Faça login como admin (usuário: `admin`, senha: `admin123`)
3. **⚠️ IMPORTANTE:** Altere a senha do admin após o primeiro login!
4. Crie uma categoria
5. Crie um produto e adicione:
   - Nome, descrição, preço
   - URL da imagem
   - **Link do Mercado Pago** (obtenha no painel do Mercado Pago)
6. Verifique se o botão "Comprar Agora" aparece no catálogo

## 🔗 Como Obter Link do Mercado Pago

1. Acesse https://www.mercadopago.com.br
2. Faça login na sua conta
3. Vá em "Criar link de pagamento" ou "Checkout Pro"
4. Configure o produto:
   - Título, descrição, preço
   - Métodos de pagamento aceitos
5. Copie o link gerado
6. Cole no campo "Link do Mercado Pago" ao cadastrar o produto

## 🎨 Personalização

### Alterar Cores
Edite `public/css/styles.css`:
- `#d4af37` = Dourado principal
- `#f0c674` = Dourado claro
- `#050505` = Preto principal

### Alterar Logo/Nome
Edite `views/layout.ejs`:
- Linha 16: Altere "À Cara do Luxo"

## 🔒 Segurança

1. **Alterar senha do admin:**
   - Faça login
   - (Recomendado criar funcionalidade de alteração de senha)

2. **Alterar SESSION_SECRET:**
   - Gere um secret aleatório
   - Use: `openssl rand -base64 32` ou um gerador online

3. **Configurar RLS no Supabase:**
   - Revise as políticas de segurança
   - Garanta que apenas admins possam modificar dados

## 📱 Teste em Dispositivos Móveis

O site é totalmente responsivo. Teste em:
- Smartphones
- Tablets
- Desktops

## 🐛 Troubleshooting

### Render não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Veja os logs no Render para identificar erros

### Produtos não aparecem
- Verifique se o Supabase está configurado corretamente
- Confirme que as políticas RLS permitem leitura pública

### Botão Mercado Pago não aparece
- Verifique se o campo `mercado_pago_link` foi preenchido
- Confirme que o link está correto e começa com `https://`

## 📞 Suporte

Em caso de dúvidas:
1. Verifique os logs no Render
2. Verifique o console do navegador (F12)
3. Verifique o SQL Editor no Supabase


