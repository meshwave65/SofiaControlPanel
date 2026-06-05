#!/usr/bin/env node

/**
 * Script de Validação Final - Sofia Control Panel
 * Verifica se a criação e atualização de status estão funcionando após as correções
 */

const API_BASE = 'https://sofia-api.meshwave.com.br/api/v1';

async function validate() {
  console.log('=== VALIDAÇÃO FINAL - SOFIA CONTROL PANEL ===\n');

  try {
    // 1. Criar Missão
    console.log('1. Criando missão de teste...');
    const createRes = await fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Validação Final Manus AI ' + new Date().toISOString() })
    });
    
    if (!createRes.ok) throw new Error('Falha ao criar missão');
    const task = await createRes.json();
    const taskId = task.task_id;
    console.log(`✅ Missão criada: ID ${taskId}\n`);

    // 2. Definir Título
    console.log('2. Definindo título...');
    const titleRes = await fetch(`${API_BASE}/tasks/${taskId}/title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Missão de Validação' })
    });
    if (!titleRes.ok) console.warn('⚠️ Falha ao definir título');
    else console.log('✅ Título definido\n');

    // 3. Atualizar Status para STAGED (Usando o novo payload corrigido)
    console.log('3. Atualizando status para STAGED...');
    const patchRes = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'STAGED' })
    });
    
    if (!patchRes.ok) {
      const err = await patchRes.text();
      throw new Error(`Falha ao atualizar status: ${err}`);
    }
    console.log('✅ Status atualizado para STAGED\n');

    // 4. Verificar na listagem
    console.log('4. Verificando na listagem de missões mestres...');
    const listRes = await fetch(`${API_BASE}/tasks/`);
    const tasks = await listRes.json();
    const found = tasks.find(t => t.task_id === taskId);
    
    if (found) {
      console.log('✅ Missão encontrada na listagem!');
      console.log(`   ID: ${found.task_id}`);
      console.log(`   Status: ${JSON.stringify(found.status)}`);
      console.log(`   Título: ${found.title_entry?.title || 'N/A'}`);
    } else {
      throw new Error('Missão não encontrada na listagem');
    }

    console.log('\n✨ VALIDAÇÃO CONCLUÍDA COM SUCESSO! ✨');
  } catch (e) {
    console.error('\n❌ ERRO NA VALIDAÇÃO:', e.message);
    process.exit(1);
  }
}

validate();
