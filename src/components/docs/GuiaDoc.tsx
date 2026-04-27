import React from 'react';

const GuiaDoc = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Guia Rápido e Sobre o Sistema</h1>
            </div>

            <div style={styles.contentCard}>
                {/* SOBRE O SISTEMA */}
                <section style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <img src="/banner.png" alt="StandardPoint" style={{ maxWidth: '300px', marginBottom: '20px' }} />
                    <h2 style={{ ...styles.sectionTitle, borderLeft: 'none', paddingLeft: 0 }}>StandardPoint v1.2</h2>
                    <p style={{ ...styles.paragraph, textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        Uma ferramenta especializada em Análise de Pontos de Função (APF), 
                        seguindo os padrões internacionais do IFPUG. Facilita o cálculo de PFNA, PFA e VAF 
                        em um ambiente moderno e intuitivo.
                    </p>
                    <div style={styles.infoBox}>
                        <strong>Referência Normativa:</strong> Baseado nas diretrizes do IFPUG CPM 4.3.1
                    </div>
                </section>

                {/* GUIA RÁPIDO APF */}
                <section>
                    <h2 style={styles.sectionTitle}>⚡ Guia Rápido APF</h2>
                    <div style={styles.cardGrid}>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>💾 Funções de Dados</h3>
                            <p style={styles.cardP}><strong>ALI:</strong> Arquivo Lógico Interno (seu sistema mantém).</p>
                            <p style={styles.cardP}><strong>AIE:</strong> Arquivo de Interface Externa (seu sistema apenas lê).</p>
                        </div>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>🔄 Funções de Transação</h3>
                            <p style={styles.cardP}><strong>EE:</strong> Entrada Externa (altera dados).</p>
                            <p style={styles.cardP}><strong>SE:</strong> Saída Externa (cálculos/lógica complexa).</p>
                            <p style={styles.cardP}><strong>CE:</strong> Consulta Externa (busca/listagem simples).</p>
                        </div>
                    </div>
                </section>

                {/* MATRIZES DE COMPLEXIDADE */}
                <section>
                    <h2 style={styles.sectionTitle}>📊 Matrizes de Complexidade</h2>
                    
                    <div style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: '600', color: '#6b7280' }}>FUNÇÕES DE DADOS (ALI/AIE)</div>
                    <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>TRs \ TDs</th>
                                    <th style={styles.th}>1 a 19 TDs</th>
                                    <th style={styles.th}>20 a 50 TDs</th>
                                    <th style={styles.th}>+ de 50 TDs</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}><strong>1 TR</strong></td>
                                    <td style={styles.td}><span style={styles.badgeLow}>Baixa</span></td>
                                    <td style={styles.td}><span style={styles.badgeLow}>Baixa</span></td>
                                    <td style={styles.td}><span style={styles.badgeMedium}>Média</span></td>
                                </tr>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}><strong>2 a 5 TRs</strong></td>
                                    <td style={styles.td}><span style={styles.badgeLow}>Baixa</span></td>
                                    <td style={styles.td}><span style={styles.badgeMedium}>Média</span></td>
                                    <td style={styles.td}><span style={styles.badgeHigh}>Alta</span></td>
                                </tr>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}><strong>+ de 5 TRs</strong></td>
                                    <td style={styles.td}><span style={styles.badgeMedium}>Média</span></td>
                                    <td style={styles.td}><span style={styles.badgeHigh}>Alta</span></td>
                                    <td style={styles.td}><span style={styles.badgeHigh}>Alta</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: '600', color: '#6b7280' }}>FUNÇÕES DE TRANSAÇÃO (EE/SE/CE)</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>ARs \ TDs</th>
                                    <th style={styles.th}>1 a 4 TDs (SE: 1-5)</th>
                                    <th style={styles.th}>Médio TDs</th>
                                    <th style={styles.th}>Alto TDs</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}><strong>0 a 1 AR</strong></td>
                                    <td style={styles.td}><span style={styles.badgeLow}>Baixa</span></td>
                                    <td style={styles.td}><span style={styles.badgeLow}>Baixa</span></td>
                                    <td style={styles.td}><span style={styles.badgeMedium}>Média</span></td>
                                </tr>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}><strong>2 a 3 ARs</strong></td>
                                    <td style={styles.td}><span style={styles.badgeLow}>Baixa</span></td>
                                    <td style={styles.td}><span style={styles.badgeMedium}>Média</span></td>
                                    <td style={styles.td}><span style={styles.badgeHigh}>Alta</span></td>
                                </tr>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}><strong>+ de 3 ARs</strong></td>
                                    <td style={styles.td}><span style={styles.badgeMedium}>Média</span></td>
                                    <td style={styles.td}><span style={styles.badgeHigh}>Alta</span></td>
                                    <td style={styles.td}><span style={styles.badgeHigh}>Alta</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* TABELA DE CONTRIBUIÇÃO */}
                <section>
                    <h2 style={styles.sectionTitle}>📈 Tabela de Contribuição</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Tipo de Função</th>
                                    <th style={styles.th}>Baixa</th>
                                    <th style={styles.th}>Média</th>
                                    <th style={styles.th}>Alta</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={styles.tableRow}><td style={styles.td}><strong>ALI</strong> (Arquivo Lógico Interno)</td><td style={styles.td}>7 PF</td><td style={styles.td}>10 PF</td><td style={styles.td}>15 PF</td></tr>
                                <tr style={styles.tableRow}><td style={styles.td}><strong>AIE</strong> (Arquivo de Interface Externa)</td><td style={styles.td}>5 PF</td><td style={styles.td}>7 PF</td><td style={styles.td}>10 PF</td></tr>
                                <tr style={styles.tableRow}><td style={styles.td}><strong>EE</strong> (Entrada Externa)</td><td style={styles.td}>3 PF</td><td style={styles.td}>4 PF</td><td style={styles.td}>6 PF</td></tr>
                                <tr style={styles.tableRow}><td style={styles.td}><strong>SE</strong> (Saída Externa)</td><td style={styles.td}>4 PF</td><td style={styles.td}>5 PF</td><td style={styles.td}>7 PF</td></tr>
                                <tr style={styles.tableRow}><td style={styles.td}><strong>CE</strong> (Consulta Externa)</td><td style={styles.td}>3 PF</td><td style={styles.td}>4 PF</td><td style={styles.td}>6 PF</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* CHECKLIST E ATALHO */}
                <section>
                    <h2 style={styles.sectionTitle}>✅ Checklist "Não Esqueça"</h2>
                    <div style={styles.checklist}>
                        <div style={styles.checklistItem}>
                            <strong>Mensagens e Botões:</strong> Toda transação ganha +1 TD pelo conjunto de mensagens e +1 TD pelo botão de ação.
                        </div>
                        <div style={styles.checklistItem}>
                            <strong>Unicidade:</strong> Se a funcionalidade é a mesma, conte apenas UMA vez para o sistema todo.
                        </div>
                        <div style={styles.checklistItem}>
                            <strong>Domínio:</strong> Tabelas de "status", "UF", "tipo" (fixas) NÃO são ALIs. São apenas TDs.
                        </div>
                        <div style={styles.checklistItem}>
                            <strong>Cálculos vs Lógica:</strong> Soma simples não transforma CE em SE. Cálculos de negócio (impostos, médias), sim.
                        </div>
                        <div style={styles.checklistItem}>
                            <strong>TR vs AR:</strong> Lembre-se: TR é para arquivo de dados (ALI/AIE). AR é para transação (EE/SE/CE).
                        </div>
                    </div>

                    <h2 style={styles.sectionTitle}>💡 Atalho de Contagem de TDs</h2>
                    <div style={styles.infoBoxHighlight}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Exemplo Prático: Tela de Cadastro</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li>Cada campo de preenchimento (Nome, CPF, Data, etc.).</li>
                            <li>Cada campo de seleção ou Combobox.</li>
                            <li><strong>+1 TD</strong> para o conjunto de mensagens de erro/sucesso.</li>
                            <li><strong>+1 TD</strong> para o botão Confirmar/Salvar/Enviar.</li>
                        </ul>
                    </div>
                </section>

                {/* CRÉDITOS */}
                <section style={styles.creditsSection}>
                    <h2 style={styles.sectionTitle}>Créditos e Desenvolvimento</h2>
                    <p style={styles.paragraph}>
                        Desenvolvido por: <strong>Fabiano de Oliveira Fernandes</strong><br />
                        Contato: <a href="mailto:fabianofern@gmail.com" style={styles.link}>fabianofern@gmail.com</a><br />
                        <a href="https://www.linkedin.com/in/fofernandes/" target="_blank" rel="noreferrer" style={styles.link}>LinkedIn Profile</a>
                    </p>
                </section>
            </div>

            <div style={styles.footer}>
                <button style={styles.button} onClick={() => window.close()}>Fechar Guia</button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    header: {
        width: '100%',
        maxWidth: '900px',
        padding: '20px 0',
        textAlign: 'center',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '30px'
    },
    title: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        margin: 0
    },
    contentCard: {
        width: '100%',
        maxWidth: '900px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        boxSizing: 'border-box'
    },
    sectionTitle: {
        color: '#1e3a8a',
        fontSize: '1.4rem',
        borderLeft: '4px solid #10b981',
        paddingLeft: '15px',
        marginTop: '30px',
        marginBottom: '15px'
    },
    paragraph: {
        lineHeight: '1.6',
        color: '#475569',
        fontSize: '1rem'
    },
    infoBox: {
        backgroundColor: '#eff6ff',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px auto',
        maxWidth: '400px',
        fontSize: '0.9rem',
        color: '#1e3a8a',
        borderLeft: '4px solid #3b82f6'
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        margin: '20px 0'
    },
    card: {
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
    },
    cardTitle: {
        margin: '0 0 10px 0',
        fontSize: '1.1rem',
        color: '#1e3a8a'
    },
    cardP: {
        margin: '5px 0',
        fontSize: '0.9rem'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        margin: '20px 0',
        fontSize: '0.9rem'
    },
    tableHeader: {
        backgroundColor: '#f1f5f9'
    },
    th: {
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #e2e8f0',
        color: '#1e3a8a'
    },
    tableRow: {
        borderBottom: '1px solid #f1f5f9'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #f1f5f9'
    },
    badgeLow: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    badgeMedium: {
        backgroundColor: '#fef9c3',
        color: '#854d0e',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    badgeHigh: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    checklist: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    checklistItem: {
        backgroundColor: '#f8fafc',
        padding: '12px',
        borderRadius: '8px',
        borderLeft: '4px solid #f59e0b',
        fontSize: '0.95rem'
    },
    infoBoxHighlight: {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        margin: '20px 0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    creditsSection: {
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center'
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: '500'
    },
    footer: {
        marginTop: '40px',
        textAlign: 'center',
        paddingBottom: '40px'
    },
    button: {
        padding: '12px 30px',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
        transition: 'all 0.2s'
    }
};

export default GuiaDoc;
