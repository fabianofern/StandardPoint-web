// components/Header.jsx - VERSÃO CORRIGIDA
import React, { useEffect, useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';
import HeaderSelectors from './HeaderSelectors';

const Header = () => {
  const {
    saveStatus,
    totals,
    empresaAtualObj,
    empresaAtual
  } = useFunctionContext();

  const [statusText, setStatusText] = useState('Sincronizado');
  const [statusIcon, setStatusIcon] = useState('cloud_done');
  const [statusColor, setStatusColor] = useState('#1683c2');
  const [valorTotalFormatado, setValorTotalFormatado] = useState('R$ 0,00');

  // Atualizar status dinamicamente
  useEffect(() => {
    switch (saveStatus) {
      case 'saving':
        setStatusText('Salvando...');
        setStatusIcon('sync');
        setStatusColor('#f59e0b');
        break;
      case 'saved':
        setStatusText('Salvo');
        setStatusIcon('check_circle');
        setStatusColor('#10b981');
        setTimeout(() => {
          if (saveStatus === 'saved') {
            setStatusText('Sincronizado');
            setStatusIcon('cloud_done');
            setStatusColor('#1683c2');
          }
        }, 2000);
        break;
      case 'error':
        setStatusText('Erro');
        setStatusIcon('error');
        setStatusColor('#ef4444');
        break;
      default:
        setStatusText('Sincronizado');
        setStatusIcon('cloud_done');
        setStatusColor('#1683c2');
    }
  }, [saveStatus]);

  useEffect(() => {
    const valorPF = empresaAtualObj?.valorPF || 850.00;
    const valorTotal = (totals.totalPF || 0) * valorPF;

    const formatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(valorTotal);

    setValorTotalFormatado(formatado);
  }, [totals.totalPF, empresaAtualObj?.valorPF]);

  return (
    <header style={styles.header} className="no-print">
      <div style={styles.headerContent}>
        {/* Lado esquerdo: Logo/Banner */}
        <div style={styles.headerLeft}>
          <img
            src="/banner.png"
            alt="StandardPoint Banner"
            style={{
              height: '50px',
              width: 'auto',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e) => {
              console.error('Erro ao carregar banner.png');
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Centro: Selectors */}
        <div style={styles.headerCenter}>
          <HeaderSelectors />
        </div>

        {/* Lado direito: Status e valor */}
        <div style={styles.headerRight}>
          {empresaAtual !== null && (
            <div style={styles.totalValue}>
              <div style={{ flex: 1 }}>
                <div style={styles.totalLabel}>Valor Total</div>
                <div style={styles.totalAmount}>
                  {valorTotalFormatado}
                </div>
              </div>
              <div style={styles.pfCount}>
                {totals.totalPF} PF
              </div>
            </div>
          )}

          {/* Status */}
          <div
            style={{
              ...styles.statusIndicator,
              borderLeftColor: statusColor,
              backgroundColor: `${statusColor}10`
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '16px',
              color: statusColor,
              animation: saveStatus === 'saving' ? 'spin 1s linear infinite' : 'none'
            }}>
              {statusIcon}
            </span>
            <span style={{ color: statusColor, fontSize: '13px', fontWeight: '600' }}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

// ESTILOS ATUALIZADOS PARA MELHOR RESPONSIVIDADE E CORES
const styles = {
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 20px',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    gap: '20px',
    flexWrap: 'wrap', // Permite quebra em telas muito pequenas
    padding: '10px 0'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '180px',
    flexShrink: 0
  },
  headerCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    minWidth: '300px',
    maxWidth: '700px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '220px',
    justifyContent: 'flex-end',
    flexShrink: 0
  },
  totalValue: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '160px',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
  },
  totalLabel: {
    fontSize: '10px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700'
  },
  totalAmount: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '800'
  },
  pfCount: {
    backgroundColor: '#1683c2',
    color: 'white',
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '8px',
    minWidth: '50px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(22, 131, 194, 0.2)'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    borderLeft: '4px solid',
    transition: 'all 0.3s ease'
  }
};

export default Header;