import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';
import { useAuthStore } from '../stores/authStore';

const Sidebar = ({ currentPage, onNavigate }) => {
  const { empresaAtualObj } = useFunctionContext();
  const { user: currentUser, logout } = useAuthStore();

  // Estado para controlar o sidebar no mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Estado para controlar submenus abertos
  const [openMenus, setOpenMenus] = useState({
    empresa: false,
    projetos: false
  });

  // Função para navegação
  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
      if (isMobile) {
        setIsMobileOpen(false);
      }
    }
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };



  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Verifica se o item está ativo
  const isActive = (page) => currentPage === page;

  // Estilos CSS inline (ATUALIZADOS)
  const styles = {
    // Overlay para mobile
    overlay: {
      display: isMobile && isMobileOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 49,
    },

    // Botão de toggle mobile
    mobileToggle: {
      display: isMobile ? 'flex' : 'none',
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      zIndex: 51,
      backgroundColor: '#1683c2ff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    sidebarContainer: {
      position: !isMobile ? 'fixed' : 'absolute',
      left: isMobile && !isMobileOpen ? '-280px' : '0',
      top: 0,
      height: '100vh',
      zIndex: 50,
      transition: 'left 0.3s ease',
    },

    sidebar: {
      width: '280px',
      height: '100%',
      backgroundColor: '#1683c2ff', // COR AZUL SOLICITADA
      background: 'linear-gradient(180deg, #1683c2ff 0%, #0099CC 100%)', // Gradiente suave
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
    },





    logoContainer: {
      padding: '1.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    },

    logoText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      margin: 0,
      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },

    nav: {
      flex: 1,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px', // Espaçamento reduzido
      overflowY: 'auto',
      overflowX: 'hidden',
      flexShrink: 1,
      // Estilos para esconder scrollbar
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE/Edge
    },

    separator: {
      height: '1px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      margin: '0.5rem 0', // Margem reduzida
    },

    submenuContainer: {
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      paddingLeft: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
      marginLeft: '1.5rem',
      marginTop: '2px',
      marginBottom: '4px',
    },

    subNavItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      color: 'rgba(255, 255, 255, 0.8)',
      textDecoration: 'none',
      borderRadius: '6px',
      transition: 'all 0.2s',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '13px',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      fontWeight: '500',
    },

    subNavItemActive: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '6px',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
    },

    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.65rem 1rem', // Padding ligeiramente reduzido
      color: 'rgba(255, 255, 255, 0.9)',
      textDecoration: 'none',
      borderRadius: '8px',
      transition: 'all 0.2s',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      position: 'relative',
      fontWeight: 'bold', // NEGRITO SOLICITADO
      whiteSpace: 'nowrap',
    },

    navItemActive: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.65rem 1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: 'bold', // NEGRITO SOLICITADO
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      position: 'relative',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      whiteSpace: 'nowrap',
    },

    empresaBadge: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      color: 'white',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '10px',
      fontWeight: 'bold',
    },

    projetoBadge: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: '#10b981',
      color: 'white',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '10px',
      fontWeight: 'bold',
      minWidth: '18px',
      textAlign: 'center',
    },

    disabledBadge: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
    },

    profileContainer: {
      padding: '1.25rem', // Padding reduzido
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      flexShrink: 0,
    },

    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '0.5rem',
      position: 'relative',
    },

    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
    },

    profileInfo: {
      flex: 1,
      overflow: 'hidden',
    },

    profileName: {
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    profileRole: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.75rem',
      margin: 0,
      fontWeight: '500',
    },

    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      position: 'absolute',
      right: '0',
      top: '0',
      boxShadow: '0 0 0 2px #00BFFF',
    },

    statusInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },

    statusText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '11px',
      fontStyle: 'italic',
      fontWeight: '500',
    },
  };

  // Adicionar estilos globais para esconder scrollbar no Webkit e animações
  useEffect(() => {
    if (!document.getElementById('sidebar-global-styles')) {
      const style = document.createElement('style');
      style.id = 'sidebar-global-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 400px;
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Esconder scrollbar no Webkit (Chrome, Safari, Opera) */
        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }
        
        /* Ajustes responsivos */
        @media (max-width: 768px) {
          .sidebar-desktop {
            transform: translateX(-100%);
          }
          .sidebar-desktop.open {
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      {/* Overlay para mobile */}
      <div
        style={styles.overlay}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Botão de toggle para mobile */}
      <button
        style={styles.mobileToggle}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      <div style={styles.sidebarContainer} className="no-print">
        <div style={styles.sidebar}>



          {/* Logo */}
          <div style={styles.logoContainer}>
            <div>
              <img
                src="/icon.png"
                alt="Logo"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            </div>
            <h3 style={styles.logoText}>StandardPoint</h3>
          </div>

          {/* Menu de Navegação */}
          <nav style={styles.nav} className="sidebar-nav">
            {/* Dashboard */}
            <button
              onClick={() => handleNavigate('dashboard')}
              style={isActive('dashboard') ? styles.navItemActive : styles.navItem}
              onMouseEnter={(e) => {
                if (!isActive('dashboard')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('dashboard')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              disabled={!empresaAtualObj}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
              {!empresaAtualObj && (
                <span style={styles.disabledBadge} title="Selecione uma empresa primeiro">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    lock
                  </span>
                </span>
              )}
            </button>

            {/* Menu Empresa com Submenus */}
            <div>
              <button
                onClick={() => toggleMenu('empresa')}
                style={styles.navItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <span className="material-symbols-outlined">apartment</span>
                  <span>Empresa</span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.7 }}>
                  {openMenus.empresa ? 'expand_more' : 'chevron_right'}
                </span>
              </button>

              {openMenus.empresa && (
                <div style={styles.submenuContainer}>
                  {/* Visualizar Empresas */}
                  <button
                    onClick={() => handleNavigate('minhas-empresas')}
                    style={isActive('minhas-empresas') ? styles.subNavItemActive : styles.subNavItem}
                    onMouseEnter={(e) => {
                      if (!isActive('minhas-empresas')) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('minhas-empresas')) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                    <span>Visualizar Empresas</span>
                    {empresaAtualObj && (
                      <span style={styles.empresaBadge}>
                        {empresaAtualObj.nome?.substring(0, 2).toUpperCase() || 'ME'}
                      </span>
                    )}
                  </button>

                  {/* Cadastrar Empresas (Anteriormente Configurações) */}
                  <button
                    onClick={() => handleNavigate('empresa', { mode: 'new' })}
                    style={isActive('empresa') ? styles.subNavItemActive : styles.subNavItem}
                    onMouseEnter={(e) => {
                      if (!isActive('empresa')) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('empresa')) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_business</span>
                    <span>Cadastrar Empresas</span>
                  </button>

                  {/* Funcionários (Novo - Vazio por enquanto) */}
                  <button
                    onClick={() => handleNavigate('funcionarios')}
                    style={isActive('funcionarios') ? styles.subNavItemActive : styles.subNavItem}
                    onMouseEnter={(e) => {
                      if (!isActive('funcionarios')) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('funcionarios')) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span>
                    <span>Funcionários</span>
                  </button>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* NOVO: AGRUPADOR DE PROJETOS COMPLETO (Listagem, Squad, Estimativas) */}
            {/* ========================================================= */}
            <div style={styles.navGroup}>
              <button
                onClick={() => toggleMenu('projetos')}
                style={
                  (isActive('projetos') || isActive('projeto-squad') || isActive('projeto-estimativas'))
                    ? styles.navItemActive
                    : styles.navItem
                }
                onMouseEnter={(e) => {
                  if (!isActive('projetos') && !isActive('projeto-squad') && !isActive('projeto-estimativas')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('projetos') && !isActive('projeto-squad') && !isActive('projeto-estimativas')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-symbols-outlined">folder</span>
                  <span>Projetos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* Badges */}
                  {!empresaAtualObj ? (
                    <span style={styles.disabledBadge} title="Selecione uma empresa primeiro">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                    </span>
                  ) : empresaAtualObj.projetos?.length > 0 ? (
                    <span style={styles.projetoBadge} title={`${empresaAtualObj.projetos.length} projeto(s)`}>
                      {empresaAtualObj.projetos.length}
                    </span>
                  ) : null}
                  {/* Seta do Dropdown */}
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px',
                      transition: 'transform 0.3s ease',
                      transform: openMenus.projetos ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Submenus de Projetos */}
              {openMenus.projetos && (
                <div style={styles.submenuContainer}>
                  {/* 1. Gerenciar Projetos */}
                  <button
                    onClick={() => handleNavigate('projetos')}
                    style={isActive('projetos') ? styles.subNavItemActive : styles.subNavItem}
                    onMouseEnter={(e) => {
                      if (!isActive('projetos')) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('projetos')) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list_alt</span>
                    <span>Gerenciar Projetos</span>
                  </button>

                  {/* 2. Squad (Time do Projeto) */}
                  <button
                    onClick={() => handleNavigate('projeto-squad')}
                    style={isActive('projeto-squad') ? styles.subNavItemActive : styles.subNavItem}
                    onMouseEnter={(e) => {
                      if (!isActive('projeto-squad')) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('projeto-squad')) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>groups</span>
                    <span>Squad do Projeto</span>
                  </button>

                  {/* 3. Estimativas e Prazos */}
                  <button
                    onClick={() => handleNavigate('projeto-estimativas')}
                    style={isActive('projeto-estimativas') ? styles.subNavItemActive : styles.subNavItem}
                    onMouseEnter={(e) => {
                      if (!isActive('projeto-estimativas')) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('projeto-estimativas')) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>analytics</span>
                    <span>Estimativas e Prazos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Funções */}
            <button
              onClick={() => handleNavigate('nova-funcao')}
              style={isActive('nova-funcao') ? styles.navItemActive : styles.navItem}
              onMouseEnter={(e) => {
                if (!isActive('nova-funcao')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('nova-funcao')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              disabled={!empresaAtualObj}
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span>Funções</span>
              {!empresaAtualObj && (
                <span style={styles.disabledBadge} title="Selecione uma empresa primeiro">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    lock
                  </span>
                </span>
              )}
            </button>

            {/* Valor de Ajuste de Função */}
            <button
              onClick={() => handleNavigate('valor-ajuste')}
              style={isActive('valor-ajuste') ? styles.navItemActive : styles.navItem}
              onMouseEnter={(e) => {
                if (!isActive('valor-ajuste')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('valor-ajuste')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              disabled={!empresaAtualObj}
            >
              <span className="material-symbols-outlined">tune</span>
              <span>Valor de Ajuste de Função</span>
              {!empresaAtualObj && (
                <span style={styles.disabledBadge} title="Selecione uma empresa primeiro">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    lock
                  </span>
                </span>
              )}
            </button>

            {/* Relatórios */}
            <button
              onClick={() => handleNavigate('relatorios')}
              style={isActive('relatorios') ? styles.navItemActive : styles.navItem}
              onMouseEnter={(e) => {
                if (!isActive('relatorios')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('relatorios')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="material-symbols-outlined">description</span>
              <span>Relatórios</span>
            </button>

            {/* Backups */}
            <button
              onClick={() => handleNavigate('backups')}
              style={isActive('backups') ? styles.navItemActive : styles.navItem}
              onMouseEnter={(e) => {
                if (!isActive('backups')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('backups')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="material-symbols-outlined">backup</span>
              <span>Backups</span>
            </button>

            {/* Controle de Acessos - Master/Admin apenas */}
            {(empresaAtualObj && (empresaAtualObj.role === 'Master' || empresaAtualObj.role === 'Administrador' || true)) && (
              <button
                onClick={() => handleNavigate('controle-acessos')}
                style={isActive('controle-acessos') ? styles.navItemActive : styles.navItem}
                onMouseEnter={(e) => {
                  if (!isActive('controle-acessos')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('controle-acessos')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span>Controle de Acessos</span>
              </button>
            )}

            {/* Limpeza de Dados */}
            <button
              onClick={() => handleNavigate('limpeza-dados')}
              style={isActive('limpeza-dados') ? styles.navItemActive : styles.navItem}
              onMouseEnter={(e) => {
                if (!isActive('limpeza-dados')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('limpeza-dados')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              disabled={!empresaAtualObj}
            >
              <span className="material-symbols-outlined">cleaning_services</span>
              <span>Limpeza de Dados</span>
              {!empresaAtualObj && (
                <span style={styles.disabledBadge} title="Selecione uma empresa primeiro">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    lock
                  </span>
                </span>
              )}
            </button>

          </nav>

          {/* Perfil do Usuário */}
          <div style={styles.profileContainer}>
            <div style={styles.profile}>
              <div style={styles.avatar}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={styles.profileInfo}>
                <p style={styles.profileName}>
                  {currentUser?.name || 'Usuário'}
                </p>
                <p style={styles.profileRole}>
                  {currentUser?.role || 'Visitante'}
                </p>
              </div>

              {/* Status Dot e Botão Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 0 2px #1683c2ff', // Ajustado para cor do fundo
                }} title="Online" />

                <button
                  onClick={logout}
                  title="Sair / Logout"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'; // Vermelho ao hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                </button>
              </div>

            </div>

            {/* Informação da empresa atual abaixo do usuário */}
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>apartment</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {empresaAtualObj?.nome || 'Nenhuma empresa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;