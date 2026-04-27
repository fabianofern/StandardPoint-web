import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

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

export default CreateBackupButton;