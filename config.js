require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET deve ser definido em produção!');
    }
    return "troque_para_uma_chave_secreta_forte_em_producao";
  })(),
  JWT_EXP: process.env.JWT_EXP || "2h",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123" // só para dev; será hasheada no init_db
};
