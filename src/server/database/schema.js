const db = require('./sqlite');

const initialSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    toolcenter_id TEXT UNIQUE DEFAULT NULL,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS empresas (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    nome TEXT NOT NULL,
    valor_pf REAL DEFAULT 0.0,
    hcpp REAL DEFAULT 20.0,
    fase_ciclo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS projetos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    data_inicio_contagem DATETIME,
    data_fim_contagem DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cargos (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    fator_pf REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS funcionarios (
    id TEXT PRIMARY KEY,
    empresa_id TEXT NOT NULL,
    cargo_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    fator_individual_pf REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY(cargo_id) REFERENCES cargos(id)
  );

  CREATE TABLE IF NOT EXISTS squad_membros (
    id TEXT PRIMARY KEY,
    projeto_id TEXT NOT NULL,
    funcionario_id TEXT NOT NULL,
    adicionado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    FOREIGN KEY(funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS requisitos (
    id TEXT PRIMARY KEY,
    projeto_id TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS funcoes (
    id TEXT PRIMARY KEY,
    projeto_id TEXT NOT NULL,
    requisito_id TEXT,
    numero_funcao TEXT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    td INTEGER DEFAULT 1,
    artr INTEGER DEFAULT 0,
    descricao TEXT,
    complexidade TEXT,
    pf REAL DEFAULT 0.0,
    tipo_melhoria TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    FOREIGN KEY(requisito_id) REFERENCES requisitos(id) ON DELETE SET NULL
  );

  -- Tabela para guardar estado do backup das sessões, se necessário
  CREATE TABLE IF NOT EXISTS configuracoes_backup (
    id TEXT PRIMARY KEY,
    last_backup DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

function initDB() {
  try {
    db.exec(initialSchema);
    console.log('✅ Banco de Dados SQLite iniciado com sucesso.');
  } catch (error) {
    console.error('❌ Erro crítico ao iniciar as tabelas SQLite:', error);
    process.exit(1);
  }
}

module.exports = { initDB };
