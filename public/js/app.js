const grid = document.getElementById('grid');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

async function fetchProducts(category='') {
  try {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`/api/products${q}`);
    if(!res.ok) {
      grid.innerHTML = `<p style="color: #bdb6aa; text-align: center; padding: 20px;">Erro ao carregar produtos. Tente novamente mais tarde.</p>`;
      return;
    }
    const products = await res.json();
    render(products);
  } catch(err) {
    grid.innerHTML = `<p style="color: #bdb6aa; text-align: center; padding: 20px;">Erro de conexão. Verifique sua internet.</p>`;
  }
}

function render(products) {
  if(!products || products.length === 0) {
    grid.innerHTML = `<p style="color: #bdb6aa; text-align: center; padding: 20px;">Nenhum produto encontrado nesta categoria.</p>`;
    return;
  }
  grid.innerHTML = products.map(p => {
    // Truncar descrição para mostrar apenas um resumo
    const shortDesc = p.description ? (p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description) : '';
    return `
    <article class="card" data-id="${p.id}">
      <img src="${p.image || '/images/placeholder.svg'}" 
           alt="${escapeHTML(p.title)}" 
           onerror="this.src='/images/placeholder.svg'; this.onerror=null;" />
      <h3>${escapeHTML(p.title)}</h3>
      ${shortDesc ? `<p>${escapeHTML(shortDesc)}</p>` : ''}
      <div class="price">${escapeHTML(p.price || '')}</div>
    </article>
    `;
  }).join('');
  
  // Adicionar event listeners para os cards
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.id;
      window.location.href = `/product.html?id=${productId}`;
    });
  });
}

function escapeHTML(s='') {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// category buttons
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.category-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    fetchProducts(cat);
  });
});

// initial
fetchProducts();
