import React, { useMemo } from 'react';
import { useFunctionContext } from '../../context/FunctionContext';
import { useAuthStore } from '../../stores/authStore';
import { calcularMetricasSquad } from '../../utils/squadUtils';

const PrintableReport = ({ activeTab, filteredData, reportRef }) => {
    const { empresaAtualObj, projetoAtualObj, totals, funcoes } = useFunctionContext();
    const { user } = useAuthStore();

    if (!projetoAtualObj) return null;

    // Métricas calculadas para os diferentes tipos de relatório
    const {
        esforcoTotal,
        hcppPadrao,
        previsaoEntrega,
        capacidadeDiariaSquad
    } = calcularMetricasSquad(projetoAtualObj, empresaAtualObj, totals);

    const stats = useMemo(() => {
        const dados = funcoes.filter(f => ['ALI', 'AIE', 'ILF', 'EIF'].includes(f.tipo));
        const transacao = funcoes.filter(f => ['EE', 'SE', 'CE', 'EI', 'EO', 'EQ'].includes(f.tipo));
        
        const complexidade = {
            Baixa: funcoes.filter(f => f.complexidade === 'Baixa').length,
            Media: funcoes.filter(f => f.complexidade === 'Media').length,
            Alta: funcoes.filter(f => f.complexidade === 'Alta').length,
        };

        return {
            dados: dados.length,
            transacao: transacao.length,
            total: funcoes.length,
            complexidade
        };
    }, [funcoes]);

    // Define o título baseado na aba
    const getReportTypeTitle = () => {
        switch(activeTab) {
            case 'gerencial': return 'VISÃO GERENCIAL E EXECUTIVA';
            case 'analitico': return 'ANÁLISE ANALÍTICA E COMPOSIÇÃO';
            case 'detalhado': return 'DETALHAMENTO TÉCNICO DE FUNÇÕES';
            case 'completo': return 'EXTRAÇÃO COMPLETA DE DADOS';
            default: return 'RELATÓRIO TÉCNICO';
        }
    };

    return (
        <div 
            id="printable-report-content" 
            ref={reportRef} 
            style={{
                ...styles.container,
                width: '750px',
                backgroundColor: 'white',
                boxSizing: 'border-box'
            }}
        >
            {/* Cabeçalho */}
            <div style={styles.header}>
                <div style={styles.headerTop}>
                    <img src="/banner.png" alt="Logo" style={styles.logo} />
                    <div style={styles.reportTitle}>
                        <h1 style={{ margin: 0, color: '#1e3a8a', fontSize: '20px' }}>{getReportTypeTitle()}</h1>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '11px' }}>StandardPoint - Engenharia de Software</p>
                    </div>
                </div>
            </div>

            {/* Metadados */}
            <div style={styles.metadataGrid}>
                <div style={styles.metaItem}><span style={styles.metaLabel}>EMPRESA</span><span style={styles.metaValue}>{empresaAtualObj.nome}</span></div>
                <div style={styles.metaItem}><span style={styles.metaLabel}>PROJETO</span><span style={styles.metaValue}>{projetoAtualObj.nome}</span></div>
                <div style={styles.metaItem}><span style={styles.metaLabel}>EMISSOR</span><span style={styles.metaValue}>{user?.name || 'Sistema'}</span></div>
                <div style={styles.metaItem}><span style={styles.metaLabel}>DATA</span><span style={styles.metaValue}>{new Date().toLocaleString('pt-BR')}</span></div>
            </div>

            {/* CONTEÚDO DINÂMICO BASEADO NA ABA */}
            
            {/* 1. SEÇÃO GERENCIAL */}
            {activeTab === 'gerencial' && (
                <>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>1. Cronograma e Esforço Estimado</h2>
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Tamanho (PF)</span><span style={styles.summaryValue}>{totals.totalPF}</span></div>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Esforço (Horas)</span><span style={styles.summaryValue}>{Math.round(esforcoTotal)}h</span></div>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>HCPP Aplicado</span><span style={styles.summaryValue}>{hcppPadrao} h/PF</span></div>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Previsão Entrega</span><span style={styles.summaryValue}>{previsaoEntrega || '-'}</span></div>
                        </div>
                    </div>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>2. Dados de Contagem</h2>
                        <p><strong>Tipo de Contagem:</strong> {projetoAtualObj.tipoContagem || 'Desenvolvimento'}</p>
                        <p><strong>Início da Contagem:</strong> {projetoAtualObj.dataInicioContagem ? new Date(projetoAtualObj.dataInicioContagem).toLocaleDateString('pt-BR') : '-'}</p>
                        <p><strong>Última Atualização:</strong> {new Date(projetoAtualObj.updatedAt || new Date()).toLocaleDateString('pt-BR')}</p>
                    </div>
                </>
            )}

            {/* 2. SEÇÃO ANALÍTICA */}
            {activeTab === 'analitico' && (
                <>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>1. Composição: Dados vs Transação</h2>
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Funções de Dados</span><span style={styles.summaryValue}>{stats.dados}</span></div>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Funções de Transação</span><span style={styles.summaryValue}>{stats.transacao}</span></div>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Capacidade Squad</span><span style={styles.summaryValue}>{capacidadeDiariaSquad.toFixed(1)} h/dia</span></div>
                            <div style={styles.summaryCard}><span style={styles.summaryLabel}>Cobertura Req.</span><span style={styles.summaryValue}>{totals.coberturaRequisitos?.percentualCobertura || '0%'}</span></div>
                        </div>
                    </div>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>2. Análise de Complexidade</h2>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Nível de Complexidade</th>
                                    <th style={styles.th}>Quantidade de Funções</th>
                                    <th style={styles.th}>Percentual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(stats.complexidade).map(([label, val]) => (
                                    <tr key={label}>
                                        <td style={styles.td}>{label}</td>
                                        <td style={styles.td}>{val}</td>
                                        <td style={styles.td}>{stats.total > 0 ? Math.round((val/stats.total)*100) : 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* 3. SEÇÃO DE TABELA (DETALHADO OU COMPLETO) */}
            {(activeTab === 'detalhado' || activeTab === 'completo') && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Detalhamento das Funções</h2>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Função</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Compl.</th>
                                <th style={styles.th}>PF</th>
                                <th style={styles.th}>Requisito</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'completo' ? filteredData : funcoes).map((f) => (
                                <tr key={f.id}>
                                    <td style={styles.td}>{f.numeroFuncao}</td>
                                    <td style={{...styles.td, fontWeight: '600'}}>{f.nome}</td>
                                    <td style={styles.td}>{f.tipo}</td>
                                    <td style={styles.td}>{f.complexidade}</td>
                                    <td style={{...styles.td, fontWeight: 'bold'}}>{f.pf}</td>
                                    <td style={styles.td}>{f.requisitoId || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rodapé */}
            <div style={styles.footer}>
                <p style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: '5px' }}>
                    MODO DE EXPORTAÇÃO: {activeTab.toUpperCase()} | GERADO EM: {new Date().toLocaleTimeString('pt-BR')}
                </p>
                <p>StandardPoint v1.2 - Documentação Técnica Baseada no Manual de Práticas de Contagem IFPUG</p>
                <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '30px', color: '#1f2937', fontFamily: 'Arial, sans-serif', fontSize: '12px' },
    header: { borderBottom: '2px solid #1e3a8a', paddingBottom: '15px', marginBottom: '20px' },
    headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { height: '40px', width: 'auto' },
    reportTitle: { textAlign: 'right' },
    metadataGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb' },
    metaItem: { display: 'flex', flexDirection: 'column' },
    metaLabel: { fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
    metaValue: { fontSize: '12px', fontWeight: '600', color: '#111827' },
    section: { marginBottom: '25px' },
    sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#1e3a8a', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '15px' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
    summaryCard: { border: '1px solid #e5e7eb', padding: '10px', borderRadius: '6px', textAlign: 'center' },
    summaryLabel: { display: 'block', fontSize: '9px', color: '#6b7280', marginBottom: '3px' },
    summaryValue: { fontSize: '14px', fontWeight: '700', color: '#1e3a8a' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f3f4f6', color: '#374151', padding: '8px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '10px' },
    td: { padding: '8px', borderBottom: '1px solid #f3f4f6' },
    footer: { marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #e5e7eb', fontSize: '9px', color: '#9ca3af', textAlign: 'center' }
};

export default PrintableReport;
