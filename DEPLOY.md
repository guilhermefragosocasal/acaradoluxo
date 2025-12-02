# 🚀 Guia de Deploy - Catálogo Lux

Este guia vai te ajudar a colocar o site no ar usando hospedagem gratuita.

## 📋 Pré-requisitos

1. Conta no GitHub (gratuita)
2. Conta em uma das plataformas de hospedagem abaixo

## 🌐 Opções de Hospedagem Gratuita

### 1. Render.com (Recomendado - Mais Fácil)

**Vantagens:**
- ✅ Plano gratuito disponível
- ✅ Deploy automático via GitHub
- ✅ SSL/HTTPS gratuito
- ✅ Fácil configuração

**Passos:**

1. **Criar repositório no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/catalogo-lux.git
   git push -u origin main
   ```

2. **Criar conta no Render:**
   - Acesse: https://render.com
   - Faça login com GitHub

3. **Criar novo Web Service:**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - **Name:** catalogo-lux
     - **Environment:** Node
     - **Build Command:** `npm install && npm run init-db`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Configurar Variáveis de Ambiente:**
   - Vá em "Environment" e adicione:
     ```
     NODE_ENV=production
     PORT=10000
     JWT_SECRET=sua_chave_secreta_muito_forte_aqui_aleatoria
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=adminsharon@08
     ALLOWED_ORIGINS=https://catalogo-lux.onrender.com
     ```
   - ⚠️ **IMPORTANTE:** Gere uma chave JWT_SECRET forte! Use: https://randomkeygen.com/

5. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o build (pode levar 5-10 minutos na primeira vez)
   - Seu site estará em: `https://catalogo-lux.onrender.com`

---

### 2. Railway.app

**Vantagens:**
- ✅ $5 de crédito grátis por mês
- ✅ Deploy muito rápido
- ✅ Interface moderna

**Passos:**

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione seu repositório
5. Railway detecta automaticamente Node.js
6. Adicione variáveis de ambiente (mesmas do Render)
7. Deploy automático!

---

### 3. Fly.io

**Vantagens:**
- ✅ Plano gratuito generoso
- ✅ Múltiplas regiões

**Passos:**

1. Instale o CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Execute:
   ```bash
   fly auth login
   fly launch
   ```
3. Siga as instruções do CLI

---

## ⚙️ Configurações Importantes

### Variáveis de Ambiente Obrigatórias:

```env
NODE_ENV=production
PORT=10000  # ou a porta que a plataforma fornecer
JWT_SECRET=chave_secreta_muito_forte_e_aleatoria
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
ALLOWED_ORIGINS=https://seu-dominio.com
```

### Gerar JWT_SECRET Seguro:

Use um gerador online ou no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 Após o Deploy

1. **Acesse o painel admin:**
   - `https://seu-dominio.com/admin.html`
   - Login: admin / sua_senha

2. **Teste o catálogo:**
   - `https://seu-dominio.com`

3. **Atualizar senha (se necessário):**
   - A plataforma pode não executar `reset_admin.js` automaticamente
   - Você pode precisar executar manualmente ou usar a senha do .env

---

## 🐛 Troubleshooting

**Erro: "JWT_SECRET deve ser definido"**
- Certifique-se de adicionar JWT_SECRET nas variáveis de ambiente

**Banco de dados não inicializa:**
- Verifique se o build command inclui `npm run init-db`
- Ou execute manualmente após o primeiro deploy

**CORS errors:**
- Atualize ALLOWED_ORIGINS com a URL correta do seu site

**Site não carrega:**
- Verifique os logs na plataforma
- Certifique-se que a porta está correta (geralmente 10000 no Render)

---

## 📝 Notas

- O plano gratuito pode ter limitações (ex: site "dorme" após inatividade)
- Para produção real, considere um plano pago
- Sempre use senhas fortes em produção!
- Mantenha o .env fora do Git (já está no .gitignore)

---

Boa sorte com o deploy! 🎉

