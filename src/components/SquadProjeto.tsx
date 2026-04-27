import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

const SquadProjeto: React.FC = () => {
    const {
        empresaAtualObj,
        projetoAtualObj,
        adicionarMembroSquad,
        removerMembroSquad
    } = useFunctionContext();

    const [formData, setFormData] = useState({
        funcionarioId: '',
        dedicacao: 100
    });

    if (!empresaAtualObj) {
        return (
            <div style={styles.container}>
                <div style={styles.notSelected}>
                    <span className="material-symbols-outlined" style={styles.notSelectedIcon}>business_off</span>
                    <h3>Nenhuma empresa selecionada</h3>
                    <p>Selecione uma empresa primeiro.</p>
                </div>
            </div>
        );
    }

    if (!projetoAtualObj) {
        return (
            <div style={styles.container}>
                <div style={styles.notSelected}>
                    <span className="material-symbols-outlined" style={styles.notSelectedIcon}>folder_off</span>
                    <h3>Nenhum projeto selecionado</h3>
                    <p>Selecione um projeto para gerenciar o squad.</p>
                </div>
            </div>
        );
    }

    const squadAtual = projetoAtualObj.squad || [];
    const funcionariosEmpresa = empresaAtualObj.funcionarios || [];
    const cargosEmpresa = empresaAtualObj.cargos || [];

    // Filtrar funcionários que já estão no squad
    const funcionariosDisponiveis = funcionariosEmpresa.filter(
        f => !squadAtual.some(sq => sq.funcionarioId === f.id)
    );

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.funcionarioId) return alert('Selecione um funcionário.');

        adicionarMembroSquad(empresaAtualObj.id, projetoAtualObj.id, {
            funcionarioId: formData.funcionarioId,
            dedicacao: Number(formData.dedicacao) || 100
        });

        setFormData({ funcionarioId: '', dedicacao: 100 });
    };

    const handleRemoveMember = (squadId: string) => {
        if (window.confirm('Remover este membro do squad?')) {
            removerMembroSquad(empresaAtualObj.id, projetoAtualObj.id, squadId);
        }
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        <span className="material-symbols-outlined" style={styles.titleIcon}>groups</span>
                        Squad do Projeto
                    </h2>
                    <p style={styles.subtitle}>
                        Gerenciando o time alocado no projeto <strong style={{ color: '#1246e2' }}>{projetoAtualObj.nome}</strong>
                    </p>
                </div>
            </div>

            <div style={styles.contentArea}>
                {/* FORMULÁRIO DE INCLUSÃO */}
                <div style={styles.formSection}>
                    <h3 style={styles.sectionTitle}>Alocar Novo Membro</h3>
                    <form onSubmit={handleAddMember} style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Funcionário</label>
                            <select
                                style={styles.input}
                                value={formData.funcionarioId}
                                onChange={(e) => setFormData({ ...formData, funcionarioId: e.target.value })}
                                required
                            >
                                <option value="">-- Selecione o colaborador --</option>
                                {funcionariosDisponiveis.map(f => {
                                    const cargo = cargosEmpresa.find(c => c.id === f.cargoId);
                                    return (
                                        <option key={f.id} value={f.id}>
                                            {f.nome} ({cargo ? cargo.titulo : 'Sem cargo'})
                                        </option>
                                    );
                                })}
                            </select>
                            {funcionariosDisponiveis.length === 0 && (
                                <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
                                    Todos os funcionários já estão no projeto ou não há funcionários cadastrados.
                                </span>
                            )}
                        </div>

                        <div style={styles.formGroupDate}>
                            <label style={styles.label}>Dedicação (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                style={styles.input}
                                value={formData.dedicacao}
                                onChange={(e) => setFormData({ ...formData, dedicacao: Number(e.target.value) })}
                                required
                            />
                        </div>

                        <div style={styles.formActionRight}>
                            <button
                                type="submit"
                                style={styles.btnPrimary}
                                disabled={funcionariosDisponiveis.length === 0}
                            >
                                <span className="material-symbols-outlined">person_add</span>
                                Adicionar ao Squad
                            </button>
                        </div>
                    </form>
                </div>

                {/* LISTAGEM DO TIME ALOCADO */}
                <div style={styles.listSection}>
                    <div style={styles.listHeader}>
                        <h3 style={styles.sectionTitle}>Membros Alocados ({squadAtual.length})</h3>
                    </div>

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Funcionário</th>
                                <th style={styles.th}>Cargo no Sistema</th>
                                <th style={styles.th}>Dedicação</th>
                                <th style={styles.th}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {squadAtual.map(sq => {
                                const func = funcionariosEmpresa.find(f => f.id === sq.funcionarioId);
                                const cargo = func ? cargosEmpresa.find(c => c.id === func.cargoId) : null;

                                return (
                                    <tr key={sq.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={styles.avatarMini}>{func ? func.nome.charAt(0).toUpperCase() : '?'}</div>
                                                <span style={{ fontWeight: '500' }}>{func ? func.nome : 'Funcionario Removido'}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {cargo ? (
                                                <span style={styles.badgeCargo}>{cargo.titulo}</span>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Não definido</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={sq.dedicacao === 100 ? styles.badgeCustom : styles.badgeMuted}>
                                                {sq.dedicacao}%
                                            </span>
                                        </td>
                                        <td style={styles.tdActions}>
                                            <button onClick={() => handleRemoveMember(sq.id)} style={styles.actionBtnDelete} title="Remover do projeto">
                                                <span className="material-symbols-outlined">person_remove</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                             {squadAtual.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={styles.emptyState}>Nenhum membro alocado neste projeto.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SquadProjeto;

// ESTILOS IGUAIS AOS DO FUNCIONARIOS MODULE
const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
    },
    notSelected: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    notSelectedIcon: {
        fontSize: '64px',
        color: '#cbd5e1',
        marginBottom: '1rem',
    },
    header: {
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#0f172a',
        fontSize: '1.875rem',
        fontWeight: 'bold',
        margin: '0 0 0.5rem 0',
    },
    titleIcon: {
        color: '#1246e2',
        fontSize: '32px',
    },
    subtitle: {
        color: '#64748b',
        fontSize: '1rem',
        margin: 0,
    },
    contentArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    formSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    listSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    listHeader: {
        marginBottom: '1.5rem',
    },
    sectionTitle: {
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        color: '#0f172a',
        fontWeight: '600',
    },
    formRow: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
    },
    formGroup: {
        flex: '2',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    formGroupDate: {
        flex: '1',
        minWidth: '150px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    formActionRight: {
        display: 'flex',
        alignItems: 'flex-end',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#0f172a',
        backgroundColor: '#fff',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    btnPrimary: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '42px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#475569',
        borderBottom: '2px solid #e2e8f0',
        backgroundColor: '#f8fafc',
    },
    tr: {
        borderBottom: '1px solid #e2e8f0',
    },
    td: {
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#0f172a',
        verticalAlign: 'middle',
    },
    tdActions: {
        padding: '1rem',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    actionBtnDelete: {
        padding: '6px',
        border: 'none',
        background: '#fef2f2',
        color: '#ef4444',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeCustom: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    badgeMuted: {
        backgroundColor: '#fffbeb',
        color: '#b45309',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    badgeCargo: {
        backgroundColor: '#e0e7ff',
        color: '#3730a3',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: '1px solid #c7d2fe',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#64748b',
        fontStyle: 'italic',
    },
    avatarMini: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#1246e2',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
    }
};
