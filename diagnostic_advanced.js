#!/usr/bin/env node

/**
 * Script de Diagnóstico Avançado - Sofia Control Panel
 * Testa diferentes payloads e endpoints para identificar o problema de PATCH
 */

const API_BASE = 'https://sofia-api.meshwave.com.br/api/v1';

async function testPatchPayloads(taskId) {
  console.log(`\n🔬 Testando diferentes payloads PATCH para task ${taskId}:\n`);

  const payloads = [
    { name: 'status_id: 100', data: { status_id: 100 } },
    { name: 'status: 100', data: { status: 100 } },
    { name: 'status: "STAGED"', data: { status: 'STAGED' } },
    { name: 'status_id: "100"', data: { status_id: '100' } },
    { name: 'status_id: 100, priority: 1', data: { status_id: 100, priority: 1 } },
  ];

  for (const payload of payloads) {
    try {
      console.log(`  Testing: ${payload.name}`);
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.data)
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`    ✅ SUCCESS - Response:`, JSON.stringify(data).substring(0, 100));
      } else {
        const err = await res.text();
        console.log(`    ❌ FAILED (${res.status}) -`, err.substring(0, 100));
      }
    } catch (e) {
      console.log(`    ❌ ERROR -`, e.message);
    }
    console.log('');
  }
}

async function testGetTaskStructure(taskId) {
  console.log(`\n📋 Estrutura completa da task ${taskId}:\n`);
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`);
    const task = await res.json();
    console.log(JSON.stringify(task, null, 2));
  } catch (e) {
    console.error('Erro ao recuperar task:', e.message);
  }
}

async function testStatusEndpoint(taskId) {
  console.log(`\n🔄 Testando endpoint alternativo para status:\n`);

  const endpoints = [
    { name: 'PATCH /tasks/{id}', method: 'PATCH', url: `${API_BASE}/tasks/${taskId}`, data: { status_id: 100 } },
    { name: 'PUT /tasks/{id}', method: 'PUT', url: `${API_BASE}/tasks/${taskId}`, data: { status_id: 100 } },
    { name: 'POST /tasks/{id}/status', method: 'POST', url: `${API_BASE}/tasks/${taskId}/status`, data: { status_id: 100 } },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`  Testing: ${endpoint.name}`);
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint.data)
      });

      if (res.ok) {
        console.log(`    ✅ SUCCESS (${res.status})`);
      } else {
        console.log(`    ❌ FAILED (${res.status})`);
      }
    } catch (e) {
      console.log(`    ❌ ERROR -`, e.message);
    }
  }
}

async function main() {
  console.log('=== DIAGNÓSTICO AVANÇADO - SOFIA CONTROL PANEL ===');

  // Criar uma task de teste
  console.log('\n📝 Criando task de teste...');
  let testTaskId = null;
  try {
    const res = await fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Teste avançado ' + Date.now() })
    });
    const task = await res.json();
    testTaskId = task.task_id;
    console.log(`✅ Task criada: ${testTaskId}`);
  } catch (e) {
    console.error('❌ Erro ao criar task:', e.message);
    return;
  }

  if (testTaskId) {
    await testGetTaskStructure(testTaskId);
    await testPatchPayloads(testTaskId);
    await testStatusEndpoint(testTaskId);
  }

  console.log('\n=== FIM DO DIAGNÓSTICO AVANÇADO ===\n');
}

main().catch(console.error);
