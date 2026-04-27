import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

const HeaderSelectors = () => {
  const {
    empresas,
    empresaAtual,
    projetoAtual,
    selecionarEmpresa,
    selecionarProjeto,
    empresaAtualObj,
    projetoAtualObj
  } = useFunctionContext();

  const [empresasOptions, setEmpresasOptions] = useState([]);

  const [projetosOptions, setProjetosOptions] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Atualizar opções de empresas
  useEffect(() => {
    if (empresas && empresas.length > 0) {
      const options = empresas.map((empresa, index) => ({
        value: empresa.id,
        label: empresa.nome || `Empresa ${index + 1}`
      }));
      setEmpresasOptions(options);
    } else {
      setEmpresasOptions([]);
    }
  }, [empresas]);

  // Atualizar opções de projetos
  useEffect(() => {
    if (empresaAtualObj && empresaAtualObj.projetos) {
      const options = empresaAtualObj.projetos.map((projeto, index) => ({
        value: projeto.id,
        label: projeto.nome || `Projeto ${index + 1}`
      }));
      setProjetosOptions(options);
    } else {
      setProjetosOptions([]);
    }
  }, [empresaAtualObj]);



  // Estado vazio - sem empresas
  if (!empresas || empresas.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <span className="material-symbols-outlined" style={styles.emptyIcon}>
          business
        </span>
        <span style={styles.emptyText}>
          {isMobile ? 'Sem empresas' : 'Nenhuma empresa cadastrada'}
        </span>
      </div>
    );
  }

  const handleEmpresaChange = (e) => {
    const empresaId = e.target.value;
    if (empresaId) {
      // Encontrar a empresa pelo ID
      const empresa = empresas.find(emp => emp.id === empresaId);
      if (empresa) {
        selecionarEmpresa(empresaId);
      }
    }
  };

  const handleProjetoChange = (e) => {
    const projetoId = e.target.value;
    if (projetoId && empresaAtualObj) {
      // Encontrar o projeto pelo ID
      const projeto = empresaAtualObj.projetos.find(proj => proj.id === projetoId);
      if (projeto) {
        selecionarProjeto(projetoId);
      }
    }
  };



  // Função para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Encontrar valores atuais baseados em IDs
  const empresaAtualValue = empresaAtual !== null && empresaAtualObj
    ? empresaAtualObj.id
    : '';

  const projetoAtualValue = projetoAtual !== null && projetoAtualObj
    ? projetoAtualObj.id
    : '';



  return (
    <div style={isMobile ? styles.containerMobile : styles.container}>
      {/* Seletor de Empresa */}
      <div style={styles.selectorGroup}>
        <div style={styles.selectorLabel}>
          <span className="material-symbols-outlined" style={styles.selectorIcon}>
            apartment
          </span>
          {!isMobile && <span>Empresa</span>}
        </div>
        <select
          value={empresaAtualValue}
          onChange={handleEmpresaChange}
          style={styles.select}
          disabled={empresasOptions.length === 0}
        >
          <option value="">
            {isMobile ? 'Empresa...' : 'Selecione uma empresa'}
          </option>
          {empresasOptions.map(option => (
            <option key={option.value} value={option.value}>
              {isMobile ? truncateText(option.label, 15) : option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Separador condicional */}
      {empresaAtual !== null && projetosOptions.length > 0 && !isMobile && (
        <div style={styles.separator}>
          <span className="material-symbols-outlined" style={styles.separatorIcon}>
            chevron_right
          </span>
        </div>
      )}

      {/* Seletor de Projeto - só mostra se tem empresa */}
      {empresaAtual !== null && (
        <div style={styles.selectorGroup}>
          <div style={styles.selectorLabel}>
            <span className="material-symbols-outlined" style={styles.selectorIcon}>
              folder
            </span>
            {!isMobile && <span>Projeto</span>}
          </div>
          <select
            value={projetoAtualValue}
            onChange={handleProjetoChange}
            style={styles.select}
            disabled={projetosOptions.length === 0}
          >
            <option value="">
              {isMobile ? 'Projeto...' : 'Selecione um projeto'}
            </option>
            {projetosOptions.map(option => (
              <option key={option.value} value={option.value}>
                {isMobile ? truncateText(option.label, 15) : option.label}
              </option>
            ))}
          </select>
        </div>
      )}



      {/* Indicador simples para mobile */}
      {isMobile && empresaAtual !== null && (
        <div style={styles.mobileIndicator}>
          <span style={styles.mobileText}>
            {empresaAtualObj?.nome && truncateText(empresaAtualObj.nome, 20)}
            {projetoAtualObj?.nome && ` • ${truncateText(projetoAtualObj.nome, 15)}`}
          </span>
        </div>
      )}
    </div>
  );
};

// ESTILOS SIMPLIFICADOS - CSS-in-JS
const styles = {
  // Containers
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto'
  },
  containerMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto'
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
    fontSize: '14px'
  },
  emptyIcon: {
    fontSize: '18px',
    color: '#94a3b8'
  },
  emptyText: {
    fontSize: '14px'
  },

  // Grupos de seletores
  selectorGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '150px',
    flex: '1 1 auto'
  },
  selectorLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  selectorIcon: {
    fontSize: '16px',
    color: '#64748b'
  },

  // Selects
  select: {
    padding: '8px 12px',
    paddingRight: '32px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: 'white',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '16px',
    width: '100%',
    '&:hover': {
      borderColor: '#9ca3af'
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    '&:disabled': {
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      cursor: 'not-allowed'
    }
  },

  // Separador
  separator: {
    display: 'flex',
    alignItems: 'center',
    color: '#cbd5e1',
    padding: '0 5px'
  },
  separatorIcon: {
    fontSize: '20px',
    opacity: 0.5
  },

  // Mobile indicator
  mobileIndicator: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    marginTop: '4px',
    textAlign: 'center'
  },
  mobileText: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '500'
  }
};

export default HeaderSelectors;