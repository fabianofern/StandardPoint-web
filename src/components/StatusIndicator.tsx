import React from 'react';
import { useFunctionContext } from '../context/FunctionContext';

const StatusIndicator = () => {
  const { saveStatus } = useFunctionContext();
  
  const getStatusInfo = () => {
    switch(saveStatus) {
      case 'saving':
        return { text: 'Salvando...', color: '#f59e0b' };
      case 'saved':
        return { text: 'Salvo', color: '#10b981' };
      case 'error':
        return { text: 'Erro ao salvar', color: '#ef4444' };
      default:
        return { text: 'Sincronizado', color: '#3b82f6' };
    }
  };
  
  const status = getStatusInfo();
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#475569',
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: status.color,
      }} />
      <span>{status.text}</span>
    </div>
  );
};

export default StatusIndicator;