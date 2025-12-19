# 📸 Guia Completo: Upload de Imagens para Supabase

## ✅ O que foi implementado

O sistema agora permite **duas formas** de adicionar imagens aos produtos:

1. **📤 Upload direto** (Recomendado) - Imagens armazenadas no Supabase Storage
2. **🔗 URL externa** - Continuar usando links de serviços externos

## 🚀 Configuração Inicial no Supabase

### Passo 1: Criar o Bucket de Storage

1. Acesse seu projeto no **Supabase Dashboard**
2. Vá em **Storage** (menu lateral)
3. Clique em **"New bucket"**
4. Configure:
   - **Name:** `product-images` (exatamente este nome)
   - **Public bucket:** ✅ **MARQUE COMO PÚBLICO** (importante!)
   - **File size limit:** 5 MB (ou o valor que preferir)
   - **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`
5. Clique em **"Create bucket"**

### Passo 2: Configurar Políticas de Acesso (RLS)

1. No bucket `product-images`, vá em **"Policies"**
2. Clique em **"New Policy"**
3. Selecione **"For full customization"**
4. Configure a política:

**Política de Leitura (SELECT):**
```sql
-- Permite leitura pública de todas as imagens
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

**Política de Upload (INSERT):**
```sql
-- Permite upload apenas para usuários autenticados (será controlado pelo backend)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');
```

**Política de Exclusão (DELETE):**
```sql
-- Permite exclusão apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
```

**OU** (mais simples, mas menos seguro):

Se quiser desabilitar RLS temporariamente para testes:
1. Vá em **Settings** → **Storage**
2. Desabilite **"Enable RLS"** (apenas para testes!)

⚠️ **IMPORTANTE:** Para produção, use as políticas acima!

### Passo 3: Verificar Service Role Key (Opcional)

Para uploads mais seguros, você pode usar a Service Role Key:

1. Vá em **Settings** → **API**
2. Copie a **"service_role key"** (mantenha segura!)
3. Adicione ao `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```

**Nota:** O código atual usa a `ANON_KEY`, que funciona se o bucket for público. Se quiser mais segurança, podemos atualizar para usar `SERVICE_ROLE_KEY`.

## 📝 Como Usar o Sistema de Upload

### Método 1: Upload Direto (Recomendado)

1. **Acesse a área administrativa:**
   - Faça login em `/admin/login`
   - Vá em **"Admin"** → **"Produtos"** → **"Novo Produto"**

2. **No formulário:**
   - Na seção **"Imagem do Produto"**
   - Clique em **"📤 Fazer Upload de Imagem"**
   - Selecione uma imagem do seu computador
   - Formatos aceitos: JPEG, JPG, PNG, GIF, WEBP
   - Tamanho máximo: 5MB

3. **Pré-visualização:**
   - A imagem aparecerá automaticamente na pré-visualização
   - Preencha os outros campos e clique em **"Adicionar produto"**

4. **Pronto!**
   - A imagem será enviada para o Supabase Storage
   - A URL será salva automaticamente no banco de dados

### Método 2: URL Externa (Alternativa)

1. **No mesmo formulário:**
   - Na seção **"🔗 Usar URL de Imagem Externa"**
   - Cole a URL da imagem
   - A pré-visualização aparecerá automaticamente

2. **Vantagens:**
   - Não ocupa espaço no Supabase
   - Funciona com Instagram, Google Drive, Imgur, etc.

3. **Desvantagens:**
   - Depende de serviços externos
   - Links podem quebrar

## 🔄 Editar Produto Existente

1. Vá em **"Admin"** → **"Produtos"** → Clique em **"Editar"** no produto desejado
2. **Para substituir a imagem:**
   - Faça upload de uma nova imagem OU
   - Cole uma nova URL
3. A imagem antiga será **automaticamente deletada** do Supabase (se estava lá)
4. Clique em **"Atualizar produto"**

## 🗑️ Excluir Produto

Ao excluir um produto:
- O produto é removido do banco de dados
- A imagem é **automaticamente deletada** do Supabase Storage (se estava lá)

## ⚙️ Configurações Avançadas

### Alterar Tamanho Máximo

Edite `uploadConfig.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // 10MB (altere conforme necessário)
}
```

### Alterar Formatos Aceitos

Edite `uploadConfig.js`:
```javascript
const allowedTypes = /jpeg|jpg|png|gif|webp|svg/; // Adicione SVG, por exemplo
```

E em `views/admin/product_form.ejs`:
```html
accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
```

## 🐛 Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `product-images` foi criado no Supabase
- Confirme que o nome está exatamente como `product-images`

### Erro: "Access denied" ou "Forbidden"
- Verifique se o bucket está marcado como **público**
- Confirme que as políticas RLS estão configuradas corretamente
- Verifique se as variáveis de ambiente estão corretas

### Erro: "File too large"
- Reduza o tamanho da imagem (use um compressor online)
- Ou aumente o limite em `uploadConfig.js`

### Imagem não aparece após upload
- Verifique os logs do servidor para erros
- Confirme que a URL foi salva no banco de dados
- Verifique se o bucket está público

### Pasta uploads/temp não existe
- O sistema cria automaticamente, mas se houver erro:
  ```bash
  mkdir -p uploads/temp
  ```

## 📊 Estrutura de Arquivos

```
project/
├── uploads/
│   └── temp/          # Arquivos temporários (são deletados após upload)
├── uploadConfig.js    # Configuração do Multer
├── imageUploader.js   # Funções de upload/delete no Supabase
└── app.js             # Rotas atualizadas com upload
```

## 🔒 Segurança

- ✅ Validação de tipo de arquivo (apenas imagens)
- ✅ Limite de tamanho (5MB)
- ✅ Nomes únicos para evitar conflitos
- ✅ Limpeza automática de arquivos temporários
- ✅ Exclusão automática de imagens antigas

## 💡 Dicas

1. **Otimize suas imagens antes de fazer upload:**
   - Use ferramentas como TinyPNG ou Squoosh
   - Reduza o tamanho sem perder qualidade
   - Isso economiza espaço e melhora a velocidade

2. **Use upload direto para:**
   - Imagens que você quer ter controle total
   - Produtos que ficarão no catálogo por muito tempo

3. **Use URL externa para:**
   - Imagens temporárias
   - Quando já tem a imagem hospedada em outro lugar
   - Para economizar espaço no Supabase

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do servidor
2. Confirme a configuração do Supabase Storage
3. Teste com uma imagem pequena primeiro
4. Verifique as variáveis de ambiente

