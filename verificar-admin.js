// Script para verificar se admin existe e testar login
// Execute: node verificar-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

async function verificarAdmin() {
  try {
    console.log('🔍 Verificando admin no Supabase...\n');

    // Verificar se admin existe
    const { data: admins, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', 'admin');

    if (checkError) {
      console.error('❌ Erro ao verificar:', checkError.message);
      console.log('\n💡 O erro indica que:');
      if (checkError.message.includes('RLS') || checkError.message.includes('row-level security')) {
        console.log('   - As políticas RLS estão bloqueando o acesso');
        console.log('   - Execute o script fix_admin_rls.sql no Supabase SQL Editor\n');
      } else if (checkError.message.includes('does not exist')) {
        console.log('   - A tabela "admins" não existe');
        console.log('   - Execute o script migration_supabase.sql primeiro\n');
      } else {
        console.log('   - Verifique as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY\n');
      }
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('❌ Nenhum admin encontrado!\n');
      console.log('📝 Para criar o admin:');
      console.log('   1. Execute: node criar-admin.js');
      console.log('   2. OU execute fix_admin_rls.sql no Supabase e tente novamente\n');
      return;
    }

    console.log('✅ Admin encontrado!\n');
    console.log('📋 Informações:');
    admins.forEach(admin => {
      console.log(`   ID: ${admin.id}`);
      console.log(`   Usuário: ${admin.username}`);
      console.log(`   Criado em: ${admin.created_at || 'N/A'}`);
    });

    // Testar senha
    console.log('\n🔐 Testando senha "admin123"...');
    const admin = admins[0];
    const senhaTeste = 'admin123';
    const senhaValida = bcrypt.compareSync(senhaTeste, admin.password_hash);

    if (senhaValida) {
      console.log('✅ Senha "admin123" está CORRETA!\n');
      console.log('📋 Credenciais de login:');
      console.log('   Usuário: admin');
      console.log('   Senha: admin123\n');
    } else {
      console.log('❌ Senha "admin123" está INCORRETA!');
      console.log('   A senha foi alterada ou o hash está diferente.\n');
      console.log('💡 Para resetar a senha:');
      console.log('   1. Execute no Supabase SQL Editor:');
      console.log('      UPDATE admins SET password_hash = \'$2a$10$rKqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX\' WHERE username = \'admin\';');
      console.log('   2. OU use o script criar-admin.js (ele sobrescreve se já existir)\n');
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    console.log('\n💡 Verifique:');
    console.log('   1. Conexão com Supabase');
    console.log('   2. Arquivo .env com SUPABASE_URL e SUPABASE_ANON_KEY');
    console.log('   3. Tabela "admins" existe no banco\n');
  }
}

verificarAdmin();

