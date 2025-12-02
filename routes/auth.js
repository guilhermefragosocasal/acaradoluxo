const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXP } = require('../config');

const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Log para debug (remover em produção)
  console.log('\n🔐 Tentativa de login:');
  console.log(`  Username recebido: "${username}" (tamanho: ${username?.length || 0})`);
  console.log(`  Password recebido: "${'*'.repeat(password?.length || 0)}" (tamanho: ${password?.length || 0})`);
  
  if(!username || !password) {
    console.log('  ❌ Credenciais incompletas');
    return res.status(400).json({ message: 'Credenciais incompletas' });
  }

  // Limpar espaços em branco
  const cleanUsername = username.trim();
  const cleanPassword = password;

  db.get(`SELECT * FROM admins WHERE username = ?`, [cleanUsername], async (err, row) => {
    if(err) {
      console.error('  ❌ Erro ao buscar admin:', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
    if(!row) {
      console.log(`  ❌ Usuário não encontrado: "${cleanUsername}"`);
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    console.log(`  ✅ Usuário encontrado: "${row.username}"`);
    console.log(`  Hash no banco: ${row.password_hash.substring(0, 30)}...`);

    try {
      const match = await bcrypt.compare(cleanPassword, row.password_hash);
      console.log(`  Comparação de senha: ${match ? '✅ OK' : '❌ FALHOU'}`);
      
      if(!match) {
        // Tentar comparar sem trim também, caso tenha algum problema
        const matchNoTrim = await bcrypt.compare(password, row.password_hash);
        if (matchNoTrim) {
          console.log('  ⚠️ Senha funcionou sem trim - pode haver espaços extras');
        }
        return res.status(401).json({ message: 'Senha incorreta' });
      }

      const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: JWT_EXP });
      console.log('  ✅ Login bem-sucedido! Token gerado.\n');
      res.json({ token });
    } catch (error) {
      console.error('  ❌ Erro ao comparar senha:', error);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
  });
});

module.exports = router;
