const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

// Validação de categoria
const validCategories = ['brinco', 'pulseira', 'tornozeleira', 'colar', 'kit', 'diversos'];

/* Public: listar todos ou por categoria
   GET /api/products?category=brinco
*/
router.get('/', (req, res) => {
  const category = req.query.category;
  
  // Validar categoria se fornecida
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ message: 'Categoria inválida' });
  }
  
  const q = category ? `SELECT * FROM products WHERE category = ? ORDER BY created_at DESC` : `SELECT * FROM products ORDER BY created_at DESC`;
  const params = category ? [category] : [];
  db.all(q, params, (err, rows) => {
    if(err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
    res.json(rows || []);
  });
});

/* Public: buscar produto por ID
   GET /api/products/:id
*/
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🔍 Buscando produto com ID: ${id}`);
  if (isNaN(id) || id <= 0) {
    console.log(`❌ ID inválido: ${req.params.id}`);
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if(err) {
      console.error('❌ Erro ao buscar produto:', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
    if(!row) {
      console.log(`❌ Produto não encontrado com ID: ${id}`);
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    console.log(`✅ Produto encontrado: ${row.title}`);
    res.json(row);
  });
});

// Middleware de autenticação para rotas de admin
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ message: 'Token ausente' });
  const token = authHeader.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'Token inválido' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if(err) return res.status(401).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

function validateProduct(req, res, next) {
  const { title, description, price, category, image } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'Título é obrigatório' });
  }
  if (title.length > 200) {
    return res.status(400).json({ message: 'Título muito longo (máx. 200 caracteres)' });
  }
  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ message: 'Categoria inválida' });
  }
  if (description && description.length > 1000) {
    return res.status(400).json({ message: 'Descrição muito longa (máx. 1000 caracteres)' });
  }
  // Validar URL de imagem (aceita http/https, caminhos relativos, ou vazio para usar placeholder)
  if (image && image.trim().length > 0) {
    const imagePattern = /^(https?:\/\/.+|(\/|\.\/).+\.(jpg|jpeg|png|gif|webp|svg)$|\/images\/.+)/i;
    if (!imagePattern.test(image.trim())) {
      return res.status(400).json({ message: 'URL da imagem inválida. Use http/https, caminho relativo (/images/...) ou deixe vazio para placeholder' });
    }
  }
  
  req.validatedProduct = {
    title: title.trim(),
    description: (description || '').trim(),
    price: (price || '').trim(),
    category: category.trim(),
    image: (image || '').trim()
  };
  next();
}

// ADMIN: criar produto
router.post('/', authMiddleware, validateProduct, (req, res) => {
  const { title, description, price, category, image } = req.validatedProduct;
  db.run(`INSERT INTO products (title, description, price, category, image) VALUES (?,?,?,?,?)`,
    [title, description, price, category, image],
    function(err) {
      if(err) {
        console.error('Erro ao criar produto:', err);
        return res.status(500).json({ message: 'Erro ao criar produto' });
      }
      db.get(`SELECT * FROM products WHERE id = ?`, [this.lastID], (err, row) => {
        if(err) {
          console.error('Erro ao buscar produto criado:', err);
          return res.status(500).json({ message: 'Produto criado mas erro ao retornar' });
        }
        res.status(201).json(row);
      });
    });
});

// ADMIN: editar
router.put('/:id', authMiddleware, validateProduct, (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  const { title, description, price, category, image } = req.validatedProduct;
  
  // Verificar se produto existe
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if(err) {
      console.error('Erro ao verificar produto:', err);
      return res.status(500).json({ message: 'Erro ao verificar produto' });
    }
    if(!row) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    db.run(`UPDATE products SET title=?, description=?, price=?, category=?, image=? WHERE id=?`,
      [title, description, price, category, image, id],
      function(err) {
        if(err) {
          console.error('Erro ao atualizar produto:', err);
          return res.status(500).json({ message: 'Erro ao atualizar produto' });
        }
        db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
          if(err) {
            console.error('Erro ao buscar produto atualizado:', err);
            return res.status(500).json({ message: 'Produto atualizado mas erro ao retornar' });
          }
          res.json(row);
        });
      });
  });
});

// ADMIN: deletar
router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  // Verificar se produto existe antes de deletar
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if(err) {
      console.error('Erro ao verificar produto:', err);
      return res.status(500).json({ message: 'Erro ao verificar produto' });
    }
    if(!row) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
      if(err) {
        console.error('Erro ao deletar produto:', err);
        return res.status(500).json({ message: 'Erro ao deletar' });
      }
      res.json({ message: 'Produto deletado com sucesso' });
    });
  });
});

module.exports = router;
