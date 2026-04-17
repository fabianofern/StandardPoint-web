import React from 'react';
import { useFunctionContext } from '../../context/FunctionContext';
import { calcularMetricasSquad } from '../../utils/squadUtils';

// Dados das 14 Características (Cópia para exibição)
const CARACTERISTICAS_CGS = [
    { id: 'comunicacaoDados', nome: 'Comunicação de Dados' },
    { id: 'processamentoDistribuido', nome: 'Processamento Distribuído' },
    { id: 'performance', nome: 'Performance' },
    { id: 'configuracaoEquipamento', nome: 'Configuração do Equipamento' },
    { id: 'volumeTransacoes', nome: 'Volume de Transações' },
    { id: 'entradaDadosOnline', nome: 'Entrada de Dados On-line' },
    { id: 'eficienciaUsuarioFinal', nome: 'Eficiência do Usuário Final' },
    { id: 'atualizacaoOnline', nome: 'Atualização On-line' },
    { id: 'processamentoComplexo', nome: 'Processamento Complexo' },
    { id: 'reusabilidade', nome: 'Reusabilidade de Código' },
    { id: 'facilidadeInstalacao', nome: 'Facilidade de Instalação' },
    { id: 'facilidadeOperacao', nome: 'Facilidade de Operação' },
    { id: 'multiplosLocais', nome: 'Múltiplos Locais' },
    { id: 'facilidadeMudancas', nome: 'Facilidade de Mudanças' }
];

