import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

interface Empresa {
    id: string;
    nome: string;
    [key: string]: any;
}

interface EmpresaListProps {
    onNavigate: (page: string, params?: any) => void;
}

const EmpresaList: React.FC<EmpresaListProps> = ({ onNavigate }) => {
  const { 
    empresas, 
    empresaAtual, // ✅ AGORA É ID, não índice
    empresaAtualObj, 
    selecionarEmpresa, // ✅ AGORA ACEITA ID ou null
    removerEmpresa 
  } = useFunctionContext();
  
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Calcular estatísticas
  const estatisticas = {
    totalEmpresas: empresas.length,
    empresasComProjetos: empresas.filter(e => e.projetos && e.projetos.length > 0).length,
    totalProjetos: empresas.reduce((acc, e) => acc + (e.projetos?.length || 0), 0),
    totalFuncoes: empresas.reduce((acc, e) => 
      acc + (e.projetos?.reduce((projAcc, p) => 
        projAcc + (p.funcoes?.length || 0) + 
        (p.crs?.reduce((crAcc, cr) => 
          crAcc + (cr.funcoes?.length || 0), 0) || 0), 0) || 0), 0)
  };

  // ✅ CORRIGIDO: Handle selecionar empresa usando ID
  const handleSelecionarEmpresa = async (empresaId: string) => {
    console.log('🎯 [EmpresaList] Selecionando empresa ID:', empresaId);
    
    try {
      setIsNavigating(true);
      
      // 1. Selecionar empresa no contexto (passando ID)
      selecionarEmpresa(empresaId);
      console.log(`🎯 [EmpresaList] Empresa selecionada com ID: ${empresaId}`);
      
      // 2. Pequeno delay para garantir atualização do contexto
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 3. Navegar para dashboard usando callback
      if (onNavigate) {
        console.log('🎯 [EmpresaList] Navegando para dashboard via callback');
        onNavigate('dashboard');
      } else {
        // Fallback para hash direto
        console.log('🎯 [EmpresaList] Navegando para dashboard via hash');
        window.location.hash = '#dashboard';
      }
      
    } catch (error) {
      console.error('❌ [EmpresaList] Erro ao selecionar empresa:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  // ✅ CORRIGIDO: Handle excluir empresa
  const handleExcluirEmpresa = (empresa: Empresa) => {
    console.log('🗑️ [EmpresaList] Preparando para excluir empresa:', empresa.nome);
    setEmpresaParaExcluir(empresa);
    setShowDeleteConfirm(true);
  };

  const confirmarExclusao = async () => {
    if (!empresaParaExcluir) return;
    
    console.log('🗑️ [EmpresaList] Confirmando exclusão da empresa:', empresaParaExcluir.nome);
    
    try {
      // Remover empresa (usa ID)
      removerEmpresa(empresaParaExcluir.id);
      
      // Fechar modal
      setShowDeleteConfirm(false);
      setEmpresaParaExcluir(null);
      
      console.log('✅ [EmpresaList] Empresa excluída com sucesso');
      
    } catch (error) {
      console.error('❌ [EmpresaList] Erro ao excluir empresa:', error);
    }
  };

  // ✅ CORRIGIDO: Handle criar nova empresa
  const handleCriarNovaEmpresa = () => {
    console.log('➕ [EmpresaList] Criando nova empresa...');
    
    // Desselecionar empresa atual se houver
    if (empresaAtual) {
      selecionarEmpresa(null);
    }
    
    if (onNavigate) {
      console.log('🎯 [EmpresaList] Navegando para criação via callback');
      onNavigate('empresa', { mode: 'new' });
    } else {
      // Fallback para hash direto
      console.log('🎯 [EmpresaList] Navegando para criação via hash');
      window.location.hash = '#empresa?new=true';
    }
  };

  // ✅ CORRIGIDO: Handle configurar empresa
  const handleConfigurarEmpresa = async (empresaId: string) => {
    console.log('⚙️ [EmpresaList] Configurando empresa ID:', empresaId);
    
    try {
      setIsNavigating(true);
      
      // Selecionar empresa primeiro (passando ID)
      selecionarEmpresa(empresaId);
      console.log(`🎯 [EmpresaList] Empresa selecionada para configuração: ID ${empresaId}`);
      
      // Pequeno delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navegar para configurações
      if (onNavigate) {
        console.log('🎯 [EmpresaList] Navegando para configurações via callback');
        onNavigate('empresa');
      } else {
        console.log('🎯 [EmpresaList] Navegando para configurações via hash');
        window.location.hash = '#empresa';
      }
      
    } catch (error) {
      console.error('❌ [EmpresaList] Erro ao configurar empresa:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  // Verificar se empresa está selecionada (por ID)
  const isEmpresaAtiva = (empresaId: string) => {
    return empresaAtual === empresaId;
  };

  // Estilos (mantidos iguais)
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    header: {
      marginBottom: '2rem',
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1246e2',
      margin: '0 0 0.5rem 0',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#64748b',
      margin: 0,
    },
    section: {
      marginBottom: '2rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#374151',
      margin: 0,
    },
    sectionIcon: {
      color: '#1246e2',
      fontSize: '20px',
    },
    newButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    },
    newButtonHover: {
      backgroundColor: '#0da271',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    },
    newButtonLoading: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    loadingIndicator: {
      position: 'absolute',
      right: '12px',
      display: 'flex',
      alignItems: 'center',
    },
    empresasGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    empresaCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      opacity: isNavigating ? 0.7 : 1,
    },
    empresaCardHover: {
      borderColor: '#1246e2',
      boxShadow: '0 4px 12px rgba(18, 70, 226, 0.1)',
      transform: 'translateY(-2px)',
    },
    empresaCardActive: {
      borderColor: '#1246e2',
      backgroundColor: '#eff6ff',
      borderWidth: '2px',
    },
    empresaCardLoading: {
      cursor: 'wait',
      opacity: 0.7,
    },
    empresaHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1rem',
    },
    empresaAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      backgroundColor: '#1246e2',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '18px',
      flexShrink: 0,
    },
    empresaInfo: {
      flex: 1,
      minWidth: 0,
    },
    empresaNome: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 0.25rem 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    empresaStatus: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#10b981',
      backgroundColor: '#d1fae5',
      padding: '2px 8px',
      borderRadius: '10px',
      display: 'inline-block',
    },
    empresaStatusInativa: {
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
    },
    empresaDetails: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0 0 0.25rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    empresaActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f1f5f9',
    },
    actionButton: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      color: '#374151',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
    },
    actionButtonHover: {
      backgroundColor: '#f1f5f9',
      borderColor: '#cbd5e1',
    },
    actionButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    deleteButton: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fecaca',
    },
    deleteButtonHover: {
      backgroundColor: '#fee2e2',
      borderColor: '#fca5a5',
    },
    configButton: {
      backgroundColor: '#eff6ff',
      color: '#1246e2',
      borderColor: '#dbeafe',
    },
    configButtonHover: {
      backgroundColor: '#dbeafe',
      borderColor: '#bfdbfe',
    },
    emptyState: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    emptyIcon: {
      fontSize: '48px',
      color: '#cbd5e1',
      marginBottom: '1rem',
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 0.5rem 0',
    },
    emptyText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0 0 1.5rem 0',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#dc2626',
      margin: '0 0 1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    modalMessage: {
      color: '#4b5563',
      fontSize: '0.875rem',
      margin: '0 0 1.5rem 0',
      lineHeight: 1.5,
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    modalCancelButton: {
      padding: '0.625rem 1.25rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    modalConfirmButton: {
      padding: '0.625rem 1.25rem',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span className="material-symbols-outlined" style={styles.titleIcon}>
            apartment
          </span>
          Minhas Empresas
        </h1>
        <p style={styles.subtitle}>
          Gerencie todas as empresas cadastradas no sistema
        </p>
      </div>

      {/* Estatísticas */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.statCard)}
        >
          <h3 style={styles.statValue}>{estatisticas.totalEmpresas}</h3>
          <p style={styles.statLabel}>Empresas Cadastradas</p>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.statCard)}
        >
          <h3 style={styles.statValue}>{estatisticas.empresasComProjetos}</h3>
          <p style={styles.statLabel}>Com Projetos Ativos</p>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.statCard)}
        >
          <h3 style={styles.statValue}>{estatisticas.totalProjetos}</h3>
          <p style={styles.statLabel}>Projetos no Total</p>
        </div>
        
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.statCard)}
        >
          <h3 style={styles.statValue}>{estatisticas.totalFuncoes}</h3>
          <p style={styles.statLabel}>Funções Cadastradas</p>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <span className="material-symbols-outlined" style={styles.sectionIcon}>
              apartment
            </span>
            Todas as Empresas
          </h2>
          
          <button
            style={{
              ...styles.newButton,
              ...(isNavigating && styles.newButtonLoading)
            }}
            onMouseEnter={(e) => !isNavigating && Object.assign(e.currentTarget.style, styles.newButtonHover)}
            onMouseLeave={(e) => {
              if (!isNavigating) {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            onClick={handleCriarNovaEmpresa}
            disabled={isNavigating}
          >
            <span className="material-symbols-outlined">add</span>
            Nova Empresa
            {isNavigating && (
              <span style={styles.loadingIndicator}>
                <span className="material-symbols-outlined" style={{ 
                  fontSize: '16px',
                  animation: 'spin 1s linear infinite'
                }}>
                  sync
                </span>
              </span>
            )}
          </button>
        </div>

        {empresas.length === 0 ? (
          <div style={styles.emptyState}>
            <span className="material-symbols-outlined" style={styles.emptyIcon}>
              business
            </span>
            <h3 style={styles.emptyTitle}>Nenhuma empresa cadastrada</h3>
            <p style={styles.emptyText}>
              Você ainda não cadastrou nenhuma empresa. Clique em "Nova Empresa" 
              para começar a usar o sistema.
            </p>
            <button
              style={styles.newButton}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.newButtonHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={handleCriarNovaEmpresa}
            >
              <span className="material-symbols-outlined">add</span>
              Criar Primeira Empresa
            </button>
          </div>
        ) : (
          <div style={styles.empresasGrid}>
            {empresas.map((empresa) => {
              const isAtiva = isEmpresaAtiva(empresa.id);
              const projetosCount = empresa.projetos?.length || 0;
              const crsCount = empresa.projetos?.reduce((acc, p) => acc + (p.crs?.length || 0), 0) || 0;
              const funcoesCount = empresa.projetos?.reduce((acc, p) => 
                acc + (p.funcoes?.length || 0) + // ✅ FUNÇÕES DIRETAS DO PROJETO
                p.crs?.reduce((crAcc, cr) => crAcc + (cr.funcoes?.length || 0), 0), 0) || 0;
              
              return (
                <div
                  key={empresa.id}
                  style={{
                    ...styles.empresaCard,
                    ...(isAtiva && styles.empresaCardActive),
                    ...(isNavigating && styles.empresaCardLoading)
                  }}
                  onMouseEnter={(e) => !isAtiva && !isNavigating && Object.assign(e.currentTarget.style, styles.empresaCardHover)}
                  onMouseLeave={(e) => {
                    if (!isAtiva && !isNavigating) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                  onClick={() => !isNavigating && handleSelecionarEmpresa(empresa.id)}
                >
                  <div style={styles.empresaHeader}>
                    <div style={styles.empresaAvatar}>
                      {empresa.nome?.substring(0, 2).toUpperCase() || 'ME'}
                    </div>
                    
                    <div style={styles.empresaInfo}>
                      <h3 style={styles.empresaNome} title={empresa.nome}>
                        {empresa.nome}
                      </h3>
                      <span style={{
                        ...styles.empresaStatus,
                        ...(!isAtiva && styles.empresaStatusInativa)
                      }}>
                        {isAtiva ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.empresaDetails}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      attach_money
                    </span>
                    <span>PF: R$ {empresa.valorPF?.toFixed(2)} • HCPP: {empresa.hcpp}h</span>
                  </div>

                  <div style={styles.empresaDetails}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      folder
                    </span>
                    <span>{projetosCount} projeto(s) • {crsCount} CR(s) • {funcoesCount} função(ões)</span>
                  </div>

                  <div style={styles.empresaActions}>
                    <button
                      style={{
                        ...styles.configButton,
                        ...(isNavigating && styles.actionButtonDisabled)
                      }}
                      onMouseEnter={(e) => !isNavigating && Object.assign(e.currentTarget.style, styles.configButtonHover)}
                      onMouseLeave={(e) => {
                        if (!isNavigating) {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.borderColor = '#dbeafe';
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isNavigating) {
                          handleConfigurarEmpresa(empresa.id);
                        }
                      }}
                      disabled={isNavigating}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        settings
                      </span>
                      Configurar
                    </button>
                    
                    <button
                      style={{
                        ...styles.deleteButton,
                        ...((isAtiva || isNavigating) && styles.actionButtonDisabled)
                      }}
                      onMouseEnter={(e) => !isAtiva && !isNavigating && Object.assign(e.currentTarget.style, styles.deleteButtonHover)}
                      onMouseLeave={(e) => {
                        if (!isAtiva && !isNavigating) {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAtiva && !isNavigating) {
                          handleExcluirEmpresa(empresa);
                        }
                      }}
                      disabled={isAtiva || isNavigating}
                      title={isAtiva ? "Não é possível excluir a empresa ativa" : ""}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        delete
                      </span>
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && empresaParaExcluir && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              <span className="material-symbols-outlined">warning</span>
              Excluir Empresa
            </h3>
            <p style={styles.modalMessage}>
              Tem certeza que deseja excluir a empresa <strong>"{empresaParaExcluir.nome}"</strong>?
              <br /><br />
              Esta ação <strong>não pode ser desfeita</strong> e todos os dados relacionados
              (projetos, CRs e funções) serão permanentemente removidos.
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                style={styles.modalConfirmButton}
                onClick={confirmarExclusao}
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresaList;