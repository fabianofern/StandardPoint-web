import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

// ==========================================
// COMPONENTE INTERNO: CreateBackupButton
// (fica no mesmo arquivo, sem importar de fora)
// ==========================================
const CreateBackupButton = ({
  compact = false,
  onSuccess,
  onError,
  label = "📥 Criar Backup",
  showPath = true
}) => {
  const { empresas, empresaAtual, projetoAtual } = useFunctionContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateBackup = async () => {
    if (empresas.length === 0) {
      setMessage('❌ Nenhuma empresa para fazer backup');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Preparar dados do backup
      const dadosBackup = {
        empresas,
        empresaAtual,
        projetoAtual,
        lastModified: new Date().toISOString(),
        version: '1.2.1',
        tipo: 'backup-manual',
        totalEmpresas: empresas.length,
        totalProjetos: empresas.reduce((acc, emp) => acc + (emp.projetos?.length || 0), 0)
      };

      let result;

      const { backupAPI } = await import('../utils/webAdapter');
      result = await backupAPI.save(dadosBackup);

      if (result) {
        setMessage(showPath ? `✅ Salvo em: ${result.filename}` : '✅ Backup criado!');
        onSuccess?.(result);
      } else {
        throw new Error('Falha ao salvar no servidor Node');
      }

    } catch (error) {
      console.error('Erro no backup:', error);
      setMessage(`❌ Erro: ${error.message}`);
      onError?.(error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const buttonStyle = compact ? {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    width: '100%'
  } : {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    fontWeight: '500'
  };

  const messageStyle = {
    marginTop: '8px',
    padding: '6px',
    fontSize: compact ? '10px' : '12px',
    borderRadius: '4px',
    textAlign: 'center',
    wordBreak: 'break-word',
    backgroundColor: message.includes('✅') ? '#dcfce7' :
      message.includes('❌') ? '#fee2e2' : '#fef3c7',
    color: message.includes('✅') ? '#166534' :
      message.includes('❌') ? '#991b1b' : '#92400e'
  };

  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={handleCreateBackup}
        disabled={loading || empresas.length === 0}
        style={buttonStyle}
        title={empresas.length === 0 ? 'Adicione uma empresa primeiro' : 'Salvar backup em local escolhido'}
      >
        {loading ? '🔄 Criando...' : label}
      </button>

      {message && (
        <div style={messageStyle}>
          {message}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL: BackupManager
// ==========================================
const BackupManager = ({ compact = false }) => {
  const { lastSaved, saveStatus } = useFunctionContext();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const { backupAPI } = await import('../utils/webAdapter');
      const lista = await backupAPI.list();
      
      const formatLista = lista.map(nome => ({
        nome: nome,
        tamanho: 1024,
        dataModificacao: new Date().toISOString()
      }));
      setBackups(formatLista);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleRestore = async (filename) => {
    if (!window.confirm(`Tem certeza que deseja restaurar o backup "${filename}"? Isso irá sobrescrever todos os dados atuais e a ação não pode ser desfeita.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const { backupAPI } = await import('../utils/webAdapter');
      const loadedData = await backupAPI.load(filename);
      if (loadedData) {
        // Envia de volta para forçar a atualização no SQLite via servidor
        await backupAPI.save(loadedData, filename);
        alert('Backup restaurado com sucesso! A aplicação será recarregada para aplicar as mudanças.');
        window.location.reload();
      } else {
        alert('Erro: Arquivo de backup vazio ou inválido.');
      }
    } catch (error) {
      console.error('Erro na restauração:', error);
      alert('Erro ao restaurar backup.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportLocal = async () => {
    try {
      const { backupAPI } = await import('../utils/webAdapter');
      const loadedData = await backupAPI.loadFromFilePrompt();
      if (loadedData) {
        if (!window.confirm(`Tem certeza que deseja importar e aplicar este backup local? Isso irá sobrescrever todos os dados atuais da ferramenta.`)) {
          return;
        }
        setLoading(true);
        await backupAPI.save(loadedData, `backup_importado_${new Date().getTime()}.json`);
        alert('Backup local importado com sucesso! A aplicação será recarregada para aplicar as mudanças.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro na importação local:', error);
      alert('Erro ao importar backup local.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  const formatFileDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const containerStyle = compact ? styles.compactContainer : styles.normalContainer;
  const titleStyle = compact ? styles.compactTitle : styles.normalTitle;
  const statusStyle = compact ? styles.compactStatus : styles.normalStatus;

  return (
    <div style={containerStyle} className={compact ? 'compact-backup-manager' : ''}>
      {!compact && (
        <h3 style={titleStyle}>💾 Gerenciamento de Backups</h3>
      )}

      {/* Status de salvamento */}
      <div style={statusStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: compact ? '8px' : '12px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: saveStatus === 'error' ? '#ef4444' :
              saveStatus === 'saving' ? '#f59e0b' : '#10b981',
            animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{
            fontSize: compact ? '11px' : '12px',
            color: compact ? '#cbd5e1' : '#64748b',
            fontWeight: '500',
          }}>
            {saveStatus === 'saving' ? 'Salvando...' :
              saveStatus === 'error' ? 'Erro ao salvar' :
                'Dados sincronizados'}
          </span>
        </div>

        {!compact && (
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            Último salvamento: <strong>{formatDate(lastSaved)}</strong>
          </p>
        )}
      </div>

      {/* BOTÃO DE BACKUP - usando o componente interno */}
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <CreateBackupButton
          compact={compact}
          onSuccess={(result) => {
            console.log('✅ Backup criado:', result);
            loadBackups();
          }}
          onError={(error) => {
            console.error('❌ Erro:', error);
          }}
          label={compact ? '📥 Backup' : '📥 Criar Backup Manual'}
          showPath={!compact}
        />
        
        {!compact && (
          <button
            onClick={handleImportLocal}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
            title="Carregar um arquivo .json do seu computador"
          >
            {loading ? '⏳' : '📂 Importar JSON'}
          </button>
        )}
      </div>

      {/* Lista de backups */}
      {backups.length > 0 && !compact && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
            Backups Recentes no Servidor:
          </h4>
          <ul style={styles.backupList}>
            {backups.slice(0, 5).map((backup, index) => (
              <li key={index} style={{...styles.backupItem, display: 'flex', flexDirection: 'column', gap: '4px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#334155' }}>
                    {backup.nome.replace('backup-', '').replace('.json', '')}
                  </span>
                  <button 
                    onClick={() => handleRestore(backup.nome)}
                    disabled={loading}
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                    title="Restaurar este backup"
                  >
                    Restaurar
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                  <span>{formatFileDate(backup.dataModificacao)}</span>
                  <span>{(backup.tamanho / 1024).toFixed(1)} KB</span>
                </div>
              </li>
            ))}
          </ul>
          {backups.length > 5 && (
            <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
              +{backups.length - 5} backups anteriores
            </p>
          )}
        </div>
      )}

      {compact && backups.length > 0 && (
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
          {backups.length} backup{backups.length !== 1 ? 's' : ''} disponível{backups.length !== 1 ? 'is' : ''}
        </div>
      )}
    </div>
  );
};

const styles = {
  normalContainer: {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  normalTitle: {
    marginBottom: '1rem',
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: '600',
  },
  normalStatus: {
    marginBottom: '1rem',
  },
  compactContainer: {
    padding: '0.5rem',
  },
  compactTitle: {
    marginBottom: '0.5rem',
    color: '#e2e8f0',
    fontSize: '13px',
    fontWeight: '600',
  },
  compactStatus: {
    marginBottom: '0.5rem',
  },
  backupList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  backupItem: {
    padding: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '4px',
    marginBottom: '0.375rem',
    border: '1px solid #e2e8f0',
  },
};

if (!document.querySelector('style[data-pulse-animation]')) {
  const pulseStyle = document.createElement('style');
  pulseStyle.setAttribute('data-pulse-animation', 'true');
  pulseStyle.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(pulseStyle);
}

export default BackupManager;