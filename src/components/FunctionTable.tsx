import React, { useState } from 'react';
import { useFunctionContext } from '../context/FunctionContext';
import EditFunctionModal from './EditFunctionModal';
import Pagination from './Pagination';

const FunctionTable: React.FC = () => {
  const {
    funcoes,
    removeFunction,
    updateFunction,
    empresaAtualObj,
    projetoAtualObj,
    crAtualObj,
    // 🆕 NOVOS HELPERS DE REQUISITOS
    getRequisitosProjeto,
    getRequisitosFuncionais
  } = useFunctionContext();

  const [functionToEdit, setFunctionToEdit] = useState(null);
  const [functionToDelete, setFunctionToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterRequisito, setFilterRequisito] = useState('all'); // 🆕 NOVO FILTRO
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // 🆕 VERIFICAR SE É PROJETO DE MELHORIA
  const isMelhoria = projetoAtualObj?.tipoContagem === 'melhoria';

  // 🆕 OBTER REQUISITOS
  const requisitos = getRequisitosProjeto();
  const requisitosFuncionais = getRequisitosFuncionais();
  const temRequisitos = requisitos.length > 0;

  // Função para obter a cor do badge de complexidade
  const getComplexityColor = (complexity: string): React.CSSProperties => {
    switch (complexity?.toLowerCase()) {
      case 'baixa':
        return { background: '#d1fae5', color: '#065f46' };
      case 'média':
        return { background: '#fef3c7', color: '#92400e' };
      case 'alta':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#e5e7eb', color: '#374151' };
    }
  };

  // 🆕 CORES PARA TIPO DE MELHORIA (ADD/CHG/DEL/CF)
  const getMelhoriaColor = (tipoMelhoria: string | undefined | null): React.CSSProperties => {
    switch (tipoMelhoria) {
      case 'ADD':
        return { background: '#d1fae5', color: '#065f46', border: '#10b981' };
      case 'CHG':
        return { background: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'DEL':
        return { background: '#fee2e2', color: '#991b1b', border: '#ef4444' };
      case 'CF':
        return { background: '#e0e7ff', color: '#3730a3', border: '#6366f1' };
      default:
        return { background: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
  };

  // 🆕 LABELS PARA TIPO DE MELHORIA
  const getMelhoriaLabel = (tipoMelhoria: string | undefined | null): string => {
    if (!tipoMelhoria) return 'N/A';
    const labels: Record<string, string> = {
      'ADD': 'Adicionada',
      'CHG': 'Alterada',
      'DEL': 'Excluída',
      'CF': 'Convertida'
    };
    return labels[tipoMelhoria] || 'N/A';
  };

  // 🆕 CORES PARA BADGE DE REQUISITO
  const getRequisitoBadgeColor = (tipo: string | undefined): React.CSSProperties => {
    switch (tipo) {
      case 'funcional':
        return { background: '#d1fae5', color: '#065f46', border: '#10b981' };
      case 'nao-funcional':
        return { background: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
      default:
        return { background: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
  };

  // Função para obter a cor do tipo (ATUALIZADA para português)
  const getTypeColor = (type: string): string => {
    const tipoConvertido = {
      'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
      'ILF': 'ALI', 'EIF': 'AIE',
      'EE': 'EE', 'SE': 'SE', 'CE': 'CE',
      'ALI': 'ALI', 'AIE': 'AIE'
    }[type] || type;

    switch (tipoConvertido) {
      case 'EE': return '#059669';
      case 'SE': return '#dc2626';
      case 'CE': return '#d97706';
      case 'ALI': return '#7c3aed';
      case 'AIE': return '#0891b2';
      default: return '#6b7280';
    }
  };

  // Função para obter label do tipo (para exibição)
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'ALI': 'ALI', 'AIE': 'AIE', 'EE': 'EE', 'SE': 'SE', 'CE': 'CE',
      'ILF': 'ALI', 'EIF': 'AIE', 'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
    };

    const tipoConvertido = labels[type] || type;

    const descricoes: Record<string, string> = {
      'ALI': 'Arquivo Lógico Interno',
      'AIE': 'Arquivo Interface Externa',
      'EE': 'Entrada Externa',
      'SE': 'Saída Externa',
      'CE': 'Consulta Externa',
    };

    const descricao = descricoes[tipoConvertido] || '';
    return `${tipoConvertido}${descricao ? ` - ${descricao}` : ''}`;
  };

  // Função para obter informações de origem da função
  const getOrigemInfo = (func: any) => {
    if (func.origem === 'cr') {
      return {
        tipo: 'cr',
        nome: crAtualObj?.titulo || 'CR',
        icone: 'description',
        cor: '#8b5cf6',
        badgeColor: '#ede9fe',
        textColor: '#7c3aed'
      };
    }

    return {
      tipo: 'projeto',
      nome: projetoAtualObj?.nome || 'Projeto',
      icone: 'folder',
      cor: '#3b82f6',
      badgeColor: '#dbeafe',
      textColor: '#1d4ed8'
    };
  };

  // 🆕 TOGGLE TIPO DE MELHORIA (ADD/CHG/DEL/CF)
  const handleToggleMelhoria = (func: any) => {
    const ciclos = ['ADD', 'CHG', 'DEL', 'CF', null];
    const atual = func.tipoMelhoria || null;
    const proximoIndex = (ciclos.indexOf(atual) + 1) % ciclos.length;
    const proximo = ciclos[proximoIndex];

    updateFunction(func.id, { tipoMelhoria: proximo });
  };

  // 🆕 FILTRAR FUNÇÕES (incluindo filtro de requisito)
  const filteredFunctions = funcoes.filter(func => {
    let tipo = func.tipo || func.type;
    const mapa: Record<string, string> = { 'EI': 'EE', 'EO': 'SE', 'EQ': 'CE', 'ILF': 'ALI', 'EIF': 'AIE' };
    tipo = mapa[tipo] || tipo;

    // Filtro por tipo
    if (filterType !== 'all' && tipo !== filterType) return false;

    // 🆕 Filtro por requisito
    if (filterRequisito !== 'all') {
      if (filterRequisito === 'sem-requisito') {
        if (func.requisitoId) return false;
      } else {
        if (func.requisitoId !== filterRequisito) return false;
      }
    }

    return true;
  });

  // Ordenar funções
  const sortedFunctions = [...filteredFunctions].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'nome':
        valueA = a.nome || a.name;
        valueB = b.nome || b.name;
        break;
      case 'tipo':
        const tipoA = a.tipo || a.type;
        const tipoB = b.tipo || b.type;
        valueA = getTypeLabel(tipoA);
        valueB = getTypeLabel(tipoB);
        break;
      case 'pf':
        valueA = a.pf || 0;
        valueB = b.pf || 0;
        break;
      case 'complexidade':
        valueA = a.complexidade || a.complexity || '';
        valueB = b.complexidade || b.complexity || '';
        break;
      case 'numeroFuncao':
        valueA = a.numeroFuncao || '000';
        valueB = b.numeroFuncao || '000';
        break;
      case 'requisito':
        valueA = a.requisitoId || 'ZZZ';
        valueB = b.requisitoId || 'ZZZ';
        break;
      default:
        valueA = a.nome || a.name;
        valueB = b.nome || b.name;
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Cálculos de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedFunctions = sortedFunctions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFunctions.length / itemsPerPage);

  // Calcular total PF
  const currentPagePF = paginatedFunctions.reduce((total, func) => total + (func.pf || 0), 0);
  const totalFilteredPF = sortedFunctions.reduce((total, func) => total + (func.pf || 0), 0);

  // 🆕 CÁLCULOS ESPECÍFICOS DE MELHORIA
  const calcularMelhoriaStats = () => {
    if (!isMelhoria) return null;

    const stats: Record<string, { count: number, pf: number }> = {
      ADD: { count: 0, pf: 0 },
      CHG: { count: 0, pf: 0 },
      DEL: { count: 0, pf: 0 },
      CF: { count: 0, pf: 0 }
    };

    funcoes.forEach(func => {
      const tipo = func.tipoMelhoria;
      if (tipo && stats[tipo]) {
        stats[tipo].count++;
        stats[tipo].pf += func.pf || 0;
      }
    });

    const totalMelhoria = (stats.ADD.pf + stats.CHG.pf + stats.DEL.pf) - stats.CF.pf;

    return { ...stats, totalMelhoria };
  };

  const melhoriaStats = calcularMelhoriaStats();

  // 🆕 ESTATÍSTICAS DE REQUISITOS
  const calcularEstatisticasRequisitos = () => {
    const totalFuncoes = funcoes.length;
    const funcoesComRequisito = funcoes.filter(f => f.requisitoId).length;
    const funcoesSemRequisito = totalFuncoes - funcoesComRequisito;
    const percentualVinculado = totalFuncoes > 0 ? Math.round((funcoesComRequisito / totalFuncoes) * 100) : 0;

    return {
      totalFuncoes,
      funcoesComRequisito,
      funcoesSemRequisito,
      percentualVinculado
    };
  };

  const statsRequisitos = calcularEstatisticasRequisitos();

  // Handler para editar função
  const handleEdit = (func: any) => {
    setFunctionToEdit(func);
  };

  // Handler para ordenação
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Obter ícone de ordenação
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return 'unfold_more';
    return sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  // Handler para mudar filtro
  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  // 🆕 Handler para filtro de requisito
  const handleFilterRequisitoChange = (newFilter: string) => {
    setFilterRequisito(newFilter);
    setCurrentPage(1);
  };

  // Função auxiliar para obter TD
  const getTDValue = (func: any) => {
    return func.td || func.det || 0;
  };

  // Função auxiliar para obter AR/TR
  const getARTRValue = (func: any) => {
    return func.arTr || func.ret || 0;
  };

  // Função para determinar se é AR ou TR
  const getARTRLabel = (tipo: string): string => {
    const mapa: Record<string, string> = {
      'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
      'ILF': 'ALI', 'EIF': 'AIE',
      'EE': 'EE', 'SE': 'SE', 'CE': 'CE',
      'ALI': 'ALI', 'AIE': 'AIE'
    };
    const tipoConvertido = mapa[tipo] || tipo;

    if (['ALI', 'AIE', 'ILF', 'EIF'].includes(tipoConvertido)) {
      return 'TR';
    } else {
      return 'AR';
    }
  };

  // 🆕 OBTER INFO DO REQUISITO
  const getRequisitoInfo = (requisitoId: string | undefined | null) => {
    if (!requisitoId) return null;
    return requisitos.find(r => r.id === requisitoId);
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const stats: any = {
      total: funcoes.length,
      projeto: 0,
      cr: 0,
      pfTotal: funcoes.reduce((total, func) => total + (func.pf || 0), 0),
      porTipo: { EE: 0, SE: 0, CE: 0, ALI: 0, AIE: 0 }
    };

    funcoes.forEach(func => {
      const origemInfo = getOrigemInfo(func);
      if (origemInfo.tipo === 'projeto') {
        stats.projeto++;
      } else {
        stats.cr++;
      }

      const tipo = func.tipo || func.type;
      const tipoConvertido: Record<string, string> = {
        'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
        'ILF': 'ALI', 'EIF': 'AIE',
        'EE': 'EE', 'SE': 'SE', 'CE': 'CE',
        'ALI': 'ALI', 'AIE': 'AIE'
      };
      const tipoPadrao = tipoConvertido[tipo] || tipo;

      if (stats.porTipo[tipoPadrao] !== undefined) {
        stats.porTipo[tipoPadrao]++;
      }
    });

    return stats;
  };

  const estatisticas = calcularEstatisticas();

  // 🆕 ESTILOS DINÂMICOS
  const getDynamicStyles = () => ({
    tableMinWidth: isMelhoria || temRequisitos ? '1100px' : '900px'
  });

  const dynamicStyles = getDynamicStyles();

  return (
    <div style={styles.container}>
      {/* Modal de Edição */}
      {functionToEdit && (
        <EditFunctionModal
          function={functionToEdit}
          onClose={() => setFunctionToEdit(null)}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {functionToDelete && (
        <div style={styles.deleteModalOverlay}>
          <div style={styles.deleteModal}>
            <h3 style={styles.deleteModalTitle}>Confirmar Exclusão</h3>
            <p style={styles.deleteModalText}>
              Tem certeza que deseja excluir a função <strong>{functionToDelete.nome}</strong>?
            </p>
            <p style={styles.deleteModalWarning}>Esta ação não pode ser desfeita.</p>
            <div style={styles.deleteModalActions}>
              <button
                style={styles.deleteModalCancel}
                onClick={() => setFunctionToDelete(null)}
              >
                Cancelar
              </button>
              <button
                style={styles.deleteModalConfirm}
                onClick={() => {
                  removeFunction(functionToDelete.id);
                  setFunctionToDelete(null);
                  if (paginatedFunctions.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho da tabela com filtros */}
      <div style={styles.tableHeader}>
        <div style={styles.headerTop}>
          <h3 style={styles.tableTitle}>
            <span className="material-symbols-outlined" style={styles.tableIcon}>
              table_chart
            </span>
            Análise de Funções
            {/* Badge de Tipo de Contagem */}
            {projetoAtualObj?.tipoContagem && (
              <span style={{
                ...styles.tipoContagemBadge,
                backgroundColor: projetoAtualObj.tipoContagem === 'melhoria' ? '#fef3c7' :
                  projetoAtualObj.tipoContagem === 'aplicacao' ? '#dbeafe' : '#d1fae5',
                color: projetoAtualObj.tipoContagem === 'melhoria' ? '#92400e' :
                  projetoAtualObj.tipoContagem === 'aplicacao' ? '#1e40af' : '#065f46',
              }}>
                {projetoAtualObj.tipoContagem === 'melhoria' ? 'Melhoria' :
                  projetoAtualObj.tipoContagem === 'aplicacao' ? 'Aplicação' : 'Desenvolvimento'}
              </span>
            )}
          </h3>

          <div style={styles.headerStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total:</span>
              <span style={styles.statValue}>{estatisticas.total}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>PF Total:</span>
              <span style={styles.statValue}>{estatisticas.pfTotal}</span>
            </div>
            {estatisticas.projeto > 0 && (
              <div style={styles.statItem}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '14px',
                  color: '#3b82f6',
                  marginRight: '4px'
                }}>
                  folder
                </span>
                <span style={styles.statValue}>{estatisticas.projeto}</span>
              </div>
            )}
            {estatisticas.cr > 0 && (
              <div style={styles.statItem}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '14px',
                  color: '#8b5cf6',
                  marginRight: '4px'
                }}>
                  description
                </span>
                <span style={styles.statValue}>{estatisticas.cr}</span>
              </div>
            )}
          </div>
        </div>

        {/* 🆕 PAINEL DE ESTATÍSTICAS DE REQUISITOS */}
        {temRequisitos && (
          <div style={styles.requisitosStatsPanel}>
            <div style={styles.requisitosStatsHeader}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803d' }}>
                task_alt
              </span>
              <span style={styles.requisitosStatsTitle}>Cobertura de Requisitos</span>
              <span style={{
                ...styles.requisitosStatsValue,
                color: statsRequisitos.percentualVinculado === 100 ? '#059669' :
                  statsRequisitos.percentualVinculado >= 50 ? '#d97706' : '#dc2626'
              }}>
                {statsRequisitos.percentualVinculado}%
              </span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${statsRequisitos.percentualVinculado}%`,
                  backgroundColor: statsRequisitos.percentualVinculado === 100 ? '#22c55e' :
                    statsRequisitos.percentualVinculado >= 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div style={styles.requisitosStatsDetails}>
              <span>{statsRequisitos.funcoesComRequisito} vinculadas</span>
              <span>•</span>
              <span style={{ color: statsRequisitos.funcoesSemRequisito > 0 ? '#dc2626' : '#6b7280' }}>
                {statsRequisitos.funcoesSemRequisito} sem vínculo
              </span>
            </div>
          </div>
        )}

        {/* 🆕 PAINEL DE MELHORIA */}
        {isMelhoria && melhoriaStats && (
          <div style={styles.melhoriaPanel}>
            <div style={styles.melhoriaTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                upgrade
              </span>
              Contagem de Melhoria (Enhancement)
            </div>
            <div style={styles.melhoriaGrid}>
              <div style={{ ...styles.melhoriaStat, backgroundColor: '#d1fae5' }}>
                <div style={{ ...styles.melhoriaStatValue, color: '#065f46' }}>
                  {melhoriaStats.ADD.pf} PF
                </div>
                <div style={{ ...styles.melhoriaStatLabel, color: '#065f46' }}>
                  ADD ({melhoriaStats.ADD.count})
                </div>
              </div>
              <div style={{ ...styles.melhoriaStat, backgroundColor: '#fef3c7' }}>
                <div style={{ ...styles.melhoriaStatValue, color: '#92400e' }}>
                  {melhoriaStats.CHG.pf} PF
                </div>
                <div style={{ ...styles.melhoriaStatLabel, color: '#92400e' }}>
                  CHG ({melhoriaStats.CHG.count})
                </div>
              </div>
              <div style={{ ...styles.melhoriaStat, backgroundColor: '#fee2e2' }}>
                <div style={{ ...styles.melhoriaStatValue, color: '#991b1b' }}>
                  {melhoriaStats.DEL.pf} PF
                </div>
                <div style={{ ...styles.melhoriaStatLabel, color: '#991b1b' }}>
                  DEL ({melhoriaStats.DEL.count})
                </div>
              </div>
              <div style={{ ...styles.melhoriaStat, backgroundColor: '#e0e7ff' }}>
                <div style={{ ...styles.melhoriaStatValue, color: '#3730a3' }}>
                  {melhoriaStats.CF.pf} PF
                </div>
                <div style={{ ...styles.melhoriaStatLabel, color: '#3730a3' }}>
                  CF ({melhoriaStats.CF.count})
                </div>
              </div>
              <div style={{ ...styles.melhoriaStatTotal, backgroundColor: '#f3f4f6' }}>
                <div style={{ ...styles.melhoriaStatValue, color: '#0f172a' }}>
                  {melhoriaStats.totalMelhoria} PF
                </div>
                <div style={{ ...styles.melhoriaStatLabel, color: '#374151' }}>
                  Total Melhoria
                </div>
                <div style={styles.melhoriaFormula}>
                  (ADD + CHG + DEL) - CF
                </div>
              </div>
            </div>
            <div style={styles.melhoriaHelp}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                info
              </span>
              Clique no badge de classificação na tabela para alternar entre ADD, CHG, DEL e CF
            </div>
          </div>
        )}

        <div style={styles.headerActions}>
          {/* Filtro por tipo */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filtrar por tipo:</label>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Todos os tipos</option>
              <option value="EE">EE - Entrada Externa</option>
              <option value="SE">SE - Saída Externa</option>
              <option value="CE">CE - Consulta Externa</option>
              <option value="ALI">ALI - Arquivo Lógico Interno</option>
              <option value="AIE">AIE - Arquivo de Interface Externa</option>
            </select>
          </div>

          {/* 🆕 FILTRO POR REQUISITO */}
          {temRequisitos && (
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Filtrar por requisito:</label>
              <select
                value={filterRequisito}
                onChange={(e) => handleFilterRequisitoChange(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">Todos os requisitos</option>
                <option value="sem-requisito">⚠️ Sem requisito vinculado</option>
                {requisitosFuncionais.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.id} - {req.descricao.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          <span style={styles.countBadge}>
            {sortedFunctions.length} {sortedFunctions.length === 1 ? 'item' : 'itens'}
            {filterType !== 'all' && ` (filtrado: ${getTypeLabel(filterType).split(' - ')[0]})`}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div style={styles.tableWrapper}>
        <table style={{ ...styles.table, minWidth: dynamicStyles.tableMinWidth }}>
          <thead>
            <tr style={styles.tableHeadRow}>
              {/* 🆕 COLUNA NÚMERO (NOVA) */}
              <th style={{ ...styles.tableHeaderCell, width: '80px' }}>
                <button
                  style={styles.sortButton}
                  onClick={() => handleSort('numeroFuncao')}
                >
                  Número
                  <span className="material-symbols-outlined" style={styles.sortIcon}>
                    {getSortIcon('numeroFuncao')}
                  </span>
                </button>
              </th>

              {/* 🆕 COLUNA FUNÇÕES */}
              <th style={styles.tableHeaderCell}>
                <button
                  style={styles.sortButton}
                  onClick={() => handleSort('nome')}
                >
                  Funções
                  <span className="material-symbols-outlined" style={styles.sortIcon}>
                    {getSortIcon('nome')}
                  </span>
                </button>
              </th>

              {/* 🆕 COLUNA DE REQUISITOS (RENOMEADA) */}
              {temRequisitos && (
                <th style={styles.tableHeaderCell}>
                  <button
                    style={styles.sortButton}
                    onClick={() => handleSort('requisito')}
                  >
                    Requisitos
                    <span className="material-symbols-outlined" style={styles.sortIcon}>
                      {getSortIcon('requisito')}
                    </span>
                  </button>
                </th>
              )}

              {/* 🆕 COLUNA DE TIPO */}
              <th style={styles.tableHeaderCell}>
                <button
                  style={styles.sortButton}
                  onClick={() => handleSort('tipo')}
                >
                  Tipo
                  <span className="material-symbols-outlined" style={styles.sortIcon}>
                    {getSortIcon('tipo')}
                  </span>
                </button>
              </th>

              {/* 🆕 COLUNA PROJETO (ANTIGA ORIGEM) */}
              <th style={styles.tableHeaderCell}>Projeto</th>

              {/* 🆕 COLUNA DE MELHORIA (CONDICIONAL) */}
              {isMelhoria && (
                <th style={{ ...styles.tableHeaderCell, textAlign: 'center', width: '100px' }}>
                  Melhoria
                </th>
              )}

              {/* COLUNAS TÉCNICAS */}
              <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>TD</th>
              <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>AR/TR</th>

              <th style={styles.tableHeaderCell}>
                <button
                  style={styles.sortButton}
                  onClick={() => handleSort('complexidade')}
                >
                  Complexidade
                  <span className="material-symbols-outlined" style={styles.sortIcon}>
                    {getSortIcon('complexidade')}
                  </span>
                </button>
              </th>

              <th style={styles.tableHeaderCell}>
                <button
                  style={styles.sortButton}
                  onClick={() => handleSort('pf')}
                >
                  PF
                  <span className="material-symbols-outlined" style={styles.sortIcon}>
                    {getSortIcon('pf')}
                  </span>
                </button>
              </th>

              <th style={styles.tableHeaderCell}>
                Valor
              </th>

              <th style={styles.tableHeaderCell}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFunctions.length === 0 ? (
              <tr>
                <td
                  colSpan={isMelhoria ? (temRequisitos ? "12" : "11") : (temRequisitos ? "11" : "10")}
                  style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem', display: 'block' }}>
                    {filterType === 'all' && filterRequisito === 'all' ? 'list_alt' : 'filter_alt'}
                  </span>
                  {filterType === 'all' && filterRequisito === 'all'
                    ? 'Nenhuma função cadastrada ainda.'
                    : 'Nenhuma função encontrada com esse filtro.'}
                  <br />
                  <span style={{ fontSize: '0.875rem' }}>
                    {filterType === 'all' && filterRequisito === 'all'
                      ? 'Use o formulário acima para adicionar funções.'
                      : 'Tente alterar o filtro ou adicione novas funções.'}
                  </span>
                </td>
              </tr>
            ) : (
              paginatedFunctions.map((func) => {
                const tipoFuncao = func.tipo || func.type;
                const complexidade = func.complexidade || func.complexity;
                const td = getTDValue(func);
                const arTr = getARTRValue(func);
                const arTrLabel = getARTRLabel(tipoFuncao);
                const complexityColor = getComplexityColor(complexidade);
                const typeColor = getTypeColor(tipoFuncao);
                const tipoLabel = getTypeLabel(tipoFuncao);
                const origemInfo = getOrigemInfo(func);

                // 🆕 COR E LABEL DE MELHORIA
                const melhoriaColor = getMelhoriaColor(func.tipoMelhoria);
                const melhoriaLabel = getMelhoriaLabel(func.tipoMelhoria);

                // 🆕 INFO DO REQUISITO
                const requisitoInfo = getRequisitoInfo(func.requisitoId);

                return (
                  <tr key={func.id} style={styles.tableRow}>
                    {/* 🆕 CÉLULA NÚMERO */}
                    <td style={{ ...styles.tableCell, fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {func.numeroFuncao || '-'}
                    </td>

                    {/* Nome (Funções) */}
                    <td style={styles.tableCell}>
                      <div style={styles.nameCell}>
                        <p style={styles.functionName}>{func.nome || func.name}</p>
                      </div>
                    </td>

                    {/* 🆕 CÉLULA DE REQUISITOS */}
                    {temRequisitos && (
                      <td style={styles.tableCell}>
                        {func.requisitoId ? (
                          <div style={{ padding: '4px 0' }}>
                            {func.requisitoId}{requisitoInfo?.nome ? ` - ${requisitoInfo.nome}` : ''}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum</span>
                        )}
                      </td>
                    )}

                    {/* Tipo */}
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.typeBadge,
                        backgroundColor: `${typeColor}20`,
                        color: typeColor,
                        border: `1px solid ${typeColor}40`,
                      }}
                        title={tipoLabel}
                      >
                        {tipoLabel.split(' - ')[0]}
                      </span>
                    </td>

                    {/* 🆕 Projeto (Anteriormente Origem) */}
                    <td style={styles.tableCell}>
                      <div style={{ padding: '4px 0' }}>
                        {origemInfo.nome}
                      </div>
                    </td>

                    {/* 🆕 CÉLULA DE MELHORIA (CONDICIONAL) */}
                    {isMelhoria && (
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleMelhoria(func)}
                          style={{
                            ...styles.melhoriaBadge,
                            backgroundColor: melhoriaColor.background,
                            color: melhoriaColor.color,
                            border: `2px solid ${melhoriaColor.border}`,
                          }}
                          title="Clique para alternar: ADD → CHG → DEL → CF → N/A"
                        >
                          {func.tipoMelhoria || '-'}
                          <span style={styles.melhoriaBadgeLabel}>
                            {melhoriaLabel}
                          </span>
                        </button>
                      </td>
                    )}

                    {/* TD */}
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <span style={styles.numberValue}>{td}</span>
                    </td>

                    {/* AR/TR */}
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <span style={styles.numberValue}>{arTr}</span>
                      <div style={styles.arTrLabel}>
                        {arTrLabel}
                      </div>
                    </td>

                    {/* Complexidade */}
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.complexityBadge,
                        backgroundColor: complexityColor.background,
                        color: complexityColor.color,
                      }}>
                        {complexidade || 'Não calculada'}
                      </span>
                    </td>

                    {/* PF */}
                    <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                      <span style={styles.pfValue}>{func.pf || 0}</span>
                      <span style={styles.pfLabel}> PF</span>
                    </td>

                    {/* Valor */}
                    <td style={styles.tableCell}>
                      <span style={styles.pfValue}>
                        R$ {(func.pf * (empresaAtualObj?.valorPF || 0)).toFixed(2)}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={styles.tableCell}>
                      <div style={styles.actionsCell}>
                        <button
                          style={styles.editButton}
                          onClick={() => handleEdit(func)}
                          title="Editar função"
                        >
                          <span className="material-symbols-outlined" style={styles.editIcon}>
                            edit
                          </span>
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => setFunctionToDelete(func)}
                          title="Excluir função"
                        >
                          <span className="material-symbols-outlined" style={styles.deleteIcon}>
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div >

      {/* Paginação */}
      {
        sortedFunctions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedFunctions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
          />
        )
      }

      {/* Rodapé com totais */}
      {
        sortedFunctions.length > 0 && (
          <div style={styles.tableFooter}>
            <div style={styles.footerInfo}>
              <div style={styles.totalSection}>
                <span style={styles.totalLabel}>Total PF (página atual):</span>
                <span style={styles.totalValue}>{currentPagePF} PF</span>
              </div>
              <div style={styles.totalSection}>
                <span style={styles.totalLabel}>Total PF (todos filtrados):</span>
                <span style={styles.totalValue}>{totalFilteredPF} PF</span>
              </div>
              {/* 🆕 TOTAL DE MELHORIA */}
              {isMelhoria && melhoriaStats && (
                <div style={{ ...styles.totalSection, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={styles.totalLabel}>Total Melhoria:</span>
                  <span style={{ ...styles.totalValue, color: '#0f172a', fontSize: '1.1rem' }}>
                    {melhoriaStats.totalMelhoria} PF
                  </span>
                </div>
              )}
              <div style={styles.pageInfo}>
                Página {currentPage} de {totalPages}
                {filterType !== 'all' && ` • Tipo: ${getTypeLabel(filterType).split(' - ')[0]}`}
                {filterRequisito !== 'all' && ` • Requisito: ${filterRequisito === 'sem-requisito' ? 'Sem vínculo' : filterRequisito}`}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

// ESTILOS ATUALIZADOS
const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    position: 'relative',
  },
  tableHeader: {
    padding: '1.5rem 1.5rem 1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tableTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#0f172a',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
  },
  tableIcon: {
    color: '#1246e2',
    fontSize: '24px',
  },
  tipoContagemBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginLeft: '8px',
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  statLabel: {
    fontWeight: '500',
  },
  statValue: {
    fontWeight: '600',
    color: '#0f172a',
  },
  // 🆕 PAINEL DE ESTATÍSTICAS DE REQUISITOS
  requisitosStatsPanel: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  requisitosStatsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '0.5rem',
  },
  requisitosStatsTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#15803d',
    flex: 1,
  },
  requisitosStatsValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#dcfce7',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  requisitosStatsDetails: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  // 🆕 PAINEL DE MELHORIA
  melhoriaPanel: {
    backgroundColor: '#fefce8',
    border: '1px solid #fde047',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  melhoriaTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#854d0e',
    marginBottom: '0.75rem',
  },
  melhoriaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '0.5rem',
  },
  melhoriaStat: {
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
  },
  melhoriaStatTotal: {
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
    border: '2px solid #0f172a',
  },
  melhoriaStatValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  melhoriaStatLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    marginTop: '2px',
  },
  melhoriaFormula: {
    fontSize: '0.625rem',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic',
  },
  melhoriaHelp: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '0.75rem',
    fontSize: '0.75rem',
    color: '#854d0e',
    fontStyle: 'italic',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },
  filterSelect: {
    padding: '0.375rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#475569',
    backgroundColor: 'white',
    cursor: 'pointer',
    minWidth: '180px',
  },
  countBadge: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    marginLeft: 'auto',
  },
  tableWrapper: {
    overflowX: 'auto',
    minHeight: '200px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableHeaderCell: {
    padding: '1rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  sortButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontWeight: 'inherit',
    fontSize: 'inherit',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  sortIcon: {
    fontSize: '16px',
    opacity: 0.7,
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    verticalAlign: 'middle',
  },
  // 🆕 BADGE DE MELHORIA NA TABELA
  melhoriaBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    minWidth: '60px',
    transition: 'all 0.2s',
  },
  melhoriaBadgeLabel: {
    fontSize: '0.625rem',
    fontWeight: 'normal',
    marginTop: '2px',
    opacity: 0.8,
  },
  // 🆕 BADGE DE REQUISITO
  requisitoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'help',
  },
  requisitoBadgeText: {
    fontFamily: 'monospace',
  },
  semRequisitoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a',
  },
  nameCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  functionName: {
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
    marginBottom: '0.25rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },
  functionId: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: 0,
  },
  typeBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
    cursor: 'default',
    whiteSpace: 'nowrap',
  },
  origemBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'default',
    whiteSpace: 'nowrap',
  },
  numberValue: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '0.875rem',
    display: 'block',
  },
  arTrLabel: {
    fontSize: '0.625rem',
    color: '#94a3b8',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  complexityBadge: {
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'default',
    whiteSpace: 'nowrap',
  },
  pfValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1246e2',
  },
  pfLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginLeft: '0.25rem',
  },
  actionsCell: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-start',
  },
  editButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#3b82f6',
    flexShrink: 0,
  },
  editIcon: {
    fontSize: '16px',
  },
  deleteButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#ef4444',
    flexShrink: 0,
  },
  deleteIcon: {
    fontSize: '16px',
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  totalSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  totalLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  totalValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1246e2',
  },
  pageInfo: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  deleteModalOverlay: {
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
  deleteModal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  deleteModalTitle: {
    margin: '0 0 1rem 0',
    color: '#0f172a',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  deleteModalText: {
    margin: '0 0 1rem 0',
    color: '#475569',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  deleteModalWarning: {
    margin: '0 0 1.5rem 0',
    color: '#dc2626',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  deleteModalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  deleteModalCancel: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  deleteModalConfirm: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default FunctionTable;