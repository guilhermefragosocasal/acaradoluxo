require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const imagesRouter = require('./routes/images');
const { PORT } = require('./config');

const app = express();

// Configurar helmet para permitir uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS configurado para produção
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc) apenas em desenvolvimento
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});
app.use(limiter);

// APIs
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/images', imagesRouter);

// serve frontend estático
app.use(express.static(path.join(__dirname, 'public')));

// fallback para SPA (apenas para rotas que não são arquivos estáticos ou APIs)
app.get('*', (req, res, next) => {
  // Ignorar rotas de API
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Se a requisição é para um arquivo estático que existe, deixar o express.static lidar
  const fs = require('fs');
  const filePath = path.join(__dirname, 'public', req.path.split('?')[0]); // Remove query string
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return next(); // Deixa o express.static servir o arquivo
  }
  
  // Caso contrário, servir index.html para SPA
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
