import React, { useState, useEffect, useCallback } from 'react';
import { FunctionProvider, useFunctionContext } from './context/FunctionContext';
import ProtectedLayout from './components/ProtectedLayout';
import { useAuthStore } from './stores/authStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import NewEntryForm from './components/NewEntryForm';
import FunctionTable from './components/FunctionTable';
import BackupManager from './components/BackupManager';
import EmpresaConfig from './components/EmpresaConfig';
import EmpresaList from './components/EmpresaList';
import Projetos from './components/Projetos';
import SquadProjeto from './components/SquadProjeto';
import EstimativasProjeto from './components/EstimativasProjeto';
import FuncionariosModule from './components/FuncionariosModule';
import ValorAjusteContent from './components/ValorAjusteContent';


import Reports from './components/reports/Reports';

import DataCleaning from './components/DataCleaning';
import './styles/index.css';

// ====================== HOOK PARA ROTEAMENTO POR HASH ======================
const useHashRouter = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [params, setParams] = useState({});

  const parseHash = useCallback((hash) => {
    console.log('🔗 [Router] Parsing hash:', hash);

    if (!hash || hash === '#') {
      return { page: 'dashboard', params: {} };
    }

    // Remove o #
    const hashWithoutHash = hash.substring(1);

    // Separa página e query string
    const [pagePart, queryPart] = hashWithoutHash.split('?');

    const page = pagePart || '';

    // Parse query string
    const params = {};
    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value !== undefined) {
          params[key] = decodeURIComponent(value);
        }
      });
    }

    console.log('🔗 [Router] Resultado:', { page, params });
    return { page, params };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const { page, params } = parseHash(window.location.hash);
      setCurrentPage(page);
      setParams(params);
    };

    // Configurar listener
    window.addEventListener('hashchange', handleHashChange);

    // Processar hash inicial
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseHash]);

  const navigate = useCallback((page, params = {}) => {
    let hash = `#${page}`;

    if (Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      hash += `?${queryString}`;
    }

    console.log('🔗 [Router] Navegando para:', hash);
    window.location.hash = hash;
  }, []);

  return { currentPage, params, navigate, parseHash };
};

