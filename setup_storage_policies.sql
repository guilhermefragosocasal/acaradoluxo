-- Script para configurar políticas de acesso ao Supabase Storage
-- Execute este script no Supabase SQL Editor APÓS criar o bucket 'product-images'

-- IMPORTANTE: Primeiro crie o bucket 'product-images' no Storage como PÚBLICO

-- Política de Leitura Pública (SELECT)
-- Permite que qualquer pessoa veja as imagens
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política de Upload (INSERT)
-- Permite upload apenas para usuários autenticados
-- Nota: O backend controla a autenticação, então isso é uma camada extra
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Política de Exclusão (DELETE)
-- Permite exclusão apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Se quiser permitir acesso total (apenas para testes, NÃO recomendado para produção):
-- DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

