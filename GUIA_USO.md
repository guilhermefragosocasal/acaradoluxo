# 📖 Guia de Uso - Catálogo À Cara do Luxo

## 🚀 Como Começar

### 1. Acessar a Área Administrativa

1. Abra seu navegador e acesse: `http://localhost:3000/admin/login`
2. Faça login com:
   - **Usuário:** `admin`
   - **Senha:** `admin123`

---

## 📦 Como Adicionar Produtos

### Passo 1: Criar Categorias (se necessário)

1. Após fazer login, clique em **"Categorias"** no topo da página
2. Preencha:
   - **Nome:** Ex: "Bijuterias", "Acessórios de Celular", "Acessórios de Moda"
   - **Slug:** Ex: `bijuterias`, `acessorios-celular`, `acessorios-moda`
   - O slug é a URL amigável (use apenas letras minúsculas e hífens)
3. Clique em **"Criar categoria"**

### Passo 2: Adicionar um Produto

1. Clique em **"Novo produto"** (ou vá em **"Produtos"** → **"Novo produto"**)
2. Preencha o formulário:

#### **Nome do produto** (obrigatório)
- Ex: "Pulseira Dourada com Cristais"

#### **Preço (R$)**
- Ex: `89.90`
- Deixe em branco se não quiser exibir preço

#### **Categoria**
- Selecione uma categoria criada anteriormente
- Ou deixe "Sem categoria"

#### **URL da imagem** ⭐ IMPORTANTE

Esta é a parte mais importante! Você precisa de um **link direto** para a imagem.

**Opções para obter a URL da imagem:**

##### Opção 1: Instagram
1. Abra a foto no Instagram (no navegador)
2. Clique com o botão direito na imagem
3. Selecione **"Copiar endereço da imagem"** ou **"Copy image address"**
4. Cole no campo "URL da imagem"

##### Opção 2: Google Drive
1. Faça upload da imagem no Google Drive
2. Clique com botão direito na imagem → **"Compartilhar"**
3. Configure como **"Qualquer pessoa com o link"**
4. Copie o link compartilhado
5. **IMPORTANTE:** Substitua `/view` por `/uc?export=view&id=`
   - Exemplo: Se o link é `https://drive.google.com/file/d/ABC123/view`
   - Use: `https://drive.google.com/uc?export=view&id=ABC123`

##### Opção 3: Imgur (Recomendado - Mais fácil)
1. Acesse [imgur.com](https://imgur.com)
2. Faça upload da imagem (arraste e solte)
3. Clique com botão direito na imagem → **"Copiar endereço da imagem"**
4. Cole no campo

##### Opção 4: Outros serviços
- Qualquer serviço que forneça um link direto para a imagem (que termine em `.jpg`, `.png`, `.webp`, etc.)
- **NÃO use** links de páginas, apenas links diretos da imagem

**💡 Dica:** O formulário mostra uma pré-visualização da imagem quando você cola a URL!

#### **Descrição do produto**
- Descreva o produto de forma atrativa
- Ex: "Pulseira elegante em dourado com cristais Swarovski. Ajustável, tamanho único. Perfeita para ocasiões especiais."
- Inclua informações como: materiais, cores disponíveis, tamanhos, etc.

3. Clique em **"Adicionar produto"**

---

## ✏️ Como Editar um Produto

1. Vá em **"Produtos"** na área administrativa
2. Clique em **"Editar"** no produto desejado
3. Modifique os campos necessários
4. Clique em **"Atualizar produto"**

---

## 🗑️ Como Excluir um Produto

1. Vá em **"Produtos"**
2. Clique em **"Excluir"** no produto desejado
3. Confirme a exclusão

---

## 👀 Visualizar o Catálogo Público

1. Acesse: `http://localhost:3000`
2. Você verá todos os produtos organizados por categoria
3. Clique nas abas de categoria para filtrar
4. Cada produto tem um botão **"Falar no WhatsApp"** que abre uma conversa pré-preenchida

---

## 📱 Configurar o Número do WhatsApp

O número do WhatsApp já está configurado no código (`5511996955347`).

Para alterar:
1. Abra o arquivo `app.js`
2. Procure a linha: `res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '5511996955347';`
3. Altere o número (formato: DDI + DDD + número, sem espaços ou caracteres especiais)
4. Reinicie o servidor

---

## 🎨 Dicas de Boas Práticas

### Para Imagens:
- Use imagens de boa qualidade (recomendado: 800x800px ou maior)
- Formato JPG ou PNG
- Certifique-se de que a URL da imagem está acessível publicamente

### Para Descrições:
- Seja claro e objetivo
- Destaque características importantes
- Mencione materiais, cores e tamanhos disponíveis
- Use palavras-chave que seus clientes procurariam

### Para Categorias:
- Crie categorias claras e específicas
- Use nomes que seus clientes reconheceriam facilmente
- Exemplos: "Anéis", "Brincos", "Colares", "Pulseiras", "Acessórios de Celular", etc.

---

## ❓ Problemas Comuns

### A imagem não aparece no catálogo
- Verifique se a URL está correta e acessível
- Teste abrindo a URL diretamente no navegador
- Certifique-se de que é um link direto da imagem, não de uma página

### Não consigo fazer login
- Verifique se está usando: usuário `admin` e senha `admin123`
- Certifique-se de que o servidor está rodando

### O produto não aparece no catálogo
- Verifique se você salvou o produto corretamente
- Certifique-se de que não há erros no terminal do servidor
- Recarregue a página do catálogo (Ctrl+F5)

---

## 🔒 Segurança

⚠️ **IMPORTANTE:** Altere a senha padrão do administrador antes de colocar o site em produção!

Para alterar a senha, você precisará modificar o banco de dados ou criar um novo usuário admin através do código.

---

## 📞 Suporte

Se tiver dúvidas ou problemas, verifique:
1. Se o servidor está rodando (`npm run dev` ou `npm start`)
2. Se todas as dependências foram instaladas (`npm install`)
3. Se não há erros no terminal

Boa sorte com seu catálogo! 🎉




