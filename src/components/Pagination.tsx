import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true
}) => {
  // Calcular range de itens mostrados
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Opções de itens por página
  const itemsPerPageOptions = [5, 10, 15, 20, 30, 50];
  
  // Gerar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Lógica para mostrar páginas com ellipsis
      if (currentPage <= 3) {
        // Páginas iniciais: 1, 2, 3, 4, ..., última
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Páginas finais: 1, ..., n-3, n-2, n-1, n
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Páginas do meio: 1, ..., atual-1, atual, atual+1, ..., última
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={styles.container}>
      {/* Informação do range */}
      <div style={styles.rangeInfo}>
        <span style={styles.rangeText}>
          Mostrando <strong>{startItem}-{endItem}</strong> de <strong>{totalItems}</strong> registros
        </span>
      </div>
      
      {/* Controles de navegação */}
      <div style={styles.navigation}>
        {/* Botão Primeira Página */}
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === 1 ? styles.disabledButton : styles.enabledButton)
          }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Primeira página"
        >
          <span className="material-symbols-outlined" style={styles.buttonIcon}>
            first_page
          </span>
        </button>
        
        {/* Botão Página Anterior */}
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === 1 ? styles.disabledButton : styles.enabledButton)
          }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Página anterior"
        >
          <span className="material-symbols-outlined" style={styles.buttonIcon}>
            chevron_left
          </span>
        </button>
        
        {/* Números das páginas */}
        <div style={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} style={styles.ellipsis}>
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={page}
                style={{
                  ...styles.pageNumberButton,
                  ...(page === currentPage ? styles.activePageButton : {})
                }}
                onClick={() => onPageChange(page)}
                title={`Ir para página ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        {/* Botão Próxima Página */}
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === totalPages ? styles.disabledButton : styles.enabledButton)
          }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Próxima página"
        >
          <span className="material-symbols-outlined" style={styles.buttonIcon}>
            chevron_right
          </span>
        </button>
        
        {/* Botão Última Página */}
        <button
          style={{
            ...styles.pageButton,
            ...(currentPage === totalPages ? styles.disabledButton : styles.enabledButton)
          }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Última página"
        >
          <span className="material-symbols-outlined" style={styles.buttonIcon}>
            last_page
          </span>
        </button>
      </div>
      
      {/* Seletor de itens por página */}
      {showItemsPerPage && (
        <div style={styles.itemsPerPageSelector}>
          <label style={styles.itemsPerPageLabel}>
            Itens por página:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = parseInt(e.target.value);
              onItemsPerPageChange(newItemsPerPage);
              // Reset para primeira página ao mudar items por página
              onPageChange(1);
            }}
            style={styles.itemsPerPageSelect}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option === 1000 ? 'Todos' : option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    fontSize: '0.875rem',
  },
  rangeInfo: {
    flex: 1,
    minWidth: '200px',
  },
  rangeText: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pageButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  enabledButton: {
    borderColor: '#cbd5e1',
    backgroundColor: 'white',
    color: '#475569',
    '&:hover': {
      backgroundColor: '#f1f5f9',
      borderColor: '#94a3b8',
    },
  },
  disabledButton: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#cbd5e1',
    cursor: 'not-allowed',
  },
  buttonIcon: {
    fontSize: '20px',
  },
  pageNumbers: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    margin: '0 0.5rem',
  },
  pageNumberButton: {
    minWidth: '36px',
    height: '36px',
    padding: '0 0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f1f5f9',
      borderColor: '#94a3b8',
    },
  },
  activePageButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
    },
  },
  ellipsis: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  itemsPerPageSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  itemsPerPageLabel: {
    color: '#64748b',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  itemsPerPageSelect: {
    padding: '0.375rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#475569',
    fontSize: '0.875rem',
    cursor: 'pointer',
    minWidth: '80px',
  },
};

export default Pagination;