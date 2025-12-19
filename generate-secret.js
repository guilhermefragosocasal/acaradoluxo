// Script para gerar SESSION_SECRET seguro
// Execute: node generate-secret.js

const crypto = require('crypto');

// Gera um secret aleatório de 64 bytes (512 bits) em base64
const secret = crypto.randomBytes(64).toString('base64');

console.log('\n🔐 SESSION_SECRET gerado com sucesso!\n');
console.log('Copie e cole este valor no seu arquivo .env:');
console.log('─'.repeat(60));
console.log(`SESSION_SECRET=${secret}`);
console.log('─'.repeat(60));
console.log('\n💡 Dica: Adicione esta linha ao seu arquivo .env');
console.log('   Não compartilhe este secret publicamente!\n');

