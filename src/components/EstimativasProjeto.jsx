import React from 'react';
import { useFunctionContext } from '../context/FunctionContext';
import { calcularMetricasSquad } from '../utils/squadUtils';

const EstimativasProjeto = () => {
    const {
        empresaAtualObj,
        projetoAtualObj,
        totals
    } = useFunctionContext();

    if (!empresaAtualObj || !projetoAtualObj) {
        return (
            <div style={styles.container}>
                <div style={styles.notSelected}>
                    <span className="material-symbols-outlined" style={styles.notSelectedIcon}>folder_off</span>
                    <h3>Nenhum projeto selecionado</h3>
                    <p>Selecione um projeto para visualizar suas estimativas.</p>
                </div>
            </div>
        );
    }

    const squadAtual = projetoAtualObj.squad || [];
    const funcionariosEmpresa = empresaAtualObj.funcionarios || [];
    const cargosEmpresa = empresaAtualObj.cargos || [];

    // =====================
    // CÁLCULOS PRINCIPAIS
    // =====================
    const totalPFs = parseFloat(totals.totalPF || 0);

    // Esforço Total (Trabalho Necessário - FIXO baseado no padrão da empresa)
    const {
        esforcoTotal,
        hcppPadrao,
        capacidadeDiariaSquad,
        prazoDiasUteis,
        previsaoEntrega
    } = calcularMetricasSquad(projetoAtualObj, empresaAtualObj, totals);

    // Previsão em Meses (Aproximadamente 21 dias úteis/mês)
    const prazoMeses = (prazoDiasUteis / 21).toFixed(1);

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        <span className="material-symbols-outlined" style={styles.titleIcon}>analytics</span>
                        Estimativas e Prazos
                    </h2>
                    <p style={styles.subtitle}>
                        Console de previsão do projeto <strong style={{ color: '#1246e2' }}>{projetoAtualObj.nome}</strong>
                    </p>
                </div>
            </div>

            <div style={styles.contentArea}>

                {squadAtual.length === 0 && (
                    <div style={styles.warningAlert}>
                        <span className="material-symbols-outlined">warning</span>
                        <div>
                            <strong>Atenção: Nenhum squad definido para este projeto.</strong>
                            <p style={{ margin: '4px 0 0 0' }}>As estimativas de prazo abaixo estão usando a alocação padrão de 1 Pessoa (100%). Cadastre a equipe na aba "Squad" para obter uma previsão realista.</p>
                        </div>
                    </div>
                )}

                {/* GRID DE CARDS GERAIS (Tamanho e Esforço) */}
                <h3 style={styles.sectionTitle}>Tamanho e Esforço</h3>
                <div style={styles.cardsGrid}>

                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Total PFs Ajustados</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#3b82f6' }}>functions</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={styles.cardValue}>
                                {totalPFs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span style={styles.cardUnit}>PF</span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Esforço Total</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#f59e0b' }}>pending_actions</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={styles.cardValue}>
                                {esforcoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span style={styles.cardUnit}>Horas</span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Produtividade Padrão (HCPP)</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#8b5cf6' }}>speed</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={styles.cardValue}>
                                {hcppPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                            </span>
                            <span style={styles.cardUnit}>h/PF</span>
                        </div>
                    </div>

                </div>

                {/* GRID DE CARDS CAPACIDADE E PRAZO */}
                <h3 style={{ ...styles.sectionTitle, marginTop: '1rem' }}>Capacidade e Prazos (Baseado no Squad)</h3>
                <div style={styles.cardsGrid}>

                    <div style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Tamanho do Squad</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#10b981' }}>groups</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={styles.cardValue}>
                                {squadAtual.length}
                            </span>
                            <span style={styles.cardUnit}>Pessoas Alocadas</span>
                        </div>
                    </div>

                    <div style={{ ...styles.card, borderLeft: '4px solid #06b6d4' }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Capacidade Diária (Velocidade)</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#06b6d4' }}>work_history</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={styles.cardValue}>
                                {capacidadeDiariaSquad > 0 ? capacidadeDiariaSquad.toFixed(1) : "8.0"}
                            </span>
                            <span style={styles.cardUnit}>Horas / Dia (Entregues)</span>
                        </div>
                    </div>

                    <div style={{ ...styles.card, borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2' }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Prazo Final (Estimativa)</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#ef4444' }}>hourglass_empty</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={{ ...styles.cardValue, color: '#ef4444' }}>
                                {Math.ceil(prazoDiasUteis)}
                            </span>
                            <span style={{ ...styles.cardUnit, color: '#b91c1c' }}>Dias Úteis (~{prazoMeses} Mês)</span>
                        </div>
                    </div>

                </div>

                {/* GRID DE CARDS CRONOGRAMA */}
                <h3 style={{ ...styles.sectionTitle, marginTop: '1rem' }}>Cronograma de Execução</h3>
                <div style={styles.cardsGrid}>

                    <div style={{ ...styles.card, borderLeft: '4px solid #8b5cf6' }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Data de Início do Projeto</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#8b5cf6' }}>calendar_month</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={styles.cardValue}>
                                {projetoAtualObj.dataInicioProjeto
                                    ? new Date(projetoAtualObj.dataInicioProjeto + 'T00:00:00').toLocaleDateString('pt-BR')
                                    : '-'}
                            </span>
                            {projetoAtualObj.dataInicioProjeto ? (
                                <span style={styles.cardUnit}>Início dos Trabalhos</span>
                            ) : (
                                <span style={{ ...styles.cardUnit, color: '#ef4444' }}>Não preenchida no Cadastro</span>
                            )}
                        </div>
                    </div>

                    <div style={{ ...styles.card, borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2' }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>Previsão de Entrega</span>
                            <span className="material-symbols-outlined" style={{ ...styles.cardIcon, color: '#ef4444' }}>event_available</span>
                        </div>
                        <div style={styles.cardBody}>
                            <span style={{ ...styles.cardValue, color: '#ef4444' }}>
                                {previsaoEntrega ? previsaoEntrega : '-'}
                            </span>
                            <span style={{ ...styles.cardUnit, color: '#b91c1c' }}>Data Calendário Final</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default EstimativasProjeto;

// ESTILOS DE DASHBOARD
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
    },
    notSelected: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    notSelectedIcon: {
        fontSize: '64px',
        color: '#cbd5e1',
        marginBottom: '1rem',
    },
    header: {
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#0f172a',
        fontSize: '1.875rem',
        fontWeight: 'bold',
        margin: '0 0 0.5rem 0',
    },
    titleIcon: {
        color: '#1246e2',
        fontSize: '32px',
    },
    subtitle: {
        color: '#64748b',
        fontSize: '1rem',
        margin: 0,
    },
    warningAlert: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '1rem',
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        color: '#92400e',
        marginBottom: '1rem'
    },
    contentArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    sectionTitle: {
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        color: '#0f172a',
        fontWeight: '600',
    },
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardTitle: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#64748b'
    },
    cardIcon: {
        fontSize: '24px',
        padding: '8px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
    },
    cardBody: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px'
    },
    cardValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#0f172a',
        lineHeight: '1'
    },
    cardUnit: {
        fontSize: '1rem',
        fontWeight: '500',
        color: '#64748b'
    }
};
