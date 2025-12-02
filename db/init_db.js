const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config');

const dbPath = path.join(__dirname, 'database.sqlite');

// Função para criar o banco e o admin
async function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao abrir banco:', err);
        return reject(err);
      }
    });

    db.serialize(async () => {
      try {
        // Criar tabela admins
        db.run(`
          CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT
          );
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela admins:', err);
            return reject(err);
          }
        });

        // Criar tabela products
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            price TEXT,
            category TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `, (err) => {
          if (err) {
            console.error('Erro ao criar tabela products:', err);
            return reject(err);
          }
        });

        // Verificar se admin já existe
        db.get(`SELECT * FROM admins WHERE username = ?`, [ADMIN_USERNAME], async (err, row) => {
          if (err) {
            console.error('Erro ao verificar admin:', err);
            db.close();
            return reject(err);
          }

          if (!row) {
            // Criar hash da senha
            const saltRounds = 10;
            const hash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

            // Inserir admin
            db.run(
              `INSERT INTO admins (username, password_hash) VALUES (?,?)`,
              [ADMIN_USERNAME, hash],
              function(err) {
                if (err) {
                  console.error('Erro ao criar admin:', err);
                  db.close();
                  return reject(err);
                }
                console.log('✅ Admin criado:', ADMIN_USERNAME);
                
                // Inserir produtos de exemplo apenas se não existirem
                insertSampleProducts(db, resolve, reject);
              }
            );
          } else {
            console.log('✅ Admin já existe:', ADMIN_USERNAME);
            insertSampleProducts(db, resolve, reject);
          }
        });
      } catch (error) {
        console.error('Erro:', error);
        db.close();
        reject(error);
      }
    });
  });
}

function insertSampleProducts(db, resolve, reject) {
  // Verificar se já existem produtos
  db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
    if (err) {
      console.error('Erro ao verificar produtos:', err);
      db.close();
      return reject(err);
    }

    if (row.count === 0) {
      const sample = [
        ["Brinco Ouro", "Brinco clássico em ouro 18k", "R$ 1200", "brinco", "/images/brinco1.jpg"],
        ["Pulseira Elegance", "Pulseira delicada com pingente", "R$ 750", "pulseira", "/images/pulseira1.jpg"],
        ["Colar Night", "Colar longo com pedras", "R$ 980", "colar", "/images/colar1.jpg"],
        ["Kit Festa", "Kit com 3 peças combinando", "R$ 2200", "kit", "/images/kit1.jpg"],
        ["Tornozeleira Praia", "Tornozeleira leve em ouro", "R$ 320", "tornozeleira", "/images/torno1.jpg"],
        ["Diversos - Caixa", "Acessórios mistos", "R$ 199", "diversos", "/images/diversos1.jpg"]
      ];

      const stmt = db.prepare(`INSERT INTO products (title, description, price, category, image) VALUES (?,?,?,?,?)`);
      sample.forEach(p => stmt.run(p));
      stmt.finalize((err) => {
        if (err) {
          console.error('Erro ao inserir produtos:', err);
          db.close();
          return reject(err);
        }
        console.log('✅ Produtos de exemplo inseridos.');
        db.close();
        resolve();
      });
    } else {
      console.log('✅ Produtos já existem no banco.');
      db.close();
      resolve();
    }
  });
}

// Executar inicialização
initDatabase()
  .then(() => {
    console.log('✅ Banco de dados inicializado com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erro ao inicializar banco:', err);
    process.exit(1);
  });
