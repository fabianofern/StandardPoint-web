// components/WelcomeScreen.jsx
import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { empresas, selecionarEmpresa, adicionarEmpresa } = useFunctionContext();
  const [showEmpresaSetup, setShowEmpresaSetup] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState({
    nome: '',
    valorPF: 850.00,
    hcpp: 20,
  });

  const handleQuickStart = () => {
    // Cria empresa padrão
    adicionarEmpresa({
      nome: 'Minha Empresa',
      valorPF: 850.00,
      hcpp: 20,
      tecnologias: [],
      experienciaTime: [],
      faseCiclo: 'codificacao',
      timeProjeto: [],
    });
    // A seleção da nova empresa acontecerá via useEffect no Context ou manualmente se necessário
    // Mas no fluxo de onboarding, queremos que o usuário comece.
    onStart();
  };

  const handleCreateEmpresa = () => {
    if (!novaEmpresa.nome.trim()) return;

    adicionarEmpresa({
      ...novaEmpresa,
      nome: novaEmpresa.nome.trim(),
      valorPF: Number(novaEmpresa.valorPF),
      hcpp: Number(novaEmpresa.hcpp),
      tecnologias: [],
      experienciaTime: [],
      faseCiclo: 'codificacao',
      timeProjeto: [],
    });

    setNovaEmpresa({ nome: '', valorPF: 850.00, hcpp: 20 });
    setShowEmpresaSetup(false);
    onStart();
  };

  // Cards informativos sobre IFPUG
  const infoCards = [
    {
      icon: 'calculate',
      title: 'O que são Pontos de Função?',
      description: 'Métrica padrão internacional para medir o tamanho funcional de software. Desenvolvida pela IFPUG.',
      color: '#1246e2'
    },
    {
      icon: 'analytics',
      title: 'Estimativas Precisas',
      description: 'Preveja esforço, custos e prazos com base técnica sólida e reconhecida mundialmente.',
      color: '#7c3aed'
    },
    {
      icon: 'rule',
      title: 'Método IFPUG 4.3.1',
      description: 'Implementação completa das regras de contagem para funções de dados e transações.',
      color: '#0ea5e9'
    },
    {
      icon: 'tune',
      title: 'Valor de Ajuste (VAF)',
      description: 'Ajuste o tamanho funcional com base em 14 características sistêmicas do seu projeto.',
      color: '#f59e0b'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header/Banner */}
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoPlaceholder}>
            <img src="/icon.png" alt="StandardPoint Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            <h1 style={styles.logoText}>StandardPoint</h1>
          </div>
          <p style={styles.tagline}>Bem-vindo ao Novo Padrão de Análise de Software</p>
          <div style={styles.versionBadge}>
            <span className="material-symbols-outlined" style={styles.badgeIcon}>
              verified
            </span>
            Onboarding Inicial • IFPUG Compliant
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={styles.content}>
        {/* Introdução */}
        <div style={styles.introSection}>
          <h2 style={styles.introTitle}>
            <span className="material-symbols-outlined" style={styles.introIcon}>
              rocket_launch
            </span>
            Vamos configurar seu primeiro acesso
          </h2>
          <p style={styles.introText}>
            Detectamos que você ainda não possui empresas cadastradas.
            O <strong>StandardPoint</strong> organiza suas análises por empresa e projeto.
            Comece criando seu ambiente de trabalho agora.
          </p>
        </div>

        {/* Cards Informativos */}
        <div style={styles.cardsGrid}>
          {infoCards.map((card, index) => (
            <div key={index} style={{ ...styles.infoCard, borderLeftColor: card.color }}>
              <div style={{ ...styles.cardIcon, backgroundColor: `${card.color}15` }}>
                <span className="material-symbols-outlined" style={{ ...styles.cardIconInner, color: card.color }}>
                  {card.icon}
                </span>
              </div>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDescription}>{card.description}</p>
            </div>
          ))}
        </div>

        {/* Ação Principal */}
        <div style={styles.actionSection}>
          {!showEmpresaSetup ? (
            <>
              <h3 style={styles.actionTitle}>Como deseja começar?</h3>
              <p style={styles.actionText}>
                Escolha o início rápido com dados sugeridos ou configure sua empresa agora.
              </p>

              <div style={styles.actionButtons}>
                <button
                  onClick={handleQuickStart}
                  style={styles.primaryButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1246e2'}
                >
                  <span className="material-symbols-outlined" style={styles.buttonIcon}>
                    bolt
                  </span>
                  Configuração Rápida
                </button>

                <button
                  onClick={() => setShowEmpresaSetup(true)}
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                >
                  <span className="material-symbols-outlined" style={styles.buttonIcon}>
                    add_business
                  </span>
                  Configurar Manualmente
                </button>
              </div>
            </>
          ) : (
            // Formulário de nova empresa
            <div style={styles.empresaForm}>
              <div style={styles.formHeader}>
                <h3 style={styles.formTitle}>
                  <span className="material-symbols-outlined" style={styles.formIcon}>
                    business
                  </span>
                  Configurar Nova Empresa
                </h3>
                <button
                  onClick={() => setShowEmpresaSetup(false)}
                  style={styles.closeButton}
                  title="Voltar"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              </div>

              <div style={styles.formContent}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    <span className="material-symbols-outlined" style={styles.labelIcon}>
                      badge
                    </span>
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={novaEmpresa.nome}
                    onChange={(e) => setNovaEmpresa({ ...novaEmpresa, nome: e.target.value })}
                    style={styles.formInput}
                    placeholder="Ex: Construtora ABC Ltda"
                    autoFocus
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <span className="material-symbols-outlined" style={styles.labelIcon}>
                        attach_money
                      </span>
                      Valor do PF (R$)
                    </label>
                    <input
                      type="number"
                      value={novaEmpresa.valorPF}
                      onChange={(e) => setNovaEmpresa({ ...novaEmpresa, valorPF: Number(e.target.value) || 850 })}
                      style={styles.formInput}
                      min="0.01"
                      step="0.01"
                    />
                    <div style={styles.formHelp}>Valor médio por ponto de função</div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <span className="material-symbols-outlined" style={styles.labelIcon}>
                        schedule
                      </span>
                      HCPP (horas/PF)
                    </label>
                    <input
                      type="number"
                      value={novaEmpresa.hcpp}
                      onChange={(e) => setNovaEmpresa({ ...novaEmpresa, hcpp: Number(e.target.value) || 20 })}
                      style={styles.formInput}
                      min="4"
                      max="25"
                    />
                    <div style={styles.formHelp}>Horas de esforço por PF (4-25h)</div>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button
                    onClick={() => {
                      setShowEmpresaSetup(false);
                      setNovaEmpresa({ nome: '', valorPF: 850.00, hcpp: 20 });
                    }}
                    style={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateEmpresa}
                    style={{
                      ...styles.submitButton,
                      opacity: novaEmpresa.nome.trim() ? 1 : 0.6,
                      cursor: novaEmpresa.nome.trim() ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!novaEmpresa.nome.trim()}
                  >
                    <span className="material-symbols-outlined" style={styles.submitIcon}>
                      done
                    </span>
                    Criar e Começar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <span style={styles.footerTitle}>StandardPoint v1.1</span>
            <span style={styles.footerText}>Ferramenta de Métricas IFPUG</span>
          </div>
          <div style={styles.footerSection}>
            <span style={styles.footerFeature}>
              <span className="material-symbols-outlined" style={styles.featureIcon}>
                security
              </span>
              Dados locais seguros
            </span>
            <span style={styles.footerFeature}>
              <span className="material-symbols-outlined" style={styles.featureIcon}>
                backup
              </span>
              Backups automáticos
            </span>
            <span style={styles.footerFeature}>
              <span className="material-symbols-outlined" style={styles.featureIcon}>
                cloud_sync
              </span>
              Persistência automática
            </span>
          </div>
          <div style={styles.footerSection}>
            <span style={styles.copyright}>
              © {new Date().getFullYear()} - Para uso profissional
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS inline
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',

    backgroundImage: 'url(/fundo.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '3rem 2rem 2rem',
    textAlign: 'center',
    color: 'white',
    borderBottom: '1px solid #334155',
  },
  logoContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  logoPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  logoIcon: {
    fontSize: '48px',
    color: '#60a5fa',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    padding: '1rem',
    borderRadius: '16px',
  },
  logoText: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  tagline: {
    fontSize: '1.125rem',
    color: '#cbd5e1',
    marginBottom: '1rem',
    fontWeight: '300',
  },
  versionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  badgeIcon: {
    fontSize: '16px',
    color: '#10b981',
  },

  // Conteúdo Principal
  content: {
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    width: '100%',
  },

  // Seção de Introdução
  introSection: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  introTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '0 0 1rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  introIcon: {
    fontSize: '32px',
    color: '#1246e2',
  },
  introText: {
    fontSize: '1.125rem',
    color: '#475569',
    lineHeight: 1.6,
    maxWidth: '800px',
    margin: '0 auto',
  },

  // Cards Informativos
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    borderLeft: '4px solid',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  cardIconInner: {
    fontSize: '28px',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 0.75rem 0',
  },
  cardDescription: {
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: 1.5,
    margin: 0,
  },

  // Seção de Ação
  actionSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    marginBottom: '2rem',
  },
  actionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
    textAlign: 'center',
  },
  actionText: {
    fontSize: '1rem',
    color: '#475569',
    textAlign: 'center',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    backgroundColor: '#1246e2',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(18, 70, 226, 0.2)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    backgroundColor: '#f1f5f9',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonIcon: {
    fontSize: '20px',
  },

  // Empresas Existentes
  existingEmpresas: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0',
  },
  existingTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 1rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  existingIcon: {
    fontSize: '20px',
    color: '#6b7280',
  },
  empresasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  empresaButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    // border: 'none', // Removed duplicate key
    width: '100%',
    textAlign: 'left',
  },
  empresaAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #1246e2 0%, #7c3aed 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  empresaInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  empresaNome: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  empresaDetails: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  empresaArrow: {
    color: '#94a3b8',
    fontSize: '20px',
  },

  // Formulário de Empresa
  empresaForm: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  formIcon: {
    fontSize: '28px',
    color: '#1246e2',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  labelIcon: {
    fontSize: '18px',
    color: '#6b7280',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  formHelp: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.375rem',
    fontStyle: 'italic',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1246e2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitIcon: {
    fontSize: '18px',
  },

  // Footer
  footer: {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    padding: '2rem',
    borderTop: '1px solid #334155',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    alignItems: 'center',
    textAlign: 'center',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  footerTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: 'white',
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  footerFeature: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: '0 1rem',
  },
  featureIcon: {
    fontSize: '14px',
    color: '#60a5fa',
  },
  copyright: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
};

export default WelcomeScreen;