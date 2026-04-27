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

const ReportDetalhado: React.FC = () => {
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
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Nome da Função</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>TD</th>
                                <th style={styles.th}>TR/AR</th>
                                <th style={styles.th}>Cx.</th>
                                <th style={styles.th}>PF</th>
                                <th style={styles.th}>Requisito</th>
                                <th style={styles.th}>Evidências da Auditoria</th>
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
                                    <td style={styles.td}>{func.td}</td>
                                    <td style={styles.td}>{func.arTr}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            color: func.complexidade === 'Alta' ? '#ef4444' : func.complexidade === 'Media' ? '#f59e0b' : '#22c55e',
                                            fontWeight: '600'
                                        }}>
                                            {func.complexidade === 'Media' ? 'M' : func.complexidade.charAt(0)}
                                        </span>
                                    </td>
                                    <td style={styles.td}><strong>{func.pf}</strong></td>
                                    <td style={styles.td}>
                                        {func.requisitoId ? (
                                            <div>
                                                <span style={styles.reqBadge}>{func.requisitoId}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>-</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                            {func.listaTDs ? <div><strong>TDs:</strong> {Array.isArray(func.listaTDs) ? func.listaTDs.join(', ') : func.listaTDs}</div> : null}
                                            {func.listaARsTRs ? <div><strong>ARs/TRs:</strong> {Array.isArray(func.listaARsTRs) ? func.listaARsTRs.join(', ') : func.listaARsTRs}</div> : null}
                                            {func.observacoesAuditoria ? <div><strong>Obs:</strong> {func.observacoesAuditoria}</div> : (!func.listaTDs && !func.listaARsTRs && '-')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {funcoes.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Nenhuma função cadastrada</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan={6} style={{ ...styles.td, textAlign: 'right' }}>Total PF Bruto:</td>
                                <td style={styles.td}>{totals.totalPFBruto}</td>
                                <td colSpan={2}></td>
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

                <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
                        {membros.map((membro, index) => (
                            <div key={membro.id || index} style={{ 
                                padding: '6px 16px', 
                                backgroundColor: 'white', 
                                border: '1px solid #fbcfe8', 
                                borderRadius: '20px', 
                                fontSize: '0.9rem',
                                color: '#831843',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                {membro.nome} {membro.horasEntregues.toFixed(1)} (h/dia)
                            </div>
                        ))}
                        {membros.length === 0 && (
                            <div style={{ padding: '8px 16px', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                Nenhum squad alocado. Prazo será estimado com 1 Pessoa base (8h/dia).
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', borderTop: '1px solid #fbcfe8', paddingTop: '15px', color: '#831843', fontSize: '0.95rem' }}>
                        <div><strong>Esforço Base do Projeto:</strong> {totals.esforcoTotal} Horas Totais</div>
                        <div><strong>Previsão Matemática:</strong> ~{capacidadeDiariaSquad > 0 ? Math.ceil(totals.esforcoTotal / capacidadeDiariaSquad) : 0} Dias Úteis</div>
                        <div><strong>Data Estimada:</strong> {previsaoEntrega || '-'}</div>
                    </div>
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
                                    ? Object.values(projetoAtualObj.vaf.caracteristicas).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
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
                    <div style={{ marginBottom: '1rem', backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined">calculate</span> Cálculo Final Certificado
                        </h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0f2fe', color: '#475569' }}>
                            <span>Pontos de Função Brutos (PFB):</span>
                            <strong>{totals.totalPFBruto} PF</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '2px solid #93c5fd', color: '#475569' }}>
                            <span>Fator de Ajuste (VAF):</span>
                            <strong>x {totals.vaf}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0 0', color: '#2563eb', fontSize: '1.3rem' }}>
                            <strong>PF Ajustado:</strong>
                            <strong>{totals.totalPFAjustado} PF</strong>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.95rem', color: '#bfdbfe', marginBottom: '8px' }}>Acordo Comercial Estimado</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            R$ {Number(totals.valorTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
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