const ReportDetalhado = () => {
    const {
        empresaAtualObj,
        projetoAtualObj,
        funcoes,
        totals
    } = useFunctionContext();

    if (!projetoAtualObj) return null;

    const {
        membros,
        capacidadeDiariaSquad,
        previsaoEntrega
    } = calcularMetricasSquad(projetoAtualObj, empresaAtualObj, totals);

    // Helper para obter justificativa de complexidade (Simplificado base IFPUG)
    const getJustificativa = (func) => {
        // A lógica exata requer tabela IFPUG completa, aqui mostramos os determinantes
        const arTrLabel = ['ALI', 'AIE'].includes(func.tipo) ? 'TR' : 'AR';
        return `TD: ${func.td}, ${arTrLabel}: ${func.arTr}`;
    };

    return (
        <div className="report-content" style={{ padding: '2rem' }}>
            <div style={styles.header}>
                <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Detalhamento da Contagem e Rastreabilidade</h2>
                <p style={{ color: '#64748b' }}>
                    Auditoria completa das funções, complexidades e memória de cálculo para <strong>{projetoAtualObj.nome}</strong>
                </p>
            </div>

            {/* Tabela de Funções Detalhada */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={styles.sectionTitle}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>list</span>
                    Memória de Cálculo das Funções
                </h3>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Nome da Função</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Elementos</th>
                                <th style={styles.th}>Complexidade</th>
                                <th style={styles.th}>PF</th>
                                <th style={styles.th}>Requisito Vinculado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funcoes.map((func, index) => (
                                <tr key={func.id || index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                    <td style={styles.td}>{func.numeroFuncao || index + 1}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: '600', color: '#334155' }}>{func.nome}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{func.descricao || '-'}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: ['ALI', 'AIE'].includes(func.tipo) ? '#f3e8ff' : '#e0f2fe',
                                            color: ['ALI', 'AIE'].includes(func.tipo) ? '#7e22ce' : '#0369a1',
                                            fontWeight: '600',
                                            fontSize: '0.8rem'
                                        }}>
                                            {func.tipo}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{getJustificativa(func)}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            color: func.complexidade === 'Alta' ? '#ef4444' : func.complexidade === 'Media' ? '#f59e0b' : '#22c55e',
                                            fontWeight: '600'
                                        }}>
                                            {func.complexidade}
                                        </span>
                                    </td>
                                    <td style={styles.td}><strong>{func.pf}</strong></td>
                                    <td style={styles.td}>
                                        {func.requisitoId ? (
                                            <div>
                                                <span style={styles.reqBadge}>{func.requisitoId}</span>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                                    {func.requisitoDescricao || 'Sem descrição'}
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Não vinculado</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {funcoes.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Nenhuma função cadastrada</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ ...styles.td, textAlign: 'right' }}>Total PF Bruto:</td>
                                <td style={styles.td}>{totals.totalPFBruto}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Planejamento de Execução */}
            <div style={{ marginBottom: '3rem', breakInside: 'avoid' }}>
                <h3 style={styles.sectionTitle}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>group</span>
                    Planejamento de Execução (Squad Alocado)
                </h3>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Membro do Squad</th>
                                <th style={styles.th}>Cargo / Papel</th>
                                <th style={styles.th}>Fator Individual (HCPP)</th>
                                <th style={styles.th}>Dedicação</th>
                                <th style={styles.th}>Carga Horária / Dia de Entrega</th>
                            </tr>
                        </thead>
                        <tbody>
                            {membros.map((membro, index) => (
                                <tr key={membro.id || index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>{membro.nome}</td>
                                    <td style={styles.td}>{membro.cargoNome}</td>
                                    <td style={styles.td}>{membro.fatorIndividual} h/PF</td>
                                    <td style={styles.td}>{membro.dedicacao}%</td>
                                    <td style={{ ...styles.td, fontWeight: 'bold', color: '#0ea5e9' }}>
                                        {membro.horasEntregues.toFixed(1)} h/dia
                                    </td>
                                </tr>
                            ))}
                            {membros.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Nenhum squad alocado. Prazo será estimado com 1 Pessoa base (8h/dia).</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan="4" style={{ ...styles.td, textAlign: 'right' }}>Capacidade Total do Squad (Velocidade):</td>
                                <td style={{ ...styles.td, color: '#0ea5e9' }}>{capacidadeDiariaSquad.toFixed(1)} h/dia</td>
                            </tr>
                            <tr style={{ backgroundColor: '#e0e7ff', fontWeight: 'bold' }}>
                                <td colSpan="4" style={{ ...styles.td, textAlign: 'right', color: '#4f46e5' }}>Previsão de Entrega (Calendário):</td>
                                <td style={{ ...styles.td, color: '#4f46e5' }}>{previsaoEntrega || '-'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Detalhamento do VAF */}
            <div style={styles.breakPageAvoid}>
                <h3 style={styles.sectionTitle}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>tune</span>
                    Detalhamento do Valor de Ajuste (VAF)
                </h3>

                <div style={styles.vafContainer}>
                    <div style={styles.vafSummary}>
                        <div style={styles.vafScore}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Índice VAF</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1246e2' }}>{totals.vaf}</div>
                        </div>
                        <div style={styles.vafScore}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Soma Influências</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#475569' }}>
                                {projetoAtualObj.vaf?.caracteristicas
                                    ? Object.values(projetoAtualObj.vaf.caracteristicas).reduce((a, b) => a + (Number(b) || 0), 0)
                                    : 35 /* Default se não tiver dados */}
                            </div>
                        </div>
                    </div>

                    <div style={styles.vafGrid}>
                        {CARACTERISTICAS_CGS.map((cg) => {
                            const valor = projetoAtualObj.vaf?.caracteristicas?.[cg.id] || 0;
                            return (
                                <div key={cg.id} style={styles.vafItem}>
                                    <span style={styles.vafLabel}>{cg.nome}</span>
                                    <div style={styles.vafDots}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <div key={n} style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: n <= valor ? '#3b82f6' : '#e2e8f0',
                                                border: n <= valor ? 'none' : '1px solid #cbd5e1'
                                            }} />
                                        ))}
                                    </div>
                                    <span style={styles.vafValue}>{valor}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div style={styles.finalCalculation}>
                    <h4>Cálculo Final</h4>
                    <p style={{ fontSize: '1.2rem' }}>
                        PF Ajustado = PF Bruto ({totals.totalPFBruto}) × VAF ({totals.vaf}) = <strong>{totals.totalPFAjustado} PF</strong>
                    </p>
                </div>
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
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: '1rem',
        borderLeft: '4px solid #1246e2',
        paddingLeft: '1rem',
    },
    tableContainer: {
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    th: {
        backgroundColor: '#f8fafc',
        color: '#475569',
        fontWeight: '600',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        fontSize: '0.85rem',
        borderBottom: '1px solid #e2e8f0',
    },
    td: {
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.9rem',
        color: '#334155',
        verticalAlign: 'top',
    },
    trOdd: {
        backgroundColor: 'white',
    },
    trEven: {
        backgroundColor: '#f8fafc',
    },
    reqBadge: {
        backgroundColor: '#ecfdf5',
        color: '#047857',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: '1px solid #a7f3d0'
    },
    vafContainer: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
    },
    vafSummary: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minWidth: '200px',
    },
    vafScore: {
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
    },
    vafGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
    },
    vafItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
    },
    vafLabel: {
        fontSize: '0.85rem',
        color: '#475569',
        fontWeight: '500',
    },
    vafDots: {
        display: 'flex',
        gap: '3px',
        margin: '0 8px',
    },
    vafValue: {
        fontWeight: 'bold',
        color: '#1e293b',
        width: '20px',
        textAlign: 'right',
    },
    finalCalculation: {
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        border: '1px solid #bfdbfe',
        textAlign: 'center',
        color: '#1e3a8a',
    },
    breakPageAvoid: {
        breakInside: 'avoid',
    }
};

export default ReportDetalhado;
