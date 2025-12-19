# 🔐 Como Gerar SESSION_SECRET

## Método 1: Usando o Script (Recomendado)

Execute o comando:

```bash
node generate-secret.js
```

Ou usando npm:

```bash
npm run generate-secret
```

O script irá gerar um secret seguro e mostrar na tela. **Copie o valor completo** e adicione ao seu arquivo `.env`.

## Método 2: Usando Node.js Diretamente

No terminal, execute:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Método 3: Usando OpenSSL (Linux/Mac)

```bash
openssl rand -base64 64
```

## Método 4: Gerador Online

Você também pode usar geradores online como:
- https://randomkeygen.com/
- https://www.lastpass.com/features/password-generator

**⚠️ IMPORTANTE:** Use pelo menos 32 caracteres aleatórios.

## Como Usar o Secret Gerado

1. **Copie o secret gerado** (exemplo: `ghXAerxVm2JGyVKamtX1slW9f5VViYOIFME1D2jE7XMjdm/Hex2/WzoPt0NeZRWnBTh9UATl1ddGXpeEWorXBA==`)

2. **Adicione ao arquivo `.env`:**
   ```env
   SESSION_SECRET=ghXAerxVm2JGyVKamtX1slW9f5VViYOIFME1D2jE7XMjdm/Hex2/WzoPt0NeZRWnBTh9UATl1ddGXpeEWorXBA==
   ```

3. **No Render (produção):**
   - Vá em Settings → Environment
   - Adicione a variável `SESSION_SECRET` com o valor gerado
   - Salve e faça redeploy

## ⚠️ Segurança

- **NUNCA** compartilhe o SESSION_SECRET publicamente
- **NUNCA** commite o arquivo `.env` no Git
- Use um secret **diferente** para desenvolvimento e produção
- Gere um novo secret se suspeitar que foi comprometido

## Por que é Importante?

O SESSION_SECRET é usado para:
- Assinar e criptografar cookies de sessão
- Proteger contra falsificação de sessão
- Garantir que apenas seu servidor pode criar sessões válidas

Um secret fraco ou exposto pode permitir que atacantes:
- Se passem por usuários autenticados
- Acessem a área administrativa
- Modifiquem dados do sistema

