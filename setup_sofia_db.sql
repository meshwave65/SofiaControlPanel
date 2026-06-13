-- Script de Criação de Tabelas - SOFIA DB
-- Este script deve ser executado no banco de dados MySQL/TiDB para suportar o Sofia Control Panel.

-- 1. Tabela de Status de Tarefas
CREATE TABLE IF NOT EXISTS task_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir status padrão (Sistemática 100-200)
INSERT IGNORE INTO task_statuses (id, name, description) VALUES 
(100, 'STAGED', 'Tarefa aguardando início'),
(110, 'PROGRESS', 'Tarefa em execução'),
(120, 'PAUSED', 'Tarefa pausada temporariamente'),
(130, 'DONE', 'Tarefa concluída com sucesso'),
(200, 'FAIL', 'Tarefa falhou ou foi abortada');

-- 2. Tabela de Prioridades
CREATE TABLE IF NOT EXISTS task_priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    level INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO task_priorities (id, name, level) VALUES 
(1, 'Baixa', 10),
(2, 'Média', 20),
(3, 'Alta', 30),
(4, 'Crítica', 40);

-- 3. Tabela de Agentes
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('online', 'offline', 'idle', 'paused') DEFAULT 'offline',
    version VARCHAR(64),
    manus_account VARCHAR(255),
    manus_password VARCHAR(255),
    manus_token TEXT,
    last_heartbeat TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabela de Tarefas (Missões e Subtarefas)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status_id INT NOT NULL DEFAULT 100,
    priority_id INT NOT NULL DEFAULT 1,
    parent_task_id INT NULL,
    due_date TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
    CONSTRAINT fk_status FOREIGN KEY (status_id) REFERENCES task_statuses(id),
    CONSTRAINT fk_priority FOREIGN KEY (priority_id) REFERENCES task_priorities(id),
    CONSTRAINT fk_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 5. Tabela de Títulos de Tarefas (Opcional, se usar a sistemática do Agente Inovarse)
CREATE TABLE IF NOT EXISTS task_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_title FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 6. Tabela de Blocos de Tarefas (Descrição/Relatórios)
CREATE TABLE IF NOT EXISTS task_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    content TEXT NOT NULL,
    block_type VARCHAR(64) DEFAULT 'description',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_block FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 7. Tabela de Mensagens (Threads)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    sender_id INT NOT NULL, -- Referência ao ID do usuário ou agente
    parent_message_id INT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_parent FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE
);
