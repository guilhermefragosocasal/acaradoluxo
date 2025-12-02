const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('🔍 Diagnóstico de Login\n');
console.log('Configuração:');
console.log(`  ADMIN_USERNAME: "${ADMIN_USERNAME}"`);
console.log(`  ADMIN_PASSWORD: "${ADMIN_PASSWORD}"`);
console.log(`  Tamanho da senha: ${ADMIN_PASSWORD.length} caracteres\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao abrir banco:', err);
    process.exit(1);
  }
});

db.get(`SELECT * FROM admins WHERE username = ?`, [ADMIN_USERNAME], async (err, row) => {
  if (err) {
    console.error('❌ Erro ao buscar admin:', err);
    db.close();
    process.exit(1);
  }

  if (!row) {
    console.error('❌ Admin não encontrado no banco!');
    console.log('Execute: npm run reset-admin');
    db.close();
    process.exit(1);
  }

  console.log('✅ Admin encontrado no banco:');
  console.log(`  ID: ${row.id}`);
  console.log(`  Username: "${row.username}"`);
  console.log(`  Password Hash: ${row.password_hash.substring(0, 30)}...`);
  console.log(`  Tamanho do hash: ${row.password_hash.length} caracteres\n`);

  // Verificar se username corresponde
  if (row.username !== ADMIN_USERNAME) {
    console.error('❌ Username não corresponde!');
    console.log(`  Esperado: "${ADMIN_USERNAME}"`);
    console.log(`  Encontrado: "${row.username}"`);
    db.close();
    process.exit(1);
  }

  console.log('🔐 Testando comparação de senha...');
  
  // Testar com a senha do config
  bcrypt.compare(ADMIN_PASSWORD, row.password_hash, (err, match) => {
    if (err) {
      console.error('❌ Erro ao comparar senha:', err);
      db.close();
      process.exit(1);
    }

    if (match) {
      console.log('✅ Senha CORRETA! A comparação funcionou.');
      console.log('\n📝 Tente fazer login com:');
      console.log(`   Usuário: ${ADMIN_USERNAME}`);
      console.log(`   Senha: ${ADMIN_PASSWORD}`);
    } else {
      console.error('❌ Senha INCORRETA! A comparação falhou.');
      console.log('\n🔧 Vamos resetar a senha...\n');
      
      // Resetar a senha
      bcrypt.hash(ADMIN_PASSWORD, 10, (err, newHash) => {
        if (err) {
          console.error('❌ Erro ao gerar novo hash:', err);
          db.close();
          process.exit(1);
        }

        db.run(
          `UPDATE admins SET password_hash = ? WHERE username = ?`,
          [newHash, ADMIN_USERNAME],
          function(updateErr) {
            if (updateErr) {
              console.error('❌ Erro ao atualizar senha:', updateErr);
              db.close();
              process.exit(1);
            }

            console.log('✅ Senha resetada! Novo hash gerado.');
            
            // Testar novamente
            bcrypt.compare(ADMIN_PASSWORD, newHash, (testErr, testMatch) => {
              if (testErr) {
                console.error('❌ Erro ao testar nova senha:', testErr);
              } else if (testMatch) {
                console.log('✅ Teste da nova senha: OK!');
                console.log('\n📝 Agora tente fazer login com:');
                console.log(`   Usuário: ${ADMIN_USERNAME}`);
                console.log(`   Senha: ${ADMIN_PASSWORD}`);
              } else {
                console.error('❌ Algo está muito errado - o hash não corresponde mesmo após reset!');
              }
              db.close();
              process.exit(testMatch ? 0 : 1);
            });
          }
        );
      });
    }
  });
});


