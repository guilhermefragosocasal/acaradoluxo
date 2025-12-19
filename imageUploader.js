const fs = require('fs').promises;
const path = require('path');
const supabase = require('./supabaseClient');

/**
 * Detecta o tipo MIME baseado na extensão do arquivo
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param {string} filePath - Caminho do arquivo temporário
 * @param {string} fileName - Nome do arquivo
 * @returns {Promise<string>} URL pública da imagem
 */
async function uploadImageToSupabase(filePath, fileName) {
  try {
    // Lê o arquivo
    const fileBuffer = await fs.readFile(filePath);

    // Nome do arquivo no storage (com timestamp para evitar conflitos)
    const storageFileName = `products/${Date.now()}-${fileName}`;

    // Detecta o tipo MIME
    const contentType = getContentType(fileName);

    // Faz upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(storageFileName, fileBuffer, {
        contentType: contentType,
        upsert: false // Não sobrescrever se existir
      });

    if (error) {
      throw error;
    }

    // Obtém a URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storageFileName);

    // Remove o arquivo temporário
    await fs.unlink(filePath).catch(() => {}); // Ignora erro se não existir

    return urlData.publicUrl;
  } catch (error) {
    // Remove o arquivo temporário em caso de erro
    await fs.unlink(filePath).catch(() => {});
    throw error;
  }
}

/**
 * Remove uma imagem do Supabase Storage
 * @param {string} imageUrl - URL da imagem
 */
async function deleteImageFromSupabase(imageUrl) {
  try {
    // Extrai o nome do arquivo da URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `products/${fileName}`;

    // Remove do storage
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
  }
}

module.exports = {
  uploadImageToSupabase,
  deleteImageFromSupabase
};

