-- Script para atualizar tabela products existente
-- Execute este script no Supabase SQL Editor se a tabela já foi criada

-- Adicionar coluna mercado_pago_link se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'mercado_pago_link'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN mercado_pago_link TEXT;
    
    RAISE NOTICE 'Coluna mercado_pago_link adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna mercado_pago_link já existe.';
  END IF;
END $$;


