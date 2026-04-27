import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

const FuncionariosModule = () => {
    const {
        empresaAtualObj,
        adicionarCargo,
        atualizarCargo,
        removerCargo,
        adicionarFuncionario,
        atualizarFuncionario,
        removerFuncionario
    } = useFunctionContext();

    const [activeTab, setActiveTab] = useState('funcionarios'); // 'funcionarios' | 'cargos'

    // --- Estados do CRUD de CARGOS ---
    const [cargoFormData, setCargoFormData] = useState({ id: '', titulo: '', fatorPF: '' });
    const [isEditingCargo, setIsEditingCargo] = useState(false);

    // --- Estados do CRUD de FUNCIONÁRIOS ---
    const [funcFormData, setFuncFormData] = useState({ id: '', nome: '', cargoId: '', fatorIndividualPF: '' });
    const [isEditingFunc, setIsEditingFunc] = useState(false);

    if (!empresaAtualObj) {
        return (
            <div style={styles.container}>
                <div style={styles.notSelected}>
                    <span className="material-symbols-outlined" style={styles.notSelectedIcon}>business_off</span>
                    <h3>Nenhuma empresa selecionada</h3>
                    <p>Selecione uma empresa para gerenciar sua equipe e cargos.</p>
                </div>
            </div>
        );
    }

    const cargos = empresaAtualObj.cargos || [];
    const funcionarios = empresaAtualObj.funcionarios || [];

    // ====================
    // CRUD CARGOS
    // ====================
    const handleSaveCargo = (e) => {
        e.preventDefault();
        if (!cargoFormData.titulo.trim()) return alert('O título do cargo é obrigatório');

        if (isEditingCargo) {
            atualizarCargo(empresaAtualObj.id, cargoFormData.id, {
                titulo: cargoFormData.titulo.trim(),
                fatorPF: parseFloat(cargoFormData.fatorPF) || 0
            });
        } else {
            adicionarCargo(empresaAtualObj.id, {
                titulo: cargoFormData.titulo.trim(),
                fatorPF: parseFloat(cargoFormData.fatorPF) || 0
            });
        }

        setCargoFormData({ id: '', titulo: '', fatorPF: '' });
        setIsEditingCargo(false);
    };

    const handleEditCargo = (cargo) => {
        setCargoFormData({ ...cargo });
        setIsEditingCargo(true);
    };

    const handleDeleteCargo = (id) => {
        if (funcionarios.some(f => f.cargoId === id)) {
            return alert('Não é possível excluir este cargo pois existem funcionários vinculados a ele.');
        }
        if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
            removerCargo(empresaAtualObj.id, id);
        }
    };

    const cancelEditCargo = () => {
        setCargoFormData({ id: '', titulo: '', fatorPF: '' });
        setIsEditingCargo(false);
    };

    // ====================
    // CRUD FUNCIONÁRIOS
    // ====================
    const handleSaveFunc = (e) => {
        e.preventDefault();
        if (!funcFormData.nome.trim()) return alert('O nome do funcionário é obrigatório');
        if (!funcFormData.cargoId) return alert('Selecione um cargo');

        if (isEditingFunc) {
            atualizarFuncionario(empresaAtualObj.id, funcFormData.id, {
                nome: funcFormData.nome.trim(),
                cargoId: funcFormData.cargoId,
                fatorIndividualPF: parseFloat(funcFormData.fatorIndividualPF) || 0
            });
        } else {
            adicionarFuncionario(empresaAtualObj.id, {
                nome: funcFormData.nome.trim(),
                cargoId: funcFormData.cargoId,
                fatorIndividualPF: parseFloat(funcFormData.fatorIndividualPF) || 0
            });
        }

        setFuncFormData({ id: '', nome: '', cargoId: '', fatorIndividualPF: '' });
        setIsEditingFunc(false);
    };

    const handleEditFunc = (func) => {
        setFuncFormData({ ...func });
        setIsEditingFunc(true);
    };

    const handleDeleteFunc = (id) => {
        if (window.confirm('Tem certeza que deseja remover este funcionário?')) {
            removerFuncionario(empresaAtualObj.id, id);
        }
    };

    const cancelEditFunc = () => {
        setFuncFormData({ id: '', nome: '', cargoId: '', fatorIndividualPF: '' });
        setIsEditingFunc(false);
    };

    return (
        <div style={styles.container}>
            {/* HEADER PRINCIPAL */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        <span className="material-symbols-outlined" style={styles.titleIcon}>badge</span>
                        Gestão de Equipe
                    </h2>
                    <p style={styles.subtitle}>Gerencie os funcionários e cargos da empresa <strong style={{ color: '#1246e2' }}>{empresaAtualObj.nome}</strong></p>
                </div>
            </div>

            {/* TABS */}
            <div style={styles.tabsContainer}>
                <button
                    style={activeTab === 'funcionarios' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('funcionarios')}
                >
                    <span className="material-symbols-outlined">groups</span>
                    Funcionários
                </button>
                <button
                    style={activeTab === 'cargos' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('cargos')}
                >
                    <span className="material-symbols-outlined">work</span>
                    Cargos do Sistema
                </button>
            </div>

            {/* CONTENT */}
            <div style={styles.contentArea}>
                {activeTab === 'cargos' && (
                    <div style={styles.moduleWrapper}>
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>{isEditingCargo ? 'Editar Cargo' : 'Novo Cargo'}</h3>
                            <form onSubmit={handleSaveCargo} style={styles.form}>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Título do Cargo</label>
                                        <input
                                            style={styles.input}
                                            value={cargoFormData.titulo}
                                            onChange={e => setCargoFormData({ ...cargoFormData, titulo: e.target.value })}
                                            placeholder="Ex: Desenvolvedor Senior"
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Fator de Produtividade (h/PF)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            style={styles.input}
                                            value={cargoFormData.fatorPF}
                                            onChange={e => setCargoFormData({ ...cargoFormData, fatorPF: e.target.value })}
                                            placeholder={`Dêixe 0 ou vazio para usar HCPP da empresa (${empresaAtualObj.hcpp} h/PF)`}
                                        />
                                    </div>
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" style={styles.btnPrimary}>
                                        {isEditingCargo ? 'Salvar Alterações' : 'Adicionar Cargo'}
                                    </button>
                                    {isEditingCargo && (
                                        <button type="button" onClick={cancelEditCargo} style={styles.btnSecondary}>Cancelar</button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div style={styles.listSection}>
                            <h3 style={styles.sectionTitle}>Lista de Cargos ({cargos.length})</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Título</th>
                                        <th style={styles.th}>Fator PF (H/PF)</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargos.map(cargo => (
                                        <tr key={cargo.id} style={styles.tr}>
                                            <td style={styles.td}>{cargo.titulo}</td>
                                            <td style={styles.td}>
                                                {cargo.fatorPF > 0 ? (
                                                    <span style={styles.badgeCustom}>{cargo.fatorPF} h/PF</span>
                                                ) : (
                                                    <span style={styles.badgeMuted}>Padrão ({empresaAtualObj.hcpp} h/PF)</span>
                                                )}
                                            </td>
                                            <td style={styles.tdActions}>
                                                <button onClick={() => handleEditCargo(cargo)} style={styles.actionBtnEdit} title="Editar">
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteCargo(cargo.id)} style={styles.actionBtnDelete} title="Excluir">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cargos.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={styles.emptyState}>Nenhum cargo cadastrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'funcionarios' && (
                    <div style={styles.moduleWrapper}>
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>{isEditingFunc ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
                            <form onSubmit={handleSaveFunc} style={styles.form}>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Nome Completo</label>
                                        <input
                                            style={styles.input}
                                            value={funcFormData.nome}
                                            onChange={e => setFuncFormData({ ...funcFormData, nome: e.target.value })}
                                            placeholder="Nome do colaborador"
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Cargo</label>
                                        <select
                                            style={styles.input}
                                            value={funcFormData.cargoId}
                                            onChange={e => setFuncFormData({ ...funcFormData, cargoId: e.target.value })}
                                            required
                                        >
                                            <option value="">Selecione um cargo</option>
                                            {cargos.map(c => (
                                                <option key={c.id} value={c.id}>{c.titulo} {c.fatorPF > 0 ? `(${c.fatorPF} h/PF)` : `(${empresaAtualObj.hcpp} h/PF - Padrão)`}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Fator Individual <span style={{ fontSize: '0.7em', color: '#64748b' }}>(Sobrescreve cargo)</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            style={styles.input}
                                            value={funcFormData.fatorIndividualPF}
                                            onChange={e => setFuncFormData({ ...funcFormData, fatorIndividualPF: e.target.value })}
                                            placeholder="Deixe em branco para usar o do Cargo"
                                        />
                                    </div>
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" style={styles.btnPrimary}>
                                        {isEditingFunc ? 'Salvar Alterações' : 'Adicionar Funcionário'}
                                    </button>
                                    {isEditingFunc && (
                                        <button type="button" onClick={cancelEditFunc} style={styles.btnSecondary}>Cancelar</button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div style={styles.listSection}>
                            <h3 style={styles.sectionTitle}>Equipe da Empresa ({funcionarios.length})</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Nome</th>
                                        <th style={styles.th}>Cargo</th>
                                        <th style={styles.th}>Produtividade Aplicada</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.map(func => {
                                        const cargoAssociated = cargos.find(c => c.id === func.cargoId);
                                        const cargoNome = cargoAssociated ? cargoAssociated.titulo : 'Cargo não encontrado';

                                        // Resolvendo o Fator
                                        let fatorAplicado = empresaAtualObj.hcpp;
                                        let fatorInfo = 'Padrão da Empresa';

                                        if (func.fatorIndividualPF > 0) {
                                            fatorAplicado = func.fatorIndividualPF;
                                            fatorInfo = 'Fator Individual';
                                        } else if (cargoAssociated && cargoAssociated.fatorPF > 0) {
                                            fatorAplicado = cargoAssociated.fatorPF;
                                            fatorInfo = 'Fator do Cargo';
                                        }

                                        return (
                                            <tr key={func.id} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={styles.avatarMini}>{func.nome.charAt(0).toUpperCase()}</div>
                                                        <span style={{ fontWeight: '500' }}>{func.nome}</span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.badgeCargo}>{cargoNome}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div><strong>{fatorAplicado} h/PF</strong></div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fatorInfo}</div>
                                                </td>
                                                <td style={styles.tdActions}>
                                                    <button onClick={() => handleEditFunc(func)} style={styles.actionBtnEdit} title="Editar">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteFunc(func.id)} style={styles.actionBtnDelete} title="Excluir">
                                                        <span className="material-symbols-outlined">person_remove</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {funcionarios.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={styles.emptyState}>Nenhum funcionário cadastrado no time.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FuncionariosModule;

// ESTILOS
const styles = {
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
    tabsContainer: {
        display: 'flex',
        gap: '4px',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    tabActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid #1246e2',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1246e2',
        cursor: 'pointer',
    },
    contentArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    moduleWrapper: {
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
    sectionTitle: {
        margin: '0 0 1.5rem 0',
        fontSize: '1.25rem',
        color: '#0f172a',
        fontWeight: '600',
    },
    formRow: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    formGroup: {
        flex: '1',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '1rem',
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
    formActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
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
    },
    btnSecondary: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
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
    actionBtnEdit: {
        padding: '6px',
        border: 'none',
        background: '#eff6ff',
        color: '#1246e2',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '500',
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