// ====================== COMPONENTE PRINCIPAL QUE USA CONTEXTO ======================
function AppContent() {
  const {
    empresaAtualObj,
    loading,
    empresas,
    projetoAtualObj,
    projetoAtual,
    saveVAF,
    adicionarEmpresa
  } = useFunctionContext();
  const { user: currentUser, isChecking: authLoading } = useAuthStore();
  const { currentPage, params, navigate } = useHashRouter();
  const [isCreatingNewEmpresa, setIsCreatingNewEmpresa] = useState(false);

  // Verificar se estamos criando nova empresa via URL
  useEffect(() => {
    console.log('🔗 [App] Hash mudou:', {
      currentPage,
      params,
      hash: window.location.hash
    });

    if (currentPage === 'empresa' && params.new === 'true') {
      console.log('🔗 [App] Modo criação de nova empresa detectado');
      setIsCreatingNewEmpresa(true);
    } else if (currentPage === 'empresa' && params.id) {
      console.log('🔗 [App] Configurando empresa existente:', params.id);
      setIsCreatingNewEmpresa(false);
    } else if (currentPage === 'empresa') {
      // Apenas #empresa sem parâmetros
      console.log('🔗 [App] Página empresa sem parâmetros');
      setIsCreatingNewEmpresa(false);
    }
  }, [currentPage, params]);

  // Redirecionamento automático
  useEffect(() => {
    // Se ainda está carregando autenticação ou dados da empresa, aguardar
    if (authLoading || loading) return;

    // Se não estiver logado, não faz redirecionamentos de negócio ainda (LoginScreen cuida disso)
    if (!currentUser) return;

    console.log('🔗 [App] Verificando redirecionamento...', {
      currentPage,
      hasEmpresa: !!empresaAtualObj,
      isCreatingNewEmpresa
    });

    // Se tentar acessar dashboard sem empresa selecionada
    if (currentPage === 'dashboard' && !empresaAtualObj && empresas.length > 0) {
      console.log('🔗 [App] Redirecionando para minhas-empresas (sem empresa selecionada)');
      navigate('minhas-empresas');
      return;
    }

    // Se tentar acessar configurações sem empresa e não está criando nova
    if (currentPage === 'empresa' && !empresaAtualObj && !isCreatingNewEmpresa) {
      console.log('🔗 [App] Redirecionando para minhas-empresas (acesso direto a config)');
      navigate('minhas-empresas');
      return;
    }

    // Se tentar acessar projetos sem empresa selecionada
    if (currentPage === 'projetos' && !empresaAtualObj) {
      console.log('🔗 [App] Redirecionando para minhas-empresas (acesso a projetos sem empresa)');
      navigate('minhas-empresas');
      return;
    }
  }, [currentPage, empresaAtualObj, loading, authLoading, currentUser, isCreatingNewEmpresa, empresas.length, navigate]);

  // 4. Lógica de Onboarding Automático - REMOVIDA PARA EVITAR DUPLICIDADE EM MÚLTIPLOS BROWSERS
  // Se o usuário desejar criar uma empresa, ele deve fazê-lo manualmente ou via importação.

  const handleNavigate = useCallback((page, navParams = {}) => {
    console.log('🔗 [App] Navegando manualmente para:', page, navParams);

    // Suporte a subrotas ou ações específicas se necessário
    if (page === 'nova-funcao') {
      // Opcional: Validar se tem empresa/projeto antes de navegar, mas o componente já faz isso
    }

    if (page === 'empresa' && navParams.mode === 'new') {
      navigate('empresa', { new: 'true' });
      return;
    }

    if (page === 'empresa' && navParams.id) {
      navigate('empresa', { id: navParams.id });
      return;
    }

    navigate(page, navParams);
  }, [navigate]);

  // ========== RENDERIZAÇÃO CONDICIONAL (DEPOIS DE TODOS OS HOOKS) ==========

  // 1. Loading Inicial de Autenticação
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        flexDirection: 'column',
        gap: '1rem',
        color: 'white'
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: '48px',
          color: '#3b82f6',
          animation: 'spin 1s linear infinite'
        }}>
          sync
        </span>
        <p style={{ color: '#94a3b8' }}>Inicializando segurança...</p>
      </div>
    );
  }

  // 2. Tela de Login / Bloqueio (Redirecionamento será feito via Axios Interceptors no ProtectedLayout)
  if (!currentUser) {
    return null;
  }

  // 3. Loading de Dados da Aplicação (Empresas, etc)
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f6f6f8',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: '48px',
          color: '#1246e2',
          animation: 'spin 1s linear infinite'
        }}>
          sync
        </span>
        <p style={{ color: '#64748b' }}>Carregando StandardPoint...</p>
      </div>
    );
  }

  // Removida a tela de bloqueio para empresas.length === 0
  // O componente DashboardContent já trata o caso de zero empresas exibindo as opções de criação.

  // Fluxo normal com empresa selecionada ou navegação para lista de empresas
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f6f6f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* ========== CORREÇÃO: CONTAINER PRINCIPAL SEM MARGIN ========== */}
      <div 
        className="main-app-container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease',
          marginLeft: '280px', // Apenas o conteúdo principal tem margin
          overflowX: 'hidden', // Evita scroll na janela toda
        }}
      >
        {/* Header agora faz parte do fluxo, não fixo */}
        <Header />

        <main style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          margin: '0 auto',
          width: '100%',
          maxWidth: '100%', // Muda para 100% para respeitar o viewport
          boxSizing: 'border-box'
        }}>

          {currentPage === 'dashboard' && <DashboardContent onNavigate={handleNavigate} />}
          {currentPage === 'minhas-empresas' && <MinhasEmpresasContent onNavigate={handleNavigate} />}
          {currentPage === 'empresa' && <EmpresaContent
            isCreatingNew={isCreatingNewEmpresa}
            empresaId={params.id}
            onNavigate={handleNavigate}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onBackToEmpresas={() => handleNavigate('minhas-empresas')}
          />}
          {currentPage === 'projetos' && <Projetos onNavigate={handleNavigate} />}
          {currentPage === 'nova-funcao' && <NovaFuncaoContent onNavigate={handleNavigate} />}
          {currentPage === 'valor-ajuste' && <ValorAjusteContent
            projeto={projetoAtualObj}
            onVAChange={(vafData) => saveVAF(projetoAtual, vafData)}
          />}
          {currentPage === 'limpeza-dados' && <DataCleaningContent />}
          {currentPage === 'backups' && <BackupsContent onNavigate={handleNavigate} />}
          {currentPage === 'relatorios' && <Reports />}
          {currentPage === 'funcionarios' && <FuncionariosModule />}
          {currentPage === 'projeto-squad' && <SquadProjeto />}
          {currentPage === 'projeto-estimativas' && <EstimativasProjeto />}

        </main>
      </div>
    </div>
  );
}

