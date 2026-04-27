import React from 'react';
import { useFunctionContext } from '../context/FunctionContext';

interface StatsCardsProps {
  empty?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ empty = false }) => {
  const { totals, empresaAtualObj, funcoes } = useFunctionContext();

  // Se for modo vazio (preview), mostrar dados de exemplo
  if (empty) {
    const stats = [
      {
        id: 1,
        title: 'Total PF',
        value: '0',
        subtitle: 'R$ 0,00',
        color: 'primary',
        icon: 'functions',
      },
      {
        id: 2,
        title: 'ALI + AIE',
        value: '0',
        subtitle: 'ALI: 0 | AIE: 0',
        color: 'data',
        icon: 'database',
      },
      {
        id: 3,
        title: 'EE + SE + CE',
        value: '0',
        subtitle: 'EE: 0 | SE: 0 | CE: 0',
        color: 'transaction',
        icon: 'swap_horiz',
      },
      {
        id: 4,
        title: 'Esforço Estimado',
        value: '0h',
        subtitle: '0 dias úteis • 20h/PF',
        color: 'effort',
        icon: 'schedule',
      },
    ];

    return (
      <div style={styles.container}>
        <div style={styles.valueInfo}>
          <span className="material-symbols-outlined" style={styles.infoIcon}>
            info
          </span>
          <span style={styles.infoText}>
            <strong>Empresa:</strong> Exemplo •
            <strong> Valor do PF:</strong> R$ 850,00 •
            <strong> HCPP:</strong> 20h/PF •
            <strong> Esforço Total:</strong> 0h (0 dias)
          </span>
        </div>

        <div style={styles.cardsGrid}>
          {stats.map((stat) => (
            <div
              key={stat.id}
              style={{
                ...styles.card,
                ...(stat.color === 'primary' && styles.cardPrimary),
                ...(stat.color === 'data' && styles.cardData),
                ...(stat.color === 'transaction' && styles.cardTransaction),
                ...(stat.color === 'effort' && styles.cardEffort),
                opacity: 0.7,
              }}
            >
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <div style={{
                    ...styles.iconContainer,
                    ...(stat.color === 'primary' && styles.iconPrimary),
                    ...(stat.color === 'data' && styles.iconData),
                    ...(stat.color === 'transaction' && styles.iconTransaction),
                    ...(stat.color === 'effort' && styles.iconEffort),
                  }}>
                    <span className="material-symbols-outlined" style={styles.icon}>
                      {stat.icon}
                    </span>
                  </div>
                  <h4 style={styles.cardTitle}>{stat.title}</h4>
                </div>

                <div style={styles.valueContainer}>
                  <p style={{
                    ...styles.value,
                    color: 'white',
                  }}>
                    {stat.value}
                  </p>
                </div>

                {stat.subtitle && (
                  <p style={{
                    ...styles.subtitle,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}>
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dados reais
  const valorPF = empresaAtualObj?.valorPF || 850.00;
  const hcpp = empresaAtualObj?.hcpp || 20;

  // ✅ VALORES JÁ CALCULADOS NO CONTEXTO
  const esforcoTotal = parseInt(totals.esforcoTotal) || 0;
  const diasUteis = parseFloat(totals.diasUteis) || 0;
  const valorTotal = parseFloat(totals.valorTotal) || 0;

  // Contar por tipo específico
  const contarPorTipo = () => {
    const contadores = {
      ALI: 0, AIE: 0, EE: 0, SE: 0, CE: 0
    };

    funcoes.forEach(func => {
      const tipo = func.tipo || func.type;
      const tipoPT = {
        'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
        'ILF': 'ALI', 'EIF': 'AIE',
        'EE': 'EE', 'SE': 'SE', 'CE': 'CE',
        'ALI': 'ALI', 'AIE': 'AIE'
      }[tipo] || tipo;

      if (contadores[tipoPT] !== undefined) {
        contadores[tipoPT]++;
      }
    });

    return contadores;
  };

  const contadores = contarPorTipo();

  const stats = [
    {
      id: 1,
      title: 'Total PF Ajustado',
      value: totals.totalPFAjustado?.toString() || totals.totalPF.toString(),
      subtitle: (
        <span style={{ fontSize: '0.8em' }}>
          Bruto: {totals.totalPFBruto || totals.totalPF} <br />
          VAF: {totals.vaf || '1.00'}
        </span>
      ),
      color: 'primary',
      icon: 'functions',
      tooltip: `Cálculo: PF Bruto (${totals.totalPFBruto || totals.totalPF}) × VAF (${totals.vaf || '1.00'}) = ${totals.totalPFAjustado || totals.totalPF}\nValor total: R$ ${valorTotal.toLocaleString('pt-BR')}`,
    },
    {
      id: 2,
      title: 'ALI + AIE',
      value: totals.funcoesDados.toString(),
      subtitle: `ALI: ${contadores.ALI} | AIE: ${contadores.AIE}`,
      color: 'data',
      icon: 'database',
      tooltip: 'Arquivos Lógicos Internos (ALI) + Arquivos de Interface Externa (AIE)',
    },
    {
      id: 3,
      title: 'EE + SE + CE',
      value: totals.funcoesTransacao.toString(),
      subtitle: `EE: ${contadores.EE} | SE: ${contadores.SE} | CE: ${contadores.CE}`,
      color: 'transaction',
      icon: 'swap_horiz',
      tooltip: 'Entradas Externas (EE) + Saídas Externas (SE) + Consultas Externas (CE)',
    },
    {
      id: 4,
      title: 'Esforço Estimado',
      value: `${esforcoTotal}h`,
      subtitle: (
        <>
          {diasUteis} dias úteis • {hcpp}h/PF
          <br />
          <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
            R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </>
      ),
      color: 'effort',
      icon: 'schedule',
      tooltip: `Total: ${esforcoTotal} horas (${totals.totalPF} PF × ${hcpp}h/PF)\nEquivalente a ${diasUteis} dias de trabalho (8h/dia)`,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Informação do valor do PF e HCPP */}
      {empresaAtualObj && (
        <div style={styles.valueInfo}>
          <span className="material-symbols-outlined" style={styles.infoIcon}>
            info
          </span>
          <span style={styles.infoText}>
            <strong>Empresa:</strong> {empresaAtualObj.nome} •
            <strong> Valor do PF:</strong> R$ {valorPF.toFixed(2)} •
            <strong> HCPP:</strong> {hcpp}h/PF •
            <strong> Esforço Total:</strong> {esforcoTotal}h ({diasUteis} dias)
          </span>
        </div>
      )}

      {/* Cards */}
      <div style={styles.cardsGrid}>
        {stats.map((stat) => (
          <div
            key={stat.id}
            style={{
              ...styles.card,
              ...(stat.color === 'primary' && styles.cardPrimary),
              ...(stat.color === 'data' && styles.cardData),
              ...(stat.color === 'transaction' && styles.cardTransaction),
              ...(stat.color === 'effort' && styles.cardEffort),
            }}
            title={stat.tooltip}
          >
            <div style={styles.cardContent}>
              {/* Cabeçalho: Ícone + Título */}
              <div style={styles.cardHeader}>
                <div style={{
                  ...styles.iconContainer,
                  ...(stat.color === 'primary' && styles.iconPrimary),
                  ...(stat.color === 'data' && styles.iconData),
                  ...(stat.color === 'transaction' && styles.iconTransaction),
                  ...(stat.color === 'effort' && styles.iconEffort),
                }}>
                  <span className="material-symbols-outlined" style={styles.icon}>
                    {stat.icon}
                  </span>
                </div>
                <h4 style={styles.cardTitle}>{stat.title}</h4>
              </div>

              {/* Valor principal */}
              <div style={styles.valueContainer}>
                <p style={{
                  ...styles.value,
                  color: 'white',
                }}>
                  {stat.value}
                </p>
              </div>

              {/* Subtitle */}
              {stat.subtitle && (
                <p style={{
                  ...styles.subtitle,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}>
                  {stat.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estilos CSS inline
const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '2rem',
  },
  valueInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0f9ff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #bae6fd',
    fontSize: '0.875rem',
    color: '#0369a1',
  },
  infoIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  cardsGrid: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1',
    minWidth: '200px',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1rem',
  },
  iconContainer: {
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
  },
  icon: {
    fontSize: '24px',
  },
  cardTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Cores e estilos específicos por tipo
  cardPrimary: {
    backgroundColor: '#1246e2',
  },
  iconPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  cardData: {
    backgroundColor: '#7c3aed',
  },
  iconData: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  cardTransaction: {
    backgroundColor: '#0ea5e9',
  },
  iconTransaction: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  cardEffort: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  iconEffort: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  valueContainer: {
    marginBottom: '0.5rem',
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: 0,
    lineHeight: 1,
  },

  subtitle: {
    fontSize: '0.875rem',
    margin: 0,
    opacity: 0.9,
    lineHeight: 1.4,
  },
};

// Adicionar estilos globais para hover via uma tag style única
// (Apenas uma vez no aplicativo, não em cada render)
if (!document.getElementById('stats-cards-hover-styles')) {
  const style = document.createElement('style');
  style.id = 'stats-cards-hover-styles';
  style.textContent = `
    .stats-card-hover:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

export default StatsCards;