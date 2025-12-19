// Script para resetar senha do admin para 'admin123'
// Execute: node resetar-senha-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

async function resetarSenha() {
  try {
    console.log('🔐 Resetando senha do admin para "admin123"...\n');

    // Gerar hash correto para 'admin123'
    const hash = bcrypt.hashSync('admin123', 10);
    
    // Atualizar senha no banco
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: hash })
      .eq('username', 'admin')
      .select();

    if (error) {
      console.error('❌ Erro ao resetar senha:', error.message);
      if (error.message.includes('RLS') || error.message.includes('row-level security')) {
        console.log('\n💡 As políticas RLS estão bloqueando.');
        console.log('   Execute este SQL no Supabase:');
        console.log('   ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;\n');
      }
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ Admin não encontrado!');
      console.log('   Execute primeiro: node criar-admin.js\n');
      return;
    }

    console.log('✅ Senha resetada com sucesso!\n');
    console.log('📋 Credenciais de login:');
    console.log('   Usuário: admin');
    console.log('   Senha: admin123\n');
    console.log('🌐 Acesse: http://localhost:3000/admin/login\n');

    // Testar se a senha funciona
    console.log('🔍 Testando senha...');
    const admin = data[0];
    const senhaValida = bcrypt.compareSync('admin123', admin.password_hash);
    
    if (senhaValida) {
      console.log('✅ Senha testada e funcionando!\n');
    } else {
      console.log('❌ Erro: Senha não corresponde ao hash!\n');
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

resetarSenha();

