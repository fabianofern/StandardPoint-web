import React from 'react';

const ManualDoc = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manual Operacional e Especificação Técnica</h1>
            </div>

            <div style={styles.contentCard}>
                <section>
                    <h2 style={styles.sectionTitle}>1. Visão Geral</h2>
                    <p style={styles.paragraph}>
                        O <strong>StandardPoint</strong> é uma ferramenta de alta precisão desenvolvida para automatizar o processo de contagem de Pontos de Função (APF). 
                        A aplicação foi projetada para garantir que analistas de métricas sigam rigorosamente as diretrizes do <strong>IFPUG CPM 4.3.1</strong>, 
                        minimizando erros manuais de cálculo e classificação.
                    </p>
                </section>

                <section>
                    <h2 style={styles.sectionTitle}>2. Arquitetura do Sistema</h2>
                    <p style={styles.paragraph}>A aplicação utiliza o ecossistema moderno de JavaScript para entregar uma experiência performática e segura:</p>
                    <div style={styles.techGrid}>
                        <div style={styles.techCard}>
                            <strong style={styles.cardStrong}>Core do Sistema</strong>
                            <p style={styles.cardP}>Arquitetura Web Moderna: React 18, Vite e Node.js para máxima performance e segurança.</p>
                        </div>
                        <div style={styles.techCard}>
                            <strong style={styles.cardStrong}>Interface (Frontend)</strong>
                            <p style={styles.cardP}>React 18 com componentização modular e estados globais via Zustand e Context API.</p>
                        </div>
                        <div style={styles.techCard}>
                            <strong style={styles.cardStrong}>Persistência</strong>
                            <p style={styles.cardP}>Banco de dados SQL para armazenamento robusto, transacional e escalável.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 style={styles.sectionTitle}>3. Conformidade Metodológica (IFPUG)</h2>
                    <ul style={styles.list}>
                        <li style={styles.listItem}><strong>Classificação Automática:</strong> Matrizes de complexidade integradas para ALIs, AIEs, EEs, SEs e CEs.</li>
                        <li style={styles.listItem}><strong>Cálculos de Projeto:</strong> Suporte a projetos de desenvolvimento (DFP) e projetos de melhoria (EFP).</li>
                        <li style={styles.listItem}><strong>Fator de Ajuste:</strong> Cálculo automático do VAF baseado nas 14 características gerais do sistema (GSCs).</li>
                        <li style={styles.listItem}><strong>Migração de Dados:</strong> Motor interno para conversão de dados legados para o novo esquema SQL.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={styles.sectionTitle}>4. Como usar (Passo a Passo)</h2>
                    <p style={styles.paragraph}>Siga o fluxo de trabalho recomendado para garantir a integridade dos dados:</p>
                    <ol style={styles.list}>
                        <li style={styles.listItem}><span style={styles.actionStep}>Empresa</span>: Cadastre a empresa e seus respectivos funcionários.</li>
                        <li style={styles.listItem}><span style={styles.actionStep}>Projeto</span>: Crie o projeto e defina o Squad responsável.</li>
                        <li style={styles.listItem}><span style={styles.actionStep}>Requisitos</span>: Cadastre as necessidades do negócio antes de iniciar a contagem.</li>
                        <li style={styles.listItem}><span style={styles.actionStep}>Funções</span>: Realize a contagem (ALI, AIE, EE, SE, CE) vinculando-as aos requisitos.</li>
                        <li style={styles.listItem}><span style={styles.actionStep}>Relatórios</span>: Extraia os resultados finais em formato PDF ou consulta em tela.</li>
                    </ol>
                </section>

                <section>
                    <h2 style={styles.sectionTitle}>4. Valor de Ajuste (VAF)</h2>
                    <div style={styles.alertBox}>
                        <strong style={{ color: '#b45309' }}>Aviso:</strong> É essencial preencher o questionário do <strong>VAF</strong> para que o cálculo final inclua as 14 características gerais do sistema, conforme normas do IFPUG.
                    </div>
                </section>

                <section style={styles.imageSection}>
                    <h2 style={styles.sectionTitle}>5. Modelo Entidade Relacionamento (MER)</h2>
                    <p style={{ textAlign: 'center', color: '#475569' }}>Estrutura de dados otimizada para rastreabilidade de contagens.</p>
                    <div style={styles.imageContainer}>
                        <img src="/mer_standardpoint.png" alt="MER StandardPoint" style={styles.image} />
                    </div>
                </section>
            </div>

            <div style={styles.footer}>
                <button style={styles.button} onClick={() => window.close()}>Fechar Documentação</button>
                <p style={styles.footerText}>StandardPoint v1.2 - © {new Date().getFullYear()}</p>
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
        borderLeft: '4px solid #3b82f6',
        paddingLeft: '15px',
        marginTop: '30px',
        marginBottom: '15px'
    },
    paragraph: {
        lineHeight: '1.6',
        color: '#475569',
        fontSize: '1rem'
    },
    techGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        margin: '20px 0'
    },
    techCard: {
        backgroundColor: '#f1f5f9',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    cardStrong: {
        display: 'block',
        color: '#0f172a',
        marginBottom: '8px',
        fontSize: '1.1rem'
    },
    cardP: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#64748b'
    },
    list: {
        paddingLeft: '20px'
    },
    listItem: {
        marginBottom: '12px',
        color: '#475569'
    },
    actionStep: {
        backgroundColor: '#e2e8f0',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: '600',
        marginRight: '8px'
    },
    alertBox: {
        backgroundColor: '#fffbeb',
        borderLeft: '4px solid #f59e0b',
        padding: '20px',
        borderRadius: '4px',
        marginTop: '10px'
    },
    imageSection: {
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #f1f5f9'
    },
    imageContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px'
    },
    image: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    footer: {
        marginTop: '40px',
        textAlign: 'center',
        paddingBottom: '40px'
    },
    button: {
        padding: '12px 30px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
        transition: 'all 0.2s'
    },
    footerText: {
        marginTop: '15px',
        fontSize: '0.8rem',
        color: '#94a3b8'
    }
};

export default ManualDoc;
