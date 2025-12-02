const loginForm = document.getElementById('login-form');
const loginMsg = document.getElementById('login-msg');
const adminSection = document.getElementById('admin-section');
const loginSection = document.getElementById('login-section');
const productsList = document.getElementById('products-list');
const productForm = document.getElementById('product-form');
const logoutBtn = document.getElementById('logout-btn');

function token() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function clearToken(){ localStorage.removeItem('token'); }

loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  loginMsg.textContent = '';
  const form = new FormData(loginForm);
  const data = { 
    username: form.get('username')?.trim(), 
    password: form.get('password')?.trim() // Remover espaços da senha também
  };
  
  if (!data.username || !data.password) {
    loginMsg.textContent = 'Preencha todos os campos';
    loginMsg.style.color = '#e74c3c';
    return;
  }
  
  try {
    const res = await fetch('/api/auth/login', {
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if(!res.ok) { 
      loginMsg.textContent = json.message || 'Erro ao fazer login';
      loginMsg.style.color = '#e74c3c';
      return; 
    }
    setToken(json.token);
    loginMsg.textContent = '';
    showAdmin();
  } catch(err) { 
    loginMsg.textContent = 'Erro de conexão';
    loginMsg.style.color = '#e74c3c';
  }
});

logoutBtn?.addEventListener('click', () => {
  clearToken();
  adminSection.style.display = 'none';
  loginSection.style.display = 'block';
});

async function showAdmin(){
  loginSection.style.display = 'none';
  adminSection.style.display = 'block';
  await loadProducts();
}

async function loadProducts(){
  try {
    const res = await fetch('/api/products');
    if (!res.ok) {
      productsList.innerHTML = '<p style="color:#e74c3c">Erro ao carregar produtos</p>';
      return;
    }
    const products = await res.json();
    if (!products || products.length === 0) {
      productsList.innerHTML = '<p style="color:var(--muted)">Nenhum produto cadastrado</p>';
      return;
    }
    productsList.innerHTML = products.map(p => `
      <div style="margin-bottom:12px;border-bottom:1px solid rgba(212,175,55,0.05);padding-bottom:10px">
        <strong>${escapeHTML(p.title)}</strong> — <em>${escapeHTML(p.category)}</em><br/>
        <button data-id="${p.id}" class="edit-btn">Editar</button>
        <button data-id="${p.id}" class="del-btn">Deletar</button>
      </div>
    `).join('');

  document.querySelectorAll('.edit-btn').forEach(b=>{
    b.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      const prod = products.find(p=>p.id==id);
      productForm.id.value = prod.id;
      productForm.title.value = prod.title;
      productForm.description.value = prod.description || '';
      productForm.price.value = prod.price || '';
      productForm.category.value = prod.category || 'diversos';
      productForm.image.value = prod.image || '';
      updateImagePreview(prod.image);
    });
  });

  document.querySelectorAll('.del-btn').forEach(b=>{
    b.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      if(!confirm('Confirmar exclusão?')) return;
      try {
        const res = await fetch(`/api/products/${id}`, {
          method:'DELETE', headers: { 'Authorization': 'Bearer ' + token() }
        });
        if(res.ok) {
          loadProducts();
        } else {
          const json = await res.json();
          alert(json.message || 'Erro ao deletar');
        }
      } catch(err) {
        alert('Erro de conexão');
      }
    });
  });
  } catch(err) {
    productsList.innerHTML = '<p style="color:#e74c3c">Erro ao carregar produtos</p>';
  }
}

function escapeHTML(s='') {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

productForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const id = productForm.id.value;
  
  if (!token()) {
    alert('Sessão expirada. Faça login novamente.');
    clearToken();
    adminSection.style.display = 'none';
    loginSection.style.display = 'block';
    return;
  }
  
  const body = {
    title: productForm.title.value.trim(),
    description: productForm.description.value.trim(),
    price: productForm.price.value.trim(),
    category: productForm.category.value,
    image: productForm.image.value.trim()
  };
  
  const opts = {
    method: id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token()
    },
    body: JSON.stringify(body)
  };
  const url = id ? `/api/products/${id}` : '/api/products';
  
  try {
    const res = await fetch(url, opts);
  if(res.ok) {
    productForm.reset();
    productForm.id.value = '';
    imageFile.value = '';
    updateImagePreview('');
    uploadStatus.textContent = '';
    loadProducts();
    } else {
      const j = await res.json();
      alert(j.message || 'Erro ao salvar');
      if (res.status === 401) {
        clearToken();
        adminSection.style.display = 'none';
        loginSection.style.display = 'block';
      }
    }
  } catch(err) {
    alert('Erro de conexão');
  }
});

// Verificar se token ainda é válido
async function checkToken() {
  const t = token();
  if (!t) return false;
  
  try {
    // Tentar fazer uma requisição autenticada para verificar token
    const res = await fetch('/api/products', {
      headers: { 'Authorization': 'Bearer ' + t }
    });
    // Se token inválido, limpar
    if (res.status === 401) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Funções para upload de imagens
const imageFile = document.getElementById('image-file');
const uploadBtn = document.getElementById('upload-btn');
const uploadStatus = document.getElementById('upload-status');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');

function updateImagePreview(url) {
  if (url) {
    imageInput.value = url;
    previewImg.src = url;
    imagePreview.style.display = 'block';
  } else {
    imagePreview.style.display = 'none';
  }
}

// Upload de arquivo
uploadBtn?.addEventListener('click', async () => {
  const file = imageFile.files[0];
  if (!file) {
    uploadStatus.textContent = 'Selecione um arquivo primeiro';
    uploadStatus.style.color = '#e74c3c';
    return;
  }

  if (!token()) {
    alert('Sessão expirada. Faça login novamente.');
    return;
  }

  uploadStatus.textContent = 'Enviando...';
  uploadStatus.style.color = '#3498db';

  const formData = new FormData();
  formData.append('image', file);

  try {
    console.log('📤 Iniciando upload...', file.name, file.size, 'bytes');
    
    const res = await fetch('/api/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token()
        // NÃO definir Content-Type - deixar o browser definir automaticamente para FormData
      },
      body: formData
    });

    const json = await res.json();
    console.log('📥 Resposta do servidor:', res.status, json);
    
    if (res.ok) {
      uploadStatus.textContent = '✅ Upload realizado!';
      uploadStatus.style.color = '#2ecc71';
      updateImagePreview(json.url);
      imageFile.value = ''; // Limpar input
    } else {
      uploadStatus.textContent = json.message || 'Erro no upload';
      uploadStatus.style.color = '#e74c3c';
      console.error('❌ Erro no upload:', json);
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
    uploadStatus.textContent = 'Erro de conexão: ' + err.message;
    uploadStatus.style.color = '#e74c3c';
  }
});

// Permitir também digitar URL diretamente no campo image (caso queira usar URL manualmente)
imageInput?.addEventListener('input', (e) => {
  updateImagePreview(e.target.value);
});

// se já tem token válido -> tentar abrir admin
checkToken().then(valid => {
  if (valid) showAdmin();
});
