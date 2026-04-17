import React, { useMemo } from 'react';
import { useFunctionContext } from '../../context/FunctionContext';
import { calcularMetricasSquad } from '../../utils/squadUtils';

const ReportAnalitico = () => {
    const {
        empresaAtualObj,
        projetoAtualObj,
        funcoes,
        totals
    } = useFunctionContext();

    if (!projetoAtualObj) return null;

    const {
        membros,
        capacidadeDiariaSquad
    } = calcularMetricasSquad(projetoAtualObj, empresaAtualObj, totals);

    // Cálculos para os gráficos
    const stats = useMemo(() => {
        // Distribuição por Tipo (Dados vs Transação)
        const dados = funcoes.filter(f => ['ALI', 'AIE', 'ILF', 'EIF'].includes(f.tipo));
        const transacao = funcoes.filter(f => ['EE', 'SE', 'CE', 'EI', 'EO', 'EQ'].includes(f.tipo));

        // Distribuição por Complexidade
        const complexidade = {
            Baixa: funcoes.filter(f => f.complexidade === 'Baixa').length,
            Media: funcoes.filter(f => f.complexidade === 'Media').length,
            Alta: funcoes.filter(f => f.complexidade === 'Alta').length,
        };

        // Detalhamento por Tipo Específico
        const tiposDetalhados = {
            ALI: funcoes.filter(f => f.tipo === 'ALI').length,
            AIE: funcoes.filter(f => f.tipo === 'AIE').length,
            EE: funcoes.filter(f => f.tipo === 'EE').length,
            SE: funcoes.filter(f => f.tipo === 'SE').length,
            CE: funcoes.filter(f => f.tipo === 'CE').length,
        };

        return {
            dados: dados.length,
            transacao: transacao.length,
            total: funcoes.length,
            complexidade,
            tiposDetalhados
        };
    }, [funcoes]);

    // Cálculos para Gráfico de Pizza (SVG)
    const pieData = [
        { label: 'Dados', value: stats.dados, color: '#7c3aed' },
        { label: 'Transação', value: stats.transacao, color: '#0ea5e9' }
    ];

    const totalPie = pieData.reduce((acc, item) => acc + item.value, 0);
    let accumulatedAngle = 0;

    // Helper para criar arcos do SVG
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="report-content" style={{ padding: '2rem' }}>
            <div style={styles.header}>
                <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Análise de Composição e Qualidade</h2>
                <p style={{ color: '#64748b' }}>
                    Detalhes da contagem por tipo, complexidade e cobertura para <strong>{projetoAtualObj.nome}</strong>
                </p>
            </div>

            <div style={styles.gridTwoColumns}>
                {/* Gráfico de Distribuição (Pizza) */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Distribuição: Dados vs Transação</h3>
                    <div style={styles.pieChartContainer}>
                        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '180px', height: '180px' }}>
                            {pieData.map((slice, index) => {
                                if (totalPie === 0) return null;
                                const percent = slice.value / totalPie;
                                const [startX, startY] = getCoordinatesForPercent(accumulatedAngle);
                                accumulatedAngle += percent;
                                const [endX, endY] = getCoordinatesForPercent(accumulatedAngle);
                                const largeArcFlag = percent > 0.5 ? 1 : 0;

                                // Se for 100%, desenhar círculo completo
                                if (percent === 1) {
                                    return <circle key={index} cx="0" cy="0" r="1" fill={slice.color} />;
                                }

                                return (
                                    <path
                                        key={index}
                                        d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                        fill={slice.color}
                                        stroke="white"
                                        strokeWidth="0.05"
                                    />
                                );
                            })}
                            {totalPie === 0 && <circle cx="0" cy="0" r="1" fill="#e2e8f0" />}
                        </svg>
                        <div style={styles.legend}>
                            {pieData.map((slice, index) => (
                                <div key={index} style={styles.legendItem}>
                                    <div style={{ ...styles.legendColor, backgroundColor: slice.color }}></div>
                                    <span>{slice.label}: {slice.value} ({totalPie > 0 ? Math.round((slice.value / totalPie) * 100) : 0}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gráfico de Complexidade (Barras) */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Análise de Complexidade</h3>
                    <div style={styles.barChartContainer}>
                        {Object.entries(stats.complexidade).map(([label, value]) => {
                            const percentage = stats.total > 0 ? (value / stats.total) * 100 : 0;
                            let color = '#3b82f6'; // Azul padrão
                            if (label === 'Baixa') color = '#22c55e';
                            if (label === 'Alta') color = '#ef4444';
                            if (label === 'Media') color = '#f59e0b'; // Ajuste pq a chave é sem acento no código, mas label pode ser com? Não, chave é 'Media'

                            return (
                                <div key={label} style={styles.barRow}>
                                    <div style={styles.barLabel}>{label}</div>
                                    <div style={styles.barTrack}>
                                        <div
                                            style={{
                                                ...styles.barFill,
                                                width: `${percentage}%`,
                                                backgroundColor: color
                                            }}
                                        />
                                        <span style={styles.barValue}>{value}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        Predominância de complexidade: <strong>
                            {Object.entries(stats.complexidade).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                        </strong>
                    </div>
                </div>

                {/* Detalhamento de Tipos */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Detalhamento por Função</h3>
                    <div style={styles.tableSimple}>
                        {Object.entries(stats.tiposDetalhados).map(([tipo, qtd]) => (
                            <div key={tipo} style={styles.tableRow}>
                                <span style={{ fontWeight: '600', color: '#475569' }}>{tipo}</span>
                                <span>{qtd}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indicadores de Qualidade / Cobertura */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Métricas de Qualidade</h3>

                    <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Produtividade Média</span>
                        <span style={styles.metricValue}>
                            {totals.coberturaRequisitos?.totalRequisitos > 0
                                ? (totals.totalPF / totals.coberturaRequisitos.totalRequisitos).toFixed(2)
                                : '0'} PF/Req
                        </span>
                    </div>

                    <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Cobertura de Requisitos</span>
                        <span style={styles.metricValue}>
                            {totals.coberturaRequisitos?.percentualCobertura || '0%'}
                        </span>
                        <div style={styles.progressBar}>
                            <div style={{
                                width: totals.coberturaRequisitos?.percentualCobertura || '0%',
                                height: '100%',
                                backgroundColor: '#10b981',
                                borderRadius: '4px'
                            }}></div>
                        </div>
                    </div>

                    <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Funções sem Requisito</span>
                        <span style={{ ...styles.metricValue, color: totals.coberturaRequisitos?.funcoesSemRequisito > 0 ? '#ef4444' : '#10b981' }}>
                            {totals.coberturaRequisitos?.funcoesSemRequisito || 0}
                        </span>
                    </div>
                </div>

                {/* Composição do Squad e Produtividade */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Composição do Squad</h3>

                    <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Capacidade Diária (Velocidade)</span>
                        <span style={{ ...styles.metricValue, color: '#0ea5e9' }}>
                            {capacidadeDiariaSquad.toFixed(2)} h/dia
                        </span>
                    </div>

                    <div style={styles.tableSimple}>
                        <div style={{ ...styles.tableRow, borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            <span style={{ flex: 2 }}>Membro</span>
                            <span style={{ flex: 1, textAlign: 'center' }}>Fator PF</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>Entrega/Dia</span>
                        </div>
                        {membros.map((membro) => (
                            <div key={membro.id} style={styles.tableRow}>
                                <span style={{ flex: 2, fontWeight: '600', color: '#475569', display: 'flex', flexDirection: 'column' }}>
                                    {membro.nome}
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>{membro.cargoNome} ({membro.dedicacao}%)</span>
                                </span>
                                <span style={{ flex: 1, textAlign: 'center' }}>{membro.fatorIndividual} h/PF</span>
                                <span style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', color: '#0ea5e9' }}>{membro.horasEntregues.toFixed(1)} h</span>
                            </div>
                        ))}
                        {membros.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                Nenhum membro alocado no Squad.
                            </div>
                        )}
                    </div>
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
    gridTwoColumns: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
    },
    cardTitle: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #f1f5f9',
    },
    pieChartContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    legend: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: '#475569',
    },
    legendColor: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
    },
    barChartContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
    },
    barRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    barLabel: {
        width: '60px',
        fontSize: '0.9rem',
        color: '#475569',
    },
    barTrack: {
        flex: 1,
        height: '24px',
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    barFill: {
        height: '100%',
        transition: 'width 0.5s ease',
    },
    barValue: {
        position: 'absolute',
        right: '8px',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#475569',
    },
    tableSimple: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    tableRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.9rem',
    },
    metricItem: {
        marginBottom: '1rem',
    },
    metricLabel: {
        display: 'block',
        fontSize: '0.85rem',
        color: '#64748b',
        marginBottom: '0.25rem',
    },
    metricValue: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#0f172a',
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
        marginTop: '0.5rem',
        overflow: 'hidden',
    },
};

export default ReportAnalitico;
