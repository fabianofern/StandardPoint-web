import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

const DataCleaning = () => {
    const {
        empresas,
        removerEmpresa,
        removerProjeto,
        removeFunction,
        selecionarEmpresa,
        selecionarProjeto
    } = useFunctionContext();

    const [activeTab, setActiveTab] = useState('empresas');
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para modais de confirmação
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'empresa', 'projeto', 'funcao'

    // Confirmação de exclusão
    const confirmDelete = (item, type) => {
        setItemToDelete(item);
        setDeleteType(type);
    };

    const handleExecuteDelete = () => {
        if (!itemToDelete) return;

        if (deleteType === 'empresa') {
            removerEmpresa(itemToDelete.id);
        } else if (deleteType === 'projeto') {
            removerProjeto(itemToDelete.empresaId, itemToDelete.id);
        } else if (deleteType === 'funcao') {
            // ✅ AGORA SEGURO: Passamos os IDs explícitos, sem precisar mudar o contexto global
            removeFunction(itemToDelete.id, itemToDelete.empresaId, itemToDelete.projetoId);
        }

        setItemToDelete(null);
        setDeleteType(null);
    };

    // Preparar dados para exibição
    const getProjetosFlat = () => {
        return empresas.flatMap(emp =>
            (emp.projetos || []).map(proj => ({
                ...proj,
                empresaNome: emp.nome,
                empresaId: emp.id
            }))
        );
    };

    const getFuncoesFlat = () => {
        return empresas.flatMap(emp =>
            (emp.projetos || []).flatMap(proj =>
                (proj.funcoes || []).map(func => ({
                    ...func,
                    projetoNome: proj.nome,
                    projetoId: proj.id,
                    empresaNome: emp.nome,
                    empresaId: emp.id
                }))
            )
        );
    };

    // Filtragem
    const filteredEmpresas = empresas.filter(e =>
        e.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProjetos = getProjetosFlat().filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.empresaNome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFuncoes = getFuncoesFlat().filter(f =>
        f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.projetoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.empresaNome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>
                <span className="material-symbols-outlined" style={styles.icon}>
                    cleaning_services
                </span>
                Limpeza de Dados
            </h1>
            <p style={styles.subtitle}>
                Gerencie e remova dados obsoletos do sistema. Cuidado: As ações são irreversíveis.
            </p>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    style={activeTab === 'empresas' ? styles.tabActive : styles.tab}
                    onClick={() => { setActiveTab('empresas'); setSearchTerm(''); }}
                >
                    Empresas ({empresas.length})
                </button>
                <button
                    style={activeTab === 'projetos' ? styles.tabActive : styles.tab}
                    onClick={() => { setActiveTab('projetos'); setSearchTerm(''); }}
                >
                    Projetos ({getProjetosFlat().length})
                </button>
                <button
                    style={activeTab === 'funcoes' ? styles.tabActive : styles.tab}
                    onClick={() => { setActiveTab('funcoes'); setSearchTerm(''); }}
                >
                    Funcionalidades ({getFuncoesFlat().length})
                </button>
            </div>

            {/* Search */}
            <div style={styles.searchContainer}>
                <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
                <input
                    type="text"
                    placeholder={`Buscar ${activeTab}...`}
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content */}
            <div style={styles.content}>
                {activeTab === 'empresas' && (
                    <div style={styles.list}>
                        {filteredEmpresas.length === 0 ? (
                            <EmptyState message="Nenhuma empresa encontrada." />
                        ) : (
                            filteredEmpresas.map(emp => (
                                <div key={emp.id} style={styles.itemCard}>
                                    <div>
                                        <div style={styles.itemName}>{emp.nome}</div>
                                        <div style={styles.itemSub}>{emp.projetos?.length || 0} projetos</div>
                                    </div>
                                    <button
                                        style={styles.deleteButton}
                                        onClick={() => confirmDelete(emp, 'empresa')}
                                        title="Excluir Empresa"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'projetos' && (
                    <div style={styles.list}>
                        {filteredProjetos.length === 0 ? (
                            <EmptyState message="Nenhum projeto encontrado." />
                        ) : (
                            filteredProjetos.map(proj => (
                                <div key={proj.id} style={styles.itemCard}>
                                    <div>
                                        <div style={styles.itemName}>{proj.nome}</div>
                                        <div style={styles.itemSub}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'text-bottom' }}>apartment</span> {proj.empresaNome} • {proj.funcoes?.length || 0} funções
                                        </div>
                                    </div>
                                    <button
                                        style={styles.deleteButton}
                                        onClick={() => confirmDelete(proj, 'projeto')}
                                        title="Excluir Projeto"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'funcoes' && (
                    <div style={styles.list}>
                        {filteredFuncoes.length === 0 ? (
                            <EmptyState message="Nenhuma função encontrada." />
                        ) : (
                            filteredFuncoes.map(func => (
                                <div key={func.id} style={styles.itemCard}>
                                    <div>
                                        <div style={styles.itemName}>{func.nome}</div>
                                        <div style={styles.itemSub}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'text-bottom' }}>apartment</span> {func.empresaNome}
                                            <span style={{ margin: '0 4px' }}>›</span>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'text-bottom' }}>folder</span> {func.projetoNome}
                                            <span style={{ margin: '0 4px' }}>•</span>
                                            {func.tipo} • {func.pf} PF
                                        </div>
                                    </div>
                                    <button
                                        style={styles.deleteButton}
                                        onClick={() => confirmDelete(func, 'funcao')}
                                        title="Excluir Função"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {itemToDelete && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>Confirmar Exclusão</h3>
                        <p style={styles.modalText}>
                            Tem certeza que deseja excluir:
                            <br />
                            <strong>{itemToDelete.nome}</strong>?
                        </p>
                        {deleteType === 'empresa' && (
                            <p style={styles.warningText}>⚠️ Isso excluirá também TODOS os projetos e funções desta empresa.</p>
                        )}
                        {deleteType === 'projeto' && (
                            <p style={styles.warningText}>⚠️ Isso excluirá também TODAS as funções deste projeto.</p>
                        )}
                        <div style={styles.modalActions}>
                            <button style={styles.cancelButton} onClick={() => setItemToDelete(null)}>Cancelar</button>
                            <button style={styles.confirmButton} onClick={handleExecuteDelete}>Excluir Definitivamente</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem' }}>
            block
        </span>
        <p>{message}</p>
    </div>
);

const styles = {
    container: {
        padding: '1rem',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#0f172a',
        fontSize: '1.8rem',
        marginBottom: '0.5rem',
    },
    icon: {
        fontSize: '32px',
        color: '#ef4444',
    },
    subtitle: {
        color: '#64748b',
        marginBottom: '2rem',
    },
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    tab: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#64748b',
        cursor: 'pointer',
        fontWeight: '600',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
    },
    tabActive: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#1246e2',
        cursor: 'pointer',
        fontWeight: '600',
        borderBottom: '2px solid #1246e2',
    },
    searchContainer: {
        position: 'relative',
        marginBottom: '1.5rem',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94a3b8',
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        minHeight: '300px',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
    },
    itemCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #f1f5f9',
    },
    itemName: {
        fontWeight: '600',
        color: '#334155',
        marginBottom: '0.25rem',
    },
    itemSub: {
        fontSize: '0.8rem',
        color: '#94a3b8',
    },
    deleteButton: {
        border: 'none',
        backgroundColor: '#fee2e2',
        color: '#ef4444',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    },
    modalTitle: {
        marginTop: 0,
        color: '#0f172a',
        fontSize: '1.25rem',
    },
    modalText: {
        color: '#475569',
        lineHeight: 1.5,
    },
    warningText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: '0.9rem',
        marginTop: '1rem',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        border: '1px solid #cbd5e1',
        backgroundColor: 'white',
        color: '#475569',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    confirmButton: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        backgroundColor: '#ef4444',
        color: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default DataCleaning;
