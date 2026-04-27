const db = require('../src/server/database/sqlite');

try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Verificar se as colunas já existem
    const columns = db.prepare("PRAGMA table_info(projetos)").all();
    const columnNames = columns.map(c => c.name);
    
    if (!columnNames.includes('vaf')) {
        console.log('➕ Adicionando coluna "vaf" à tabela "projetos"...');
        db.prepare("ALTER TABLE projetos ADD COLUMN vaf TEXT").run();
    }
    
    if (!columnNames.includes('tipo_contagem')) {
        console.log('➕ Adicionando coluna "tipo_contagem" à tabela "projetos"...');
        db.prepare("ALTER TABLE projetos ADD COLUMN tipo_contagem TEXT DEFAULT 'desenvolvimento'").run();
    }
    
    console.log('✅ Migração concluída com sucesso!');
} catch (error) {
    console.error('❌ Erro durante a migração:', error);
} finally {
    // No need to close if it's a shared instance, but good practice if it's a script
}
