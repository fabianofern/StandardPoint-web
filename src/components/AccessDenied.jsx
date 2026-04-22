import React from 'react';

const AccessDenied = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>403 - Acesso Negado</h1>
      <p style={{ color: '#333', fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
        Você está autenticado no ToolCenter, mas não possui permissão para acessar esta ferramenta específica.
      </p>
      <p style={{ color: '#666', marginTop: '16px' }}>
        Por favor, contate o administrador do sistema para solicitar acesso.
      </p>
    </div>
  );
};

export default AccessDenied;
