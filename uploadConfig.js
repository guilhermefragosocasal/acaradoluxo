const multer = require('multer');
const path = require('path');

// Configuração do multer para armazenar temporariamente os arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Pasta temporária (será criada automaticamente)
    cb(null, 'uploads/temp/');
  },
  filename: function (req, file, cb) {
    // Nome único para evitar conflitos: timestamp + nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas! (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

module.exports = upload;

