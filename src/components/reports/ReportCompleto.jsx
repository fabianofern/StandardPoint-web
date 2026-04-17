import React, { useState, useEffect, useMemo } from 'react';
import { useFunctionContext } from '../../context/FunctionContext';
import { calcularMetricasSquad } from '../../utils/squadUtils';

const ReportCompleto = ({ onFilteredDataChange }) => {
    const {
        empresaAtualObj,
        projetoAtualObj,
        funcoes,
        totals
    } = useFunctionContext();

    const {
        esforcoTotal,
        previsaoEntrega
    } = calcularMetricasSquad(projetoAtualObj, empresaAtualObj, totals);

    const [filters, setFilters] = useState({
        tipo: 'all',
        complexidade: 'all',
        requisito: 'all',
        dataInicio: '',
        dataFim: '',
        search: ''
    });

    if (!projetoAtualObj) return null;

    // Obter lista única de requisitos para o filtro
    const requisitosOptions = useMemo(() => {
        const reqs = new Set(funcoes.map(f => f.requisitoId).filter(Boolean));
        return Array.from(reqs).sort();
    }, [funcoes]);

    // Filtragem dos dados
    const filteredData = useMemo(() => {
        return funcoes.filter(func => {
            // Filtro por Texto (Search)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchName = func.nome.toLowerCase().includes(searchLower);
                const matchDesc = (func.descricao || '').toLowerCase().includes(searchLower);
                const matchReq = (func.requisitoId || '').toLowerCase().includes(searchLower);
                if (!matchName && !matchDesc && !matchReq) return false;
            }

            // Filtro por Tipo
            if (filters.tipo !== 'all' && func.tipo !== filters.tipo) return false;

            // Filtro por Complexidade
            if (filters.complexidade !== 'all' && func.complexidade !== filters.complexidade) return false;

            // Filtro por Requisito
            if (filters.requisito !== 'all' && func.requisitoId !== filters.requisito) {
                if (filters.requisito === 'sem_vinculo' && func.requisitoId) return false;
                if (filters.requisito !== 'sem_vinculo' && func.requisitoId !== filters.requisito) return false;
            }

            // Filtro por Data (Criação)
            if (filters.dataInicio) {
                const dateFunc = new Date(func.dataCriacao).setHours(0, 0, 0, 0);
                const dateFilter = new Date(filters.dataInicio).setHours(0, 0, 0, 0);
                if (dateFunc < dateFilter) return false;
            }
            if (filters.dataFim) {
                const dateFunc = new Date(func.dataCriacao).setHours(0, 0, 0, 0);
                const dateFilter = new Date(filters.dataFim).setHours(0, 0, 0, 0);
                if (dateFunc > dateFilter) return false;
            }

            return true;
        });
    }, [funcoes, filters]);

    // Notificar pai sobre mudanças nos dados filtrados
    useEffect(() => {
        if (onFilteredDataChange) {
            onFilteredDataChange(filteredData);
        }
    }, [filteredData, onFilteredDataChange]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="report-content" style={{ padding: '2rem' }}>
            <div style={styles.header}>
                <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Extração de Dados e Filtros Avançados</h2>
                <p style={{ color: '#64748b' }}>
                    Explore, filtre e exporte os dados brutos de <strong>{projetoAtualObj.nome}</strong>
                </p>
            </div>

            {/* Área de Filtros */}
            <div style={styles.filtersContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Buscar</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Nome, Descrição ou Req..."
                        style={styles.input}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.label}>Tipo de Função</label>
                    <select name="tipo" value={filters.tipo} onChange={handleFilterChange} style={styles.select}>
                        <option value="all">Todos</option>
                        <option value="ALI">ALI</option>
                        <option value="AIE">AIE</option>
                        <option value="EE">EE</option>
                        <option value="SE">SE</option>
                        <option value="CE">CE</option>
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.label}>Complexidade</label>
                    <select name="complexidade" value={filters.complexidade} onChange={handleFilterChange} style={styles.select}>
                        <option value="all">Todas</option>
                        <option value="Baixa">Baixa</option>
                        <option value="Media">Média</option>
                        <option value="Alta">Alta</option>
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.label}>Requisito</label>
                    <select name="requisito" value={filters.requisito} onChange={handleFilterChange} style={styles.select}>
                        <option value="all">Todos</option>
                        <option value="sem_vinculo">Sem Vínculo</option>
                        {requisitosOptions.map(req => (
                            <option key={req} value={req}>{req}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.label}>Criado após</label>
                    <input
                        type="date"
                        name="dataInicio"
                        value={filters.dataInicio}
                        onChange={handleFilterChange}
                        style={styles.input}
                    />
                </div>
            </div>

            {/* Resumo dos Filtros */}
            <div style={styles.resultsSummary}>
                <div>
                    Exibindo <strong>{filteredData.length}</strong> de <strong>{funcoes.length}</strong> registros
                    {filteredData.length > 0 && (
                        <span style={{ marginLeft: '1rem', color: '#64748b' }}>
                            Total PF (Filtrado): <strong>{filteredData.reduce((acc, f) => acc + (f.pf || 0), 0).toFixed(2)} PF</strong>
                        </span>
                    )}
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                        Esforço Total Estático (Total Projeto): <strong>{Math.ceil(esforcoTotal)}h</strong>
                    </span>
                    <span style={{ backgroundColor: '#e0e7ff', padding: '4px 8px', borderRadius: '4px', color: '#4f46e5' }}>
                        Previsão de Entrega Global: <strong>{previsaoEntrega || '-'}</strong>
                    </span>
                </div>
            </div>

            {/* Tabela de Dados Completos */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Nome</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>TD</th>
                            <th style={styles.th}>AR/TR</th>
                            <th style={styles.th}>Complex.</th>
                            <th style={styles.th}>PF</th>
                            <th style={styles.th}>Requisito</th>
                            <th style={styles.th}>Data Criação</th>
                            <th style={styles.th}>Origem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((func) => (
                            <tr key={func.id} style={styles.tr}>
                                <td style={styles.td}>{func.numeroFuncao}</td>
                                <td style={{ ...styles.td, fontWeight: '500' }}>{func.nome}</td>
                                <td style={styles.td}>{func.tipo}</td>
                                <td style={styles.td}>{func.td}</td>
                                <td style={styles.td}>{func.arTr}</td>
                                <td style={styles.td}>{func.complexidade}</td>
                                <td style={{ ...styles.td, fontWeight: 'bold' }}>{func.pf}</td>
                                <td style={styles.td}>{func.requisitoId || '-'}</td>
                                <td style={styles.td}>{new Date(func.dataCriacao).toLocaleDateString('pt-BR')}</td>
                                <td style={styles.td}>{func.origem === 'projeto' ? 'Projeto' : 'Biblioteca'}</td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    Nenhum registro encontrado com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    header: {
        marginBottom: '2rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1rem',
    },
    filtersContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '1rem',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: '1',
        minWidth: '150px',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#475569',
    },
    input: {
        padding: '0.6rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '0.9rem',
        width: '100%',
    },
    select: {
        padding: '0.6rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '0.9rem',
        width: '100%',
        backgroundColor: 'white',
    },
    resultsSummary: {
        marginBottom: '1rem',
        fontSize: '0.9rem',
        color: '#334155',
    },
    tableWrapper: {
        overflowX: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '1000px',
    },
    th: {
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontSize: '0.8rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.85rem',
    },
    td: {
        padding: '0.75rem 1rem',
        color: '#334155',
        verticalAlign: 'middle',
    },
};

export default ReportCompleto;
