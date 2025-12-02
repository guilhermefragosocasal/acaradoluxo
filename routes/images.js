const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Middleware de autenticação
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

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/images');
    // Garantir que a pasta existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nome único: timestamp + nome original
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware para tratar erros do multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    // Verificar se é erro do multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Arquivo muito grande. Tamanho máximo: 5MB' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Campo de arquivo inválido. Use o campo "image"' });
    }
    return res.status(400).json({ message: err.message || 'Erro ao processar arquivo' });
  }
  next();
};

// Rota de upload de imagem (requer autenticação)
router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, (req, res) => {
  console.log('📤 Upload recebido:', {
    file: req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'nenhum arquivo',
    body: req.body
  });

  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada. Selecione um arquivo de imagem válido.' });
  }
  
  const imageUrl = `/images/${req.file.filename}`;
  console.log('✅ Upload bem-sucedido:', imageUrl);
  
  res.json({ 
    success: true, 
    url: imageUrl,
    filename: req.file.filename
  });
});

// Rota de proxy para imagens externas (requer autenticação)
router.get('/proxy', authMiddleware, (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ message: 'URL da imagem não fornecida' });
  }

  try {
    const url = new URL(imageUrl);
    
    // Validar que é uma URL http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return res.status(400).json({ message: 'URL inválida' });
    }

    // Fazer requisição da imagem
    const client = url.protocol === 'https:' ? https : http;
    
    client.get(url, (response) => {
      // Verificar se é uma imagem
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({ message: 'URL não é uma imagem válida' });
      }

      // Retornar a imagem
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache de 1 dia
      response.pipe(res);
    }).on('error', (err) => {
      console.error('Erro ao buscar imagem:', err);
      res.status(500).json({ message: 'Erro ao buscar imagem externa' });
    });
  } catch (error) {
    res.status(400).json({ message: 'URL inválida' });
  }
});

// Rota para baixar e salvar imagem externa (requer autenticação)
router.post('/fetch', authMiddleware, async (req, res) => {
  const { url: imageUrl } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({ message: 'URL da imagem não fornecida' });
  }

  try {
    const url = new URL(imageUrl);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return res.status(400).json({ message: 'URL inválida' });
    }

    const client = url.protocol === 'https:' ? https : http;
    const uploadPath = path.join(__dirname, '../public/images');
    
    // Garantir que a pasta existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Gerar nome único
    const ext = path.extname(url.pathname) || '.jpg';
    const filename = Date.now() + '-' + Math.random().toString(36).substring(7) + ext;
    const filepath = path.join(uploadPath, filename);

    client.get(url, (response) => {
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({ message: 'URL não é uma imagem válida' });
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        const imageUrl = `/images/${filename}`;
        res.json({ 
          success: true, 
          url: imageUrl,
          filename: filename
        });
      });

      fileStream.on('error', (err) => {
        console.error('Erro ao salvar imagem:', err);
        res.status(500).json({ message: 'Erro ao salvar imagem' });
      });
    }).on('error', (err) => {
      console.error('Erro ao buscar imagem:', err);
      res.status(500).json({ message: 'Erro ao buscar imagem externa' });
    });
  } catch (error) {
    res.status(400).json({ message: 'URL inválida' });
  }
});

module.exports = router;