// ====================== COMPONENTES AUXILIARES ======================

// Componente para indicador de status
function StatusIndicator() {
  const { saveStatus } = useFunctionContext();

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return '#f59e0b';
      case 'saved': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Salvando...';
      case 'saved': return 'Salvo';
      case 'error': return 'Erro';
      default: return 'Sincronizado';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(),
        animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none',
      }} />
      <span style={{
        fontSize: '0.875rem',
        color: '#475569',
        fontWeight: '500',
      }}>
        {getStatusText()}
      </span>
    </div>
  );
}

// Footer da aplicação
function AppFooter() {
  return (
    <footer style={{
      marginTop: '3rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center',
      color: '#64748b',
      fontSize: '0.75rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <span style={{ fontWeight: '500' }}>StandardPoint v1.2</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <span>IFPUG 4.3.1 Compliant</span>
        </div>
        <div>
          <span style={{ opacity: 0.7 }}>Dados persistidos automaticamente</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} - Ferramenta de Métricas</span>
        </div>
      </div>
    </footer>
  );
}

// Conteúdo do Dashboard
function DashboardContent({ onNavigate }) {
  const {
    empresaAtualObj: empresaAtual,
    funcoes,
    totals
  } = useFunctionContext();

  if (!empresaAtual) {
    const { empresas, selecionarEmpresa } = useFunctionContext();
    const hasEmpresas = empresas.length > 0;

    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        maxWidth: '900px',
        margin: '2rem auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
        border: '1px solid #eef2f6',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          backgroundColor: '#eff6ff',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#1683c2' }}>
            space_dashboard
          </span>
        </div>

        <h2 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Bem-vindo ao Dashboard
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Para começar a gerenciar seus projetos e métricas, selecione uma organização abaixo ou crie uma nova.
        </p>

        {hasEmpresas && (
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              color: '#94a3b8',
              fontWeight: '700',
              letterSpacing: '1px',
              marginBottom: '1.5rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
              Continuar de onde parei
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              {empresas.slice(0, 3).map((emp, index) => (
                <button
                  key={emp.id}
                  onClick={() => selecionarEmpresa(emp.id)}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: index === 0 ? '#f0f9ff' : 'white',
                    border: index === 0 ? '2px solid #1683c2' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.05)';
                    if (index !== 0) e.currentTarget.style.borderColor = '#1683c2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    if (index !== 0) e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: index === 0 ? '#1683c2' : '#f1f5f9',
                    color: index === 0 ? 'white' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    {emp.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.nome}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {emp.projetos?.length || 0} Projetos
                    </div>
                  </div>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#1683c2',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '4px 8px',
                      borderBottomLeftRadius: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Recente
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          paddingTop: '1.5rem',
          borderTop: hasEmpresas ? '1px solid #f1f5f9' : 'none'
        }}>
          <button
            onClick={() => onNavigate('minhas-empresas')}
            style={{
              padding: '0.875rem 2rem',
              backgroundColor: '#1683c2',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#126da3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1683c2'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>business_center</span>
            Minhas Organizações
          </button>
          <button
            onClick={() => onNavigate('empresa', { mode: 'new' })}
            style={{
              padding: '0.875rem 2rem',
              backgroundColor: 'white',
              color: '#1683c2',
              border: '2px solid #1683c2',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            Cadastrar Nova
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{
            color: '#0f172a',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="material-symbols-outlined" style={{
              color: '#1246e2',
              fontSize: '32px',
            }}>
              dashboard
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {empresaAtual.nome} - Dashboard
            </span>
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
          }}>
            {funcoes.length} função(s) • {totals.totalPF} PF • R$ {totals.valorTotal}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <StatusIndicator />
        </div>
      </div>

      <StatsCards />

      <div style={{
        marginTop: '0.5rem',
        marginBottom: '2rem',
      }}></div>

      <div style={{
        marginTop: '0.5rem',
        marginBottom: '2rem',
      }}></div>

      <FunctionTable />



      <AppFooter />


    </>
  );
}

// Conteúdo da página Minhas Empresas (SEM HEADER DUPLICADO)
function MinhasEmpresasContent({ onNavigate }) {
  return <EmpresaList onNavigate={onNavigate} />;
}

// Conteúdo da página Empresa (Configurações)
function EmpresaContent({ isCreatingNew, empresaId, onNavigate, onBackToDashboard, onBackToEmpresas }) {
  const { empresaAtualObj: empresaAtual } = useFunctionContext();

  console.log('🔗 [EmpresaContent] Renderizando:', { isCreatingNew, empresaId, empresaAtual });

  // Se não tiver empresa selecionada e não está criando nova, redirecionar para lista
  if (!empresaAtual && !isCreatingNew) {
    // Isso não deveria acontecer devido ao redirecionamento no AppContent
    console.log('🔗 [EmpresaContent] Estado inválido - redirecionando');
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('minhas-empresas');
      } else {
        window.location.hash = '#minhas-empresas';
      }
    }, 100);

    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '1rem' }}>
          business_off
        </span>
        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>
          Nenhuma empresa selecionada
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Você precisa selecionar uma empresa antes de acessar as configurações.
        </p>
        <button
          onClick={onBackToEmpresas}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1246e2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Ir para Minhas Empresas
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{
            color: '#0f172a',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="material-symbols-outlined" style={{
              color: '#1246e2',
              fontSize: '32px',
            }}>
              {isCreatingNew ? 'add_business' : 'settings'}
            </span>
            <span>
              {isCreatingNew ? 'Criar Nova Empresa' : 'Configurações da Empresa'}
            </span>
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
          }}>
            {isCreatingNew
              ? 'Preencha os dados para criar uma nova empresa'
              : `Configurando: ${empresaAtual?.nome || 'Empresa'}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isCreatingNew ? (
            <button
              onClick={onBackToEmpresas}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_back
              </span>
              Cancelar
            </button>
          ) : (
            <button
              onClick={onBackToDashboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_back
              </span>
              Voltar ao Dashboard
            </button>
          )}
        </div>
      </div>

      <EmpresaConfig
        isCreatingNew={isCreatingNew}
        empresaId={empresaId}
        onNavigate={onNavigate}
      />
    </>
  );
}

// Conteúdo de "Nova Função" - CORRIGIDO (sem header duplicado)
function NovaFuncaoContent({ onNavigate }) {
  const { empresaAtualObj, projetoAtualObj } = useFunctionContext();

  // Validações de estado
  if (!empresaAtualObj) {
    return (
      <div style={stylesNovaFuncao.containerVazio}>
        <div style={stylesNovaFuncao.iconVazio}>🏢</div>
        <h3 style={stylesNovaFuncao.tituloVazio}>Nenhuma Empresa Selecionada</h3>
        <p style={stylesNovaFuncao.textoVazio}>Selecione uma empresa para adicionar funções.</p>
        <button
          onClick={() => onNavigate && onNavigate('minhas-empresas')}
          style={stylesNovaFuncao.botaoVoltar}
        >
          Ir para Minhas Empresas
        </button>
      </div>
    );
  }

  if (!projetoAtualObj) {
    return (
      <div style={stylesNovaFuncao.containerVazio}>
        <div style={stylesNovaFuncao.iconVazio}>📁</div>
        <h3 style={stylesNovaFuncao.tituloVazio}>Nenhum Projeto Selecionado</h3>
        <p style={stylesNovaFuncao.textoVazio}>Selecione um projeto para adicionar funções.</p>
        <button
          onClick={() => onNavigate && onNavigate('projetos')}
          style={stylesNovaFuncao.botaoVoltar}
        >
          Ir para Projetos
        </button>
      </div>
    );
  }

  return (
    <>
      {/* HEADER SIMPLIFICADO - Apenas botão voltar */}
      <div style={stylesNovaFuncao.headerPagina}>
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          style={stylesNovaFuncao.botaoVoltarSimples}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_back
          </span>
          Voltar ao Dashboard
        </button>
      </div>

      {/* FORMULÁRIO COM SEU PRÓPRIO HEADER BONITO */}
      <NewEntryForm />

      {/* TABELA DE FUNÇÕES ABAIXO */}
      <div style={{ marginTop: '2rem' }}>
        <FunctionTable />
      </div>
    </>
  );
}

// Estilos para o NovaFuncaoContent
const stylesNovaFuncao = {
  containerVazio: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb',
    maxWidth: '600px',
    margin: '0 auto'
  },
  iconVazio: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  tituloVazio: {
    margin: '0 0 8px 0',
    color: '#374151',
    fontSize: '1.25rem'
  },
  textoVazio: {
    margin: '0 0 16px 0',
    color: '#6b7280'
  },
  botaoVoltar: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1246e2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  headerPagina: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  botaoVoltarSimples: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

// Conteúdo de "Limpeza de Dados"
function DataCleaningContent() {
  return <DataCleaning />;
}

// Conteúdo de "Backups" (NOVO)
function BackupsContent({ onNavigate }) {
  return (
    <>
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            color: '#0f172a',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="material-symbols-outlined" style={{
              color: '#334155',
              fontSize: '32px',
            }}>
              backup
            </span>
            Gerenciamento de Backups
          </h1>
          <p style={{ color: '#64748b' }}>
            Gerencie backups e restaurações dos dados do sistema.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_back
          </span>
          Voltar ao Dashboard
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <BackupManager />
      </div>
    </>
  );
}

// Página em construção
function ComingSoon({ pageName, onBackToDashboard }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '3rem',
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: '#f1f5f9',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: '48px',
          color: '#94a3b8',
        }}>
          construction
        </span>
      </div>

      <h2 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: '1rem',
      }}>
        {pageName}
      </h2>

      <p style={{
        fontSize: '1.125rem',
        color: '#64748b',
        maxWidth: '600px',
        marginBottom: '2rem',
        lineHeight: 1.6,
      }}>
        Esta funcionalidade está em desenvolvimento e será disponibilizada em breve.
      </p>

      <button
        onClick={onBackToDashboard}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.875rem 1.75rem',
          backgroundColor: '#1246e2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1246e2'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          arrow_back
        </span>
        Voltar ao Dashboard
      </button>
    </div>
  );
}

// ====================== APP PRINCIPAL ======================
function App() {
  return (
    <FunctionProvider>
      <ProtectedLayout>
        <AppContent />
      </ProtectedLayout>
    </FunctionProvider>
  );
}

export default App;