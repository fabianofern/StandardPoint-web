// src/components/ValorAjusteContent.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Dados das 14 Características Gerais do Sistema (CGS) conforme IFPUG
const CARACTERISTICAS_CGS = [
    {
        id: 'comunicacaoDados',
        nome: 'Comunicação de Dados',
        descricao: 'Quantos processos de comunicação de dados são necessários para transferir informações para fora da fronteira da aplicação?',
        exemplo: 'APIs REST, Web Services, EDI, protocolos de comunicação'
    },
    {
        id: 'processamentoDistribuido',
        nome: 'Processamento Distribuído',
        descricao: 'O processamento distribuído é uma característica do sistema?',
        exemplo: 'Cliente-servidor, arquitetura em camadas, microserviços, aplicações distribuídas'
    },
    {
        id: 'performance',
        nome: 'Performance',
        descricao: 'Os requisitos de tempo de resposta ou throughput são críticos para o sistema?',
        exemplo: 'Tempo de resposta < 2s, processamento de milhares de transações/segundo'
    },
    {
        id: 'configuracaoEquipamento',
        nome: 'Configuração do Equipamento',
        descricao: 'O sistema é dependente da configuração do ambiente de hardware?',
        exemplo: 'Requisitos específicos de CPU, memória, storage, configurações de rede'
    },
    {
        id: 'volumeTransacoes',
        nome: 'Volume de Transações',
        descricao: 'O volume de transações diárias é significativo?',
        exemplo: 'Milhares ou milhões de transações diárias, picos de carga'
    },
    {
        id: 'entradaDadosOnline',
        nome: 'Entrada de Dados On-line',
        descricao: 'Qual o percentual de dados entrados interativamente?',
        exemplo: 'Formulários web, telas de entrada, importação manual vs. batch'
    },
    {
        id: 'eficienciaUsuarioFinal',
        nome: 'Eficiência do Usuário Final',
        descricao: 'O sistema foi projetado para facilitar a operação do usuário?',
        exemplo: 'Navegação intuitiva, atalhos, help online, validações amigáveis'
    },
    {
        id: 'atualizacaoOnline',
        nome: 'Atualização On-line',
        descricao: 'As ILFs são atualizadas interativamente durante a operação?',
        exemplo: 'CRUD em tempo real, manutenção de cadastros online, atualizações instantâneas'
    },
    {
        id: 'processamentoComplexo',
        nome: 'Processamento Complexo',
        descricao: 'O sistema possui lógica de processamento complexa?',
        exemplo: 'Cálculos matemáticos complexos, algoritmos sofisticados, regras de negócio intricate'
    },
    {
        id: 'reusabilidade',
        nome: 'Reusabilidade de Código',
        descricao: 'O sistema foi projetado para ser reutilizado em outras aplicações?',
        exemplo: 'Bibliotecas compartilhadas, componentes genéricos, frameworks internos'
    },
    {
        id: 'facilidadeInstalacao',
        nome: 'Facilidade de Instalação',
        descricao: 'A conversão e instalação são complexas?',
        exemplo: 'Scripts de migração, setup automatizado, conversão de dados históricos'
    },
    {
        id: 'facilidadeOperacao',
        nome: 'Facilidade de Operação',
        descricao: 'O sistema requer operação e administração complexas?',
        exemplo: 'Backup automático, monitoramento, logs detalhados, recuperação de erros'
    },
    {
        id: 'multiplosLocais',
        nome: 'Múltiplos Locais',
        descricao: 'O sistema foi projetado para ser instalado em múltiplos sites/organizações?',
        exemplo: 'Multi-tenant, customizações por cliente, instalações distribuídas geograficamente'
    },
    {
        id: 'facilidadeMudancas',
        nome: 'Facilidade de Mudanças',
        descricao: 'O sistema foi projetado para facilitar modificações futuras?',
        exemplo: 'Parametrizações extensivas, regras configuráveis, arquitetura flexível'
    }
];

// Perfis de VAF pré-definidos do mercado
const PERFIS_VAF = [
    {
        id: 'simples',
        nome: 'Sistema Simples',
        descricao: 'Aplicação básica, poucos requisitos não-funcionais',
        vaf: 0.85,
        valores: {
            comunicacaoDados: 2, processamentoDistribuido: 1, performance: 2,
            configuracaoEquipamento: 1, volumeTransacoes: 2, entradaDadosOnline: 3,
            eficienciaUsuarioFinal: 3, atualizacaoOnline: 2, processamentoComplexo: 1,
            reusabilidade: 1, facilidadeInstalacao: 3, facilidadeOperacao: 2,
            multiplosLocais: 0, facilidadeMudancas: 2
        }
    },
    {
        id: 'medio',
        nome: 'Sistema Médio',
        descricao: 'Aplicação corporativa padrão',
        vaf: 1.00,
        valores: {
            comunicacaoDados: 3, processamentoDistribuido: 3, performance: 3,
            configuracaoEquipamento: 3, volumeTransacoes: 3, entradaDadosOnline: 4,
            eficienciaUsuarioFinal: 4, atualizacaoOnline: 3, processamentoComplexo: 3,
            reusabilidade: 2, facilidadeInstalacao: 3, facilidadeOperacao: 3,
            multiplosLocais: 2, facilidadeMudancas: 3
        }
    },
    {
        id: 'complexo',
        nome: 'Sistema Complexo',
        descricao: 'Aplicação crítica, alta performance, distribuída',
        vaf: 1.15,
        valores: {
            comunicacaoDados: 4, processamentoDistribuido: 4, performance: 5,
            configuracaoEquipamento: 4, volumeTransacoes: 4, entradaDadosOnline: 5,
            eficienciaUsuarioFinal: 4, atualizacaoOnline: 4, processamentoComplexo: 4,
            reusabilidade: 3, facilidadeInstalacao: 3, facilidadeOperacao: 4,
            multiplosLocais: 3, facilidadeMudancas: 3
        }
    },
    {
        id: 'critico',
        nome: 'Sistema Crítico',
        descricao: 'Missão crítica, alta disponibilidade, regras complexas',
        vaf: 1.30,
        valores: {
            comunicacaoDados: 5, processamentoDistribuido: 5, performance: 5,
            configuracaoEquipamento: 5, volumeTransacoes: 5, entradaDadosOnline: 5,
            eficienciaUsuarioFinal: 5, atualizacaoOnline: 5, processamentoComplexo: 5,
            reusabilidade: 4, facilidadeInstalacao: 4, facilidadeOperacao: 5,
            multiplosLocais: 4, facilidadeMudancas: 4
        }
    }
];

interface ValorAjusteContentProps {
    projeto: any;
    onVAChange: (vafData: any) => Promise<void>;
}

const ValorAjusteContent: React.FC<ValorAjusteContentProps> = ({ projeto, onVAChange }) => {
    // Estado das características (inicia em 0)
    const [caracteristicas, setCaracteristicas] = useState<any>(
        CARACTERISTICAS_CGS.reduce((acc: any, cg) => ({ ...acc, [cg.id]: 0 }), {})
    );

    const [modoEdicao, setModoEdicao] = useState('manual'); // 'manual' ou 'perfil'
    const [perfilSelecionado, setPerfilSelecionado] = useState('');
    const [mostrarInfo, setMostrarInfo] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

    // Ref para controlar se é a primeira renderização
    const isFirstRender = useRef(true);

    // Cálculo do VAF
    const calcularVAF = useCallback(() => {
        const soma = Object.values(caracteristicas).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
        const vaf = 0.65 + (soma * 0.01);
        return {
            valor: parseFloat(vaf.toFixed(3)),
            somaInfluencias: soma,
            minimo: 0.65,
            maximo: 1.35,
            intervalo: 0.70 // 1.35 - 0.65
        };
    }, [caracteristicas]);

    const vafAtual = calcularVAF();

    // Função manual para salvar
    const handleSave = async () => {
        if (!onVAChange) return;

        setIsSaving(true);
        try {
            await onVAChange({
                valor: vafAtual.valor,
                caracteristicas: { ...caracteristicas },
                dataCalculo: new Date().toISOString()
            });
            setLastSavedTime(new Date().toLocaleTimeString());
            setTimeout(() => setIsSaving(false), 2000);
        } catch (error) {
            console.error('Erro ao salvar VAF:', error);
            setIsSaving(false);
        }
    };

    // Handler para mudança de valor individual - usa string temporária para evitar flick
    const handleCaracteristicaChange = (id: string, valor: string | number) => {
        // Permite string vazia temporariamente ou converte para número
        let numValor: number;
        if (valor === '' || valor === undefined) {
            numValor = 0;
        } else {
            numValor = typeof valor === 'string' ? parseInt(valor, 10) : valor;
            if (isNaN(numValor)) numValor = 0;
        }

        // Limita entre 0 e 5
        if (numValor < 0) numValor = 0;
        if (numValor > 5) numValor = 5;

        setCaracteristicas(prev => ({
            ...prev,
            [id]: numValor
        }));

        if (modoEdicao !== 'manual') {
            setModoEdicao('manual');
            setPerfilSelecionado('');
        }
    };

    // Handler específico para blur (quando sai do campo)
    const handleCaracteristicaBlur = (id: string, valor: string) => {
        // Garante que o valor final é um número válido
        let numValor = parseInt(valor, 10);
        if (isNaN(numValor) || numValor < 0) numValor = 0;
        if (numValor > 5) numValor = 5;

        setCaracteristicas(prev => ({
            ...prev,
            [id]: numValor
        }));
    };

    // Aplicar perfil pré-definido
    const aplicarPerfil = (perfilId: string) => {
        const perfil = PERFIS_VAF.find(p => p.id === perfilId);
        if (perfil) {
            setCaracteristicas({ ...perfil.valores });
            setPerfilSelecionado(perfilId);
            setModoEdicao('perfil');
        }
    };

    // Resetar todos os valores
    const resetarValores = () => {
        setCaracteristicas(CARACTERISTICAS_CGS.reduce((acc, cg) => ({ ...acc, [cg.id]: 0 }), {}));
        setModoEdicao('manual');
        setPerfilSelecionado('');
    };

    // Carregar VAF salvo do projeto se existir (apenas uma vez)
    useEffect(() => {
        if (projeto?.vaf?.caracteristicas) {
            setCaracteristicas({ ...projeto.vaf.caracteristicas });
        } else {
            // Reset para valores padrão se não houver VAF salvo
            setCaracteristicas(CARACTERISTICAS_CGS.reduce((acc, cg) => ({ ...acc, [cg.id]: 0 }), {}));
        }
        // Reset do flag de primeira renderização quando muda o projeto
        isFirstRender.current = true;
    }, [projeto?.id]); // Só executa quando muda o ID do projeto

    if (!projeto) {
        return (
            <div style={styles.containerVazio}>
                <div style={styles.iconVazio}>⚠️</div>
                <h3 style={styles.tituloVazio}>Nenhum Projeto Selecionado</h3>
                <p style={styles.textoVazio}>Selecione um projeto para configurar o Valor de Ajuste de Função (VAF).</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>{cssStyles}</style>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.tituloPrincipal}>
                    <span style={styles.iconeCalculadora}>🧮</span>
                    <div>
                        <h2 style={styles.tituloTexto}>Valor de Ajuste de Função (VAF)</h2>
                        <p style={styles.subtituloProjeto}>
                            Projeto: <strong>{projeto.nome}</strong>
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {lastSavedTime && (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                            Último salvamento: {lastSavedTime}
                        </span>
                    )}
                    <button
                        style={{
                            ...styles.botaoInfo,
                            backgroundColor: isSaving ? '#f3f4f6' : '#1683c2',
                            color: isSaving ? '#94a3b8' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.875rem',
                            padding: '10px 20px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: isSaving ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <span className="material-symbols-outlined" style={{
                            fontSize: '20px',
                            animation: isSaving ? 'spin 1s linear infinite' : 'none'
                        }}>
                            {isSaving ? 'sync' : 'save'}
                        </span>
                        {isSaving ? 'Salvando...' : 'Salvar no Projeto'}
                    </button>
                    <button
                        style={styles.botaoInfo}
                        onClick={() => setMostrarInfo(!mostrarInfo)}
                        title="Informações sobre VAF"
                    >
                        ℹ️
                    </button>
                </div>
            </div>

            {/* Painel de Informações */}
            {mostrarInfo && (
                <div style={styles.painelInfo}>
                    <h4 style={styles.tituloInfo}>📚 Sobre o VAF</h4>
                    <p style={styles.textoInfo}>
                        O <strong>Valor de Ajuste de Função (VAF)</strong> é utilizado para ajustar a contagem
                        de Pontos de Função Não Ajustados (PFNA) com base em características gerais do sistema.
                    </p>
                    <div style={styles.formulaBox}>
                        <code style={styles.formulaCode}>VAF = 0,65 + (Σ Influências × 0,01)</code>
                    </div>
                    <ul style={styles.listaRegras}>
                        <li><strong>Intervalo:</strong> 0,65 (mínimo) até 1,35 (máximo)</li>
                        <li><strong>Variação:</strong> ±35% sobre o PF bruto</li>
                        <li><strong>Escala:</strong> 0 (nenhuma influência) a 5 (influência forte)</li>
                        <li><strong>Total:</strong> 14 características gerais do sistema</li>
                    </ul>
                </div>
            )}

            {/* Cards de Resumo */}
            <div style={styles.gridResumo}>
                <div style={{ ...styles.cardResumo, ...styles.cardDestaque }}>
                    <span style={styles.labelCard}>VAF Calculado</span>
                    <span style={styles.valorGrande}>{vafAtual.valor.toFixed(2)}</span>
                    <span style={styles.sublabelCard}>
                        {vafAtual.valor < 1 ? 'Reduz' : vafAtual.valor > 1 ? 'Aumenta' : 'Neutro'} o PF em {Math.abs((vafAtual.valor - 1) * 100).toFixed(0)}%
                    </span>
                </div>

                <div style={styles.cardResumo}>
                    <span style={styles.labelCard}>Soma das Influências</span>
                    <span style={styles.valorCard}>{vafAtual.somaInfluencias}</span>
                    <span style={styles.sublabelCard}>de 70 pontos possíveis</span>
                </div>

                <div style={styles.cardResumo}>
                    <span style={styles.labelCard}>Intervalo VAF</span>
                    <span style={styles.valorCard}>
                        {vafAtual.minimo.toFixed(2)} - {vafAtual.maximo.toFixed(2)}
                    </span>
                    <span style={styles.sublabelCard}>Amplitude: {vafAtual.intervalo.toFixed(2)}</span>
                </div>
            </div>

            {/* Seleção de Perfil */}
            <div style={styles.secaoPerfis}>
                <h3 style={styles.tituloSecao}>✅ Perfis Pré-definidos de Mercado</h3>
                <div style={styles.gridPerfis}>
                    {PERFIS_VAF.map(perfil => (
                        <button
                            key={perfil.id}
                            style={{
                                ...styles.cardPerfil,
                                ...(perfilSelecionado === perfil.id ? styles.cardPerfilAtivo : {})
                            }}
                            onClick={() => aplicarPerfil(perfil.id)}
                        >
                            <div style={styles.headerPerfil}>
                                <span style={styles.nomePerfil}>{perfil.nome}</span>
                                <span style={styles.badgeVAF}>VAF: {perfil.vaf.toFixed(2)}</span>
                            </div>
                            <p style={styles.descricaoPerfil}>{perfil.descricao}</p>
                            {perfilSelecionado === perfil.id && (
                                <div style={styles.badgeSelecionado}>✓ Selecionado</div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questionário das 14 Características */}
            <div style={styles.secaoQuestionario}>
                <div style={styles.headerQuestionario}>
                    <h3 style={styles.tituloSecao}>
                        Questionário das 14 Características Gerais do Sistema
                    </h3>
                    <button
                        style={styles.botaoReset}
                        onClick={resetarValores}
                        title="Limpar todos os valores"
                    >
                        🔄 Resetar
                    </button>
                </div>

                <div style={styles.legendaEscala}>
                    <span>0 = Nenhuma influência</span>
                    <span>1 = Insignificante</span>
                    <span>2 = Moderada</span>
                    <span>3 = Média</span>
                    <span>4 = Significativa</span>
                    <span>5 = Forte</span>
                </div>

                <div style={styles.tabelaContainer}>
                    <div style={styles.headerTabela}>
                        <span style={styles.colCaracteristica}>Característica</span>
                        <span style={styles.colDescricao}>Descrição</span>
                        <span style={styles.colNota}>Nota (0-5)</span>
                    </div>

                    {CARACTERISTICAS_CGS.map((cg) => (
                        <div
                            key={cg.id}
                            style={{
                                ...styles.rowTabela,
                                ...(modoEdicao === 'perfil' ? styles.rowPerfil : {})
                            }}
                        >
                            <div style={styles.colCaracteristica}>
                                <strong style={styles.nomeCaracteristica}>{cg.nome}</strong>
                                <small style={styles.exemploCaracteristica}>{cg.exemplo}</small>
                            </div>

                            <div style={styles.colDescricao}>
                                {cg.descricao}
                            </div>

                            <div style={styles.colNota}>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={caracteristicas[cg.id]}
                                    onChange={(e) => handleCaracteristicaChange(cg.id, e.target.value)}
                                    onBlur={(e) => handleCaracteristicaBlur(cg.id, e.target.value)}
                                    style={styles.inputNota}
                                    disabled={modoEdicao === 'perfil'}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer com resultado */}
            <div style={styles.footer}>
                <div style={styles.resultadoFinal}>
                    <div style={styles.formulaVisual}>
                        <span style={styles.parteFormula}>0,65</span>
                        <span style={styles.operadorFormula}>+</span>
                        <span style={styles.parteFormula}>({vafAtual.somaInfluencias} × 0,01)</span>
                        <span style={styles.operadorFormula}>=</span>
                        <span style={styles.destaqueFormula}>{vafAtual.valor.toFixed(3)}</span>
                    </div>
                    <p style={styles.textoResultado}>
                        Este valor será multiplicado pelo total de Pontos de Função Não Ajustados
                        para obter o <strong>PF Ajustado</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Estilos CSS
const styles: Record<string, React.CSSProperties> = {
    container: {
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    containerVazio: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6b7280',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    iconVazio: {
        fontSize: '48px',
        marginBottom: '16px'
    },
    tituloVazio: {
        margin: '0 0 8px 0',
        color: '#374151'
    },
    textoVazio: {
        margin: 0,
        color: '#6b7280'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
    },
    tituloPrincipal: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
    },
    iconeCalculadora: {
        fontSize: '28px'
    },
    tituloTexto: {
        margin: '0 0 4px 0',
        color: '#111827',
        fontSize: '1.5rem',
        fontWeight: 700
    },
    subtituloProjeto: {
        margin: 0,
        color: '#6b7280',
        fontSize: '0.95rem'
    },
    botaoInfo: {
        background: '#f3f4f6',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '20px',
        transition: 'all 0.2s'
    },
    painelInfo: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
    },
    tituloInfo: {
        margin: '0 0 12px 0',
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    textoInfo: {
        margin: '0 0 12px 0',
        color: '#374151',
        lineHeight: 1.6
    },
    formulaBox: {
        background: '#1e3a8a',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '6px',
        fontFamily: "'Courier New', monospace",
        fontSize: '1.1rem',
        textAlign: 'center',
        marginBottom: '12px'
    },
    formulaCode: {
        fontFamily: "'Courier New', monospace"
    },
    listaRegras: {
        margin: 0,
        paddingLeft: '20px',
        color: '#374151'
    },
    gridResumo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
    },
    cardResumo: {
        background: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center',
        transition: 'all 0.2s'
    },
    cardDestaque: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: 'transparent',
        color: 'white',
        transform: 'scale(1.05)'
    },
    labelCard: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '8px',
        opacity: 0.9
    },
    valorCard: {
        display: 'block',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#111827'
    },
    valorGrande: {
        display: 'block',
        fontSize: '2.5rem',
        fontWeight: 700,
        color: 'white'
    },
    sublabelCard: {
        display: 'block',
        fontSize: '0.8rem',
        marginTop: '4px',
        opacity: 0.8
    },
    secaoPerfis: {
        marginBottom: '32px'
    },
    tituloSecao: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '1.1rem',
        color: '#374151',
        marginBottom: '16px',
        fontWeight: 600,
        marginTop: 0
    },
    gridPerfis: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px'
    },
    cardPerfil: {
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        position: 'relative'
    },
    cardPerfilAtivo: {
        borderColor: '#6366f1',
        background: '#eef2ff'
    },
    headerPerfil: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    nomePerfil: {
        fontWeight: 600,
        color: '#111827'
    },
    badgeVAF: {
        background: '#6366f1',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: 600
    },
    descricaoPerfil: {
        margin: 0,
        fontSize: '0.875rem',
        color: '#6b7280',
        lineHeight: 1.4
    },
    badgeSelecionado: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: '#10b981',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '4px 8px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    secaoQuestionario: {
        marginBottom: '24px'
    },
    headerQuestionario: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    botaoReset: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#fee2e2',
        color: '#dc2626',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    legendaEscala: {
        display: 'flex',
        justifyContent: 'space-between',
        background: '#f3f4f6',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '0.8rem',
        color: '#6b7280',
        flexWrap: 'wrap',
        gap: '8px'
    },
    tabelaContainer: {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    headerTabela: {
        display: 'grid',
        gridTemplateColumns: '200px 1fr 120px',
        background: '#f9fafb',
        padding: '12px 16px',
        fontWeight: 600,
        color: '#374151',
        fontSize: '0.875rem',
        borderBottom: '2px solid #e5e7eb'
    },
    rowTabela: {
        display: 'grid',
        gridTemplateColumns: '200px 1fr 120px',
        padding: '16px',
        borderBottom: '1px solid #f3f4f6',
        alignItems: 'center',
        gap: '16px',
        transition: 'background 0.2s'
    },
    rowPerfil: {
        background: '#eef2ff',
        opacity: 0.8
    },
    colCaracteristica: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    nomeCaracteristica: {
        color: '#111827',
        fontSize: '0.95rem'
    },
    exemploCaracteristica: {
        color: '#6b7280',
        fontSize: '0.8rem',
        fontStyle: 'italic'
    },
    colDescricao: {
        color: '#4b5563',
        fontSize: '0.9rem',
        lineHeight: 1.5
    },
    colNota: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputNota: {
        width: '70px',
        padding: '10px',
        border: '2px solid #d1d5db',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#111827',
        transition: 'all 0.2s'
    },
    footer: {
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '24px'
    },
    resultadoFinal: {
        textAlign: 'center'
    },
    formulaVisual: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '12px',
        flexWrap: 'wrap'
    },
    parteFormula: {
        background: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        fontFamily: "'Courier New', monospace",
        fontSize: '1.1rem',
        color: '#374151',
        border: '2px solid #d1d5db'
    },
    operadorFormula: {
        fontSize: '1.5rem',
        color: '#6b7280',
        fontWeight: 300
    },
    destaqueFormula: {
        background: '#6366f1',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontFamily: "'Courier New', monospace",
        fontSize: '1.5rem',
        fontWeight: 700,
        boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)'
    },
    textoResultado: {
        color: '#6b7280',
        fontSize: '0.9rem',
        margin: 0
    }
};

// CSS adicional para elementos que precisam de pseudo-classes
const cssStyles = `
  input[type="number"]:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  input[type="number"]:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  button:active {
    transform: translateY(0);
  }
  @media (max-width: 768px) {
    .vaf-header-tabela, .vaf-row-tabela {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }
    .vaf-header-tabela {
      display: none !important;
    }
    .vaf-col-caracteristica {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .vaf-grid-perfis {
      grid-template-columns: 1fr !important;
    }
    .vaf-grid-resumo {
      grid-template-columns: 1fr !important;
    }
  }
`;

export default ValorAjusteContent;