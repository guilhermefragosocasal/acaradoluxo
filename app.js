require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const supabase = require('./supabaseClient');
const upload = require('./uploadConfig');
const { uploadImageToSupabase, deleteImageFromSupabase } = require('./imageUploader');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa tabelas no Supabase (se não existirem)
async function initializeTables() {
  try {
    // As tabelas devem ser criadas manualmente no Supabase ou usar o script de migração
    // Este código apenas verifica/cria o admin padrão
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', 'admin')
      .limit(1);

    if (adminError) {
      console.error('Erro ao verificar admin padrão:', adminError);
      return;
    }

    if (!admins || admins.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      const { error: insertError } = await supabase
        .from('admins')
        .insert([{ username: 'admin', password_hash: hash }]);

      if (insertError) {
        console.error('Erro ao criar admin padrão:', insertError);
      } else {
        console.log('Administrador padrão criado: usuário "admin", senha "admin123".');
      }
    }
  } catch (err) {
    console.error('Erro ao inicializar tabelas:', err);
  }
}

initializeTables();

// Configuração do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Criar pasta de uploads temporários se não existir
const uploadsDir = path.join(__dirname, 'uploads', 'temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'acaradoluxo_super_secreto_dev_only',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Middleware para passar dados padrão para as views
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.adminId;
  res.locals.currentUser = req.session.username || null;
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '5511996955347';
  next();
});

// Middleware de autenticação
function requireAdmin(req, res, next) {
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
}

// Rotas públicas
app.get('/', async (req, res) => {
  try {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (catError) {
      return res.status(500).send('Erro ao carregar categorias.');
    }

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .order('id', { ascending: false });

    if (prodError) {
      return res.status(500).send('Erro ao carregar produtos.');
    }

    // Mapear dados para compatibilidade com a view
    const formattedProducts = products.map(p => ({
      ...p,
      category_name: p.categories ? p.categories.name : null,
      category_slug: p.categories ? p.categories.slug : null,
    }));

    res.render('index', {
      title: 'Catálogo - À Cara do Luxo',
      categories,
      products: formattedProducts,
    });
  } catch (err) {
    console.error('Erro na rota principal:', err);
    res.status(500).send('Erro ao carregar página.');
  }
});

app.get('/categoria/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;

    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single();

    if (catError || !category) {
      return res.status(404).send('Categoria não encontrada.');
    }

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('category_id', category.id)
      .order('id', { ascending: false });

    if (prodError) {
      return res.status(500).send('Erro ao carregar produtos da categoria.');
    }

    const formattedProducts = products.map(p => ({
      ...p,
      category_name: p.categories ? p.categories.name : null,
      category_slug: p.categories ? p.categories.slug : null,
    }));

    res.render('category', {
      title: `${category.name} - À Cara do Luxo`,
      category,
      products: formattedProducts,
    });
  } catch (err) {
    console.error('Erro na rota de categoria:', err);
    res.status(500).send('Erro ao carregar categoria.');
  }
});

// Rotas de autenticação de administrador
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { title: 'Login do Administrador', error: null });
});

app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .limit(1)
      .single();

    if (error || !admin) {
      return res.render('admin/login', {
        title: 'Login do Administrador',
        error: 'Usuário ou senha inválidos.',
      });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      return res.render('admin/login', {
        title: 'Login do Administrador',
        error: 'Usuário ou senha inválidos.',
      });
    }

    req.session.adminId = admin.id;
    req.session.username = admin.username;
    res.redirect('/admin/produtos');
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).send('Erro ao fazer login.');
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Rotas do painel admin - produtos
app.get('/admin/produtos', requireAdmin, async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('id', { ascending: false });

    if (error) {
      return res.status(500).send('Erro ao carregar produtos.');
    }

    const formattedProducts = products.map(p => ({
      ...p,
      category_name: p.categories ? p.categories.name : null,
    }));

    res.render('admin/products_list', {
      title: 'Gerenciar Produtos',
      products: formattedProducts,
    });
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).send('Erro ao carregar produtos.');
  }
});

app.get('/admin/produtos/novo', requireAdmin, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).send('Erro ao carregar categorias.');
    }

    res.render('admin/product_form', {
      title: 'Novo Produto',
      product: null,
      categories,
    });
  } catch (err) {
    console.error('Erro ao acessar formulário de novo produto:', err);
    res.status(500).send('Erro ao carregar formulário.');
  }
});

app.post('/admin/produtos/novo', requireAdmin, upload.single('product_image'), async (req, res) => {
  try {
    const { name, description, price, image_url, category_id, mercado_pago_link } = req.body;
    
    let finalImageUrl = image_url || null;

    // Se um arquivo foi enviado, fazer upload para Supabase
    if (req.file) {
      try {
        finalImageUrl = await uploadImageToSupabase(req.file.path, req.file.filename);
      } catch (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        return res.status(500).send('Erro ao fazer upload da imagem. Tente novamente ou use uma URL.');
      }
    }

    const { error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || null,
        price: price ? parseFloat(price) : null,
        image_url: finalImageUrl,
        category_id: category_id || null,
        mercado_pago_link: mercado_pago_link || null,
      }]);

    if (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).send('Erro ao criar produto.');
    }

    res.redirect('/admin/produtos');
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).send('Erro ao criar produto.');
  }
});

app.get('/admin/produtos/:id/editar', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (prodError || !product) {
      return res.status(404).send('Produto não encontrado.');
    }

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (catError) {
      return res.status(500).send('Erro ao carregar categorias.');
    }

    res.render('admin/product_form', {
      title: 'Editar Produto',
      product,
      categories,
    });
  } catch (err) {
    console.error('Erro ao acessar edição de produto:', err);
    res.status(500).send('Erro ao carregar produto.');
  }
});

app.post('/admin/produtos/:id/editar', requireAdmin, upload.single('product_image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, image_url, category_id, mercado_pago_link } = req.body;

    // Buscar produto atual para verificar imagem antiga
    const { data: currentProduct } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    let finalImageUrl = image_url || null;
    let oldImageUrl = currentProduct?.image_url;

    // Se um arquivo foi enviado, fazer upload para Supabase
    if (req.file) {
      try {
        finalImageUrl = await uploadImageToSupabase(req.file.path, req.file.filename);
        
        // Se havia uma imagem antiga no Supabase, deletá-la
        if (oldImageUrl && oldImageUrl.includes('supabase.co')) {
          await deleteImageFromSupabase(oldImageUrl);
        }
      } catch (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        return res.status(500).send('Erro ao fazer upload da imagem. Tente novamente ou use uma URL.');
      }
    }

    const { error } = await supabase
      .from('products')
      .update({
        name,
        description: description || null,
        price: price ? parseFloat(price) : null,
        image_url: finalImageUrl,
        category_id: category_id || null,
        mercado_pago_link: mercado_pago_link || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).send('Erro ao atualizar produto.');
    }

    res.redirect('/admin/produtos');
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).send('Erro ao atualizar produto.');
  }
});

app.post('/admin/produtos/:id/deletar', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    // Buscar produto para deletar imagem do Supabase
    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    // Deletar produto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      return res.status(500).send('Erro ao excluir produto.');
    }

    // Se havia uma imagem no Supabase, deletá-la também
    if (product?.image_url && product.image_url.includes('supabase.co')) {
      await deleteImageFromSupabase(product.image_url);
    }

    res.redirect('/admin/produtos');
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    res.status(500).send('Erro ao excluir produto.');
  }
});

// Rotas do painel admin - categorias
app.get('/admin/categorias', requireAdmin, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).send('Erro ao carregar categorias.');
    }

    res.render('admin/categories_list', {
      title: 'Gerenciar Categorias',
      categories,
    });
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    res.status(500).send('Erro ao carregar categorias.');
  }
});

app.post('/admin/categorias/novo', requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;

    const { error } = await supabase
      .from('categories')
      .insert([{ name, slug }]);

    if (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).send('Erro ao criar categoria.');
    }

    res.redirect('/admin/categorias');
  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    res.status(500).send('Erro ao criar categoria.');
  }
});

app.post('/admin/categorias/:id/deletar', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      return res.status(500).send('Erro ao excluir categoria.');
    }

    res.redirect('/admin/categorias');
  } catch (err) {
    console.error('Erro ao excluir categoria:', err);
    res.status(500).send('Erro ao excluir categoria.');
  }
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


