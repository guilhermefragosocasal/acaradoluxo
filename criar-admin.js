// Script para criar/verificar admin no Supabase
// Execute: node criar-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

async function criarAdmin() {
  try {
    console.log('🔍 Verificando se o admin já existe...\n');

    // Verificar se admin existe
    const { data: admins, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', 'admin')
      .limit(1);

    if (checkError) {
      console.error('❌ Erro ao verificar admin:', checkError.message);
      console.log('\n💡 Verifique se:');
      console.log('   1. A tabela "admins" existe no Supabase');
      console.log('   2. As variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas');
      console.log('   3. Execute o script migration_supabase.sql no Supabase\n');
      return;
    }

    if (admins && admins.length > 0) {
      console.log('✅ Admin já existe!');
      console.log('   Usuário: admin');
      console.log('   Senha: admin123\n');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
      return;
    }

    // Criar admin
    console.log('📝 Criando admin padrão...\n');
    const hash = bcrypt.hashSync('admin123', 10);
    
    const { data, error: insertError } = await supabase
      .from('admins')
      .insert([{ username: 'admin', password_hash: hash }])
      .select();

    if (insertError) {
      console.error('❌ Erro ao criar admin:', insertError.message);
      console.log('\n💡 Possíveis causas:');
      console.log('   1. Tabela "admins" não existe - Execute migration_supabase.sql');
      console.log('   2. Políticas RLS bloqueando - Verifique as políticas no Supabase');
      console.log('   3. Variáveis de ambiente não configuradas\n');
      return;
    }

    console.log('✅ Admin criado com sucesso!\n');
    console.log('📋 Credenciais:');
    console.log('   Usuário: admin');
    console.log('   Senha: admin123\n');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
    console.log('🌐 Acesse: http://localhost:3000/admin/login\n');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    console.log('\n💡 Verifique:');
    console.log('   1. Conexão com Supabase');
    console.log('   2. Variáveis de ambiente (.env)');
    console.log('   3. Tabela "admins" existe no banco\n');
  }
}

criarAdmin();

