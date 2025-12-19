-- Script de Criação de Tabelas para Supabase
-- Execute este script no Supabase SQL Editor

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS public.admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS admins_username_idx ON public.admins(username);

-- Habilitar Row Level Security (opcional, mas recomendado para segurança)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança básicas
-- Todos podem ler categorias e produtos
CREATE POLICY "Enable read for everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Enable read for everyone" ON public.products
  FOR SELECT USING (true);

-- Apenas admins podem modificar (será controlado pelo backend)
-- CREATE POLICY "Enable all for authenticated admin" ON public.products
--   FOR ALL USING (auth.role() = 'authenticated');

-- Se quiser permitir acesso anônimo sem RLS, descomente as próximas linhas:
-- ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
