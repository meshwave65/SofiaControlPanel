#!/usr/bin/env node

/**
 * Script de Diagnóstico - Sofia Control Panel
 * Testa os endpoints da API e identifica problemas na criação/listagem de missões
 */

const API_BASE = 'https://sofia-api.meshwave.com.br/api/v1';

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testando: ${name}`);
    await fn();
    console.log(`✅ ${name} - OK`);
  } catch (e) {
    console.error(`❌ ${name} - ERRO:`, e.message);
  }
}

async function main() {
  console.log('=== DIAGNÓSTICO DO SOFIA CONTROL PANEL ===\n');

  // Teste 1: Conectividade com a API
  await test('Conectividade com API', async () => {
    const res = await fetch(`${API_BASE}/tasks/`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    console.log(`  → Total de tarefas: ${Array.isArray(data) ? data.length : 'N/A'}`);
  });

  // Teste 2: Criar uma missão de teste
  let testTaskId = null;
  await test('Criar missão de teste', async () => {
    const res = await fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Teste diagnóstico ' + Date.now() })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Status ${res.status}: ${err}`);
    }
    const task = await res.json();
    testTaskId = task.task_id;
    console.log(`  → Task ID: ${testTaskId}`);
    console.log(`  → Status ID: ${task.status_id}`);
    console.log(`  → Estrutura:`, Object.keys(task));
  });

  // Teste 3: Definir título
  if (testTaskId) {
    await test('Definir título da missão', async () => {
      const res = await fetch(`${API_BASE}/tasks/${testTaskId}/title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Teste Diagnóstico' })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Status ${res.status}: ${err}`);
      }
      console.log(`  → Título definido com sucesso`);
    });

    // Teste 4: Atualizar status para STAGED
    await test('Atualizar status para STAGED (100)', async () => {
      const res = await fetch(`${API_BASE}/tasks/${testTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: 100 })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Status ${res.status}: ${err}`);
      }
      console.log(`  → Status atualizado com sucesso`);
    });

    // Teste 5: Recuperar a missão criada
    await test('Recuperar missão criada', async () => {
      const res = await fetch(`${API_BASE}/tasks/${testTaskId}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const task = await res.json();
      console.log(`  → Task ID: ${task.task_id}`);
      console.log(`  → Status ID: ${task.status_id}`);
      console.log(`  → Título: ${task.title_entry?.title || 'N/A'}`);
      console.log(`  → Descrição: ${task.description?.substring(0, 50) || 'N/A'}...`);
    });

    // Teste 6: Listar missões mestres (parent_task_id null)
    await test('Listar missões mestres', async () => {
      const res = await fetch(`${API_BASE}/tasks/`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const tasks = await res.json();
      const missions = tasks.filter(t => t.parent_task_id === null);
      console.log(`  → Total de missões mestres: ${missions.length}`);
      
      // Procura pela missão de teste
      const testMission = missions.find(m => m.task_id === testTaskId);
      if (testMission) {
        console.log(`  → ✅ Missão de teste encontrada na listagem`);
        console.log(`  → Status: ${testMission.status_id}`);
        console.log(`  → Título: ${testMission.title_entry?.title || 'N/A'}`);
      } else {
        console.log(`  → ⚠️ Missão de teste NÃO encontrada na listagem`);
      }
    });
  }

  console.log('\n=== FIM DO DIAGNÓSTICO ===\n');
}

main().catch(console.error);
