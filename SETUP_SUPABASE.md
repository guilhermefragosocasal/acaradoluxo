# 🚀 Guia de Integração Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: Escolha um nome (ex: "acaradoluxo")
   - **Database Password**: Crie uma senha segura
   - **Region**: Selecione a região mais próxima (ex: South America - São Paulo)
4. Clique em "Create new project"
5. Aguarde a criação (pode levar alguns minutos)

## Passo 2: Obter Credenciais

1. No dashboard do Supabase, clique em "Settings" (engrenagem)
2. Vá para "API"
3. Copie:
   - **Project URL** → use como `SUPABASE_URL`
   - **anon public** key → use como `SUPABASE_ANON_KEY`

## Passo 3: Configurar Variáveis de Ambiente

1. Edite o arquivo `.env` na raiz do projeto
2. Cole suas credenciais:
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## Passo 4: Criar Tabelas no Supabase

1. No dashboard do Supabase, clique em "SQL Editor"
2. Clique em "New Query"
3. Copie TODO o conteúdo do arquivo `migration_supabase.sql`
4. Cole no editor
5. Clique em "Run" (ou Ctrl+Enter)

## Passo 5: Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso vai instalar `@supabase/supabase-js` e `dotenv`.

## Passo 6: Rodar o Projeto

```bash
npm start
```

ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

O projeto estará em: http://localhost:3000

## ✅ Dados Padrão

- **Usuário Admin**: `admin`
- **Senha Admin**: `admin123`

⚠️ **Importante**: Mude essa senha após o primeiro login!

## 🔒 Segurança - Remover RLS (Row Level Security)

Por padrão, as políticas de segurança estão comentadas. Se você quiser permitir acesso anônimo total (recomendado para um catálogo público), descomente as linhas no final do arquivo `migration_supabase.sql`:

```sql
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
```

Depois execute a query novamente.

## 📝 Mudanças Feitas

- ✅ Removido SQLite (database.sqlite)
- ✅ Adicionar Supabase como banco de dados principal
- ✅ Todos os CRUD de produtos, categorias e autenticação funcionam com Supabase
- ✅ Dados persistem mesmo que o Render entre em modo "sleep"
- ✅ Acesso à API REST do Supabase via `@supabase/supabase-js`

## 🆘 Troubleshooting

### Erro "SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidas"
- Verifique se o arquivo `.env` está na raiz do projeto
- Verifique se as variáveis estão corretas no `.env`
- Reinicie o servidor

### Erro "Sem permissão para inserir/atualizar dados"
- Acesse o SQL Editor no Supabase
- Execute as linhas de `DISABLE ROW LEVEL SECURITY` no final do arquivo
- Tente novamente

### Dados não aparecem
- Verifique se as tabelas foram criadas (SQL Editor → Tables)
- Verifique se há dados inseridos (SQL Editor → Query → SELECT * FROM products)
- Verifique os logs do servidor (`npm start`)
