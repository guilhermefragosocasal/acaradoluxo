// Aguardar DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Obter ID do produto da URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'ID do produto não fornecido.';
    }
    return;
  }

  // Carregar produto
  loadProduct(productId);
});

async function loadProduct(productId) {
  console.log('🔄 Carregando produto com ID:', productId);
  try {
    const res = await fetch(`/api/products/${productId}`);
    console.log('📡 Resposta da API:', res.status, res.statusText);
    if (!res.ok) {
      if (res.status === 404) {
        console.log('❌ Produto não encontrado');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Produto não encontrado.';
      } else {
        console.log('❌ Erro ao carregar produto:', res.status);
        const errorText = await res.text();
        console.log('Erro detalhado:', errorText);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Erro ao carregar produto. Tente novamente mais tarde.';
      }
      return;
    }
    
    const product = await res.json();
    console.log('✅ Produto carregado:', product);
    displayProduct(product);
  } catch(err) {
    console.error('❌ Erro de conexão:', err);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = 'Erro de conexão. Verifique sua internet.';
  }
}

function displayProduct(product) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  
  const img = document.getElementById('product-image');
  img.src = product.image || '/images/placeholder.svg';
  img.alt = escapeHTML(product.title);
  img.onerror = function() {
    this.src = '/images/placeholder.svg';
    this.onerror = null;
  };
  
  document.getElementById('product-category').textContent = product.category || '';
  document.getElementById('product-title').textContent = escapeHTML(product.title || '');
  document.getElementById('product-price').textContent = escapeHTML(product.price || '');
  document.getElementById('product-description').textContent = escapeHTML(product.description || 'Sem descrição disponível.');
  
  // Atualizar título da página
  document.title = `${escapeHTML(product.title)} — Lux`;
}

function escapeHTML(s='') {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

