const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config');

const dbPath = path.join(__dirname, 'database.sqlite');

async function resetAdmin() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao abrir banco:', err);
        return reject(err);
      }
    });

    console.log('🔐 Gerando novo hash para a senha...');
    console.log(`Usuário: ${ADMIN_USERNAME}`);
    console.log(`Senha: ${ADMIN_PASSWORD}`);
    
    // Gerar hash da senha
    bcrypt.hash(ADMIN_PASSWORD, 10, (err, hash) => {
      if (err) {
        console.error('Erro ao gerar hash:', err);
        db.close();
        return reject(err);
      }

      console.log('Hash gerado:', hash.substring(0, 20) + '...');

      // Verificar se admin existe
      db.get(`SELECT * FROM admins WHERE username = ?`, [ADMIN_USERNAME], (err, row) => {
        if (err) {
          console.error('Erro ao buscar admin:', err);
          db.close();
          return reject(err);
        }

        if (row) {
          // Atualizar senha existente
          db.run(
            `UPDATE admins SET password_hash = ? WHERE username = ?`,
            [hash, ADMIN_USERNAME],
            function(err) {
              if (err) {
                console.error('Erro ao atualizar senha:', err);
                db.close();
                return reject(err);
              }
              console.log('✅ Senha do admin atualizada com sucesso!');
              
              // Testar se a senha funciona
              bcrypt.compare(ADMIN_PASSWORD, hash, (err, match) => {
                if (err) {
                  console.error('Erro ao testar senha:', err);
                } else if (match) {
                  console.log('✅ Teste de senha: OK - A senha está funcionando corretamente!');
                } else {
                  console.error('❌ Teste de senha: FALHOU - O hash não corresponde à senha!');
                }
                db.close();
                resolve();
              });
            }
          );
        } else {
          // Criar novo admin
          db.run(
            `INSERT INTO admins (username, password_hash) VALUES (?,?)`,
            [ADMIN_USERNAME, hash],
            function(err) {
              if (err) {
                console.error('Erro ao criar admin:', err);
                db.close();
                return reject(err);
              }
              console.log('✅ Admin criado com sucesso!');
              
              // Testar se a senha funciona
              bcrypt.compare(ADMIN_PASSWORD, hash, (err, match) => {
                if (err) {
                  console.error('Erro ao testar senha:', err);
                } else if (match) {
                  console.log('✅ Teste de senha: OK - A senha está funcionando corretamente!');
                } else {
                  console.error('❌ Teste de senha: FALHOU - O hash não corresponde à senha!');
                }
                db.close();
                resolve();
              });
            }
          );
        }
      });
    });
  });
}

resetAdmin()
  .then(() => {
    console.log('\n✅ Processo concluído! Agora você pode fazer login com:');
    console.log(`   Usuário: ${ADMIN_USERNAME}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
  });


