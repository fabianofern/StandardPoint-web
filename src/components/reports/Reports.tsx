import React, { useState, useCallback } from 'react';
import ReportHeader from './ReportHeader';
import { useFunctionContext } from '../../context/FunctionContext';
import ReportGerencial from './ReportGerencial';
import ReportAnalitico from './ReportAnalitico';
import ReportDetalhado from './ReportDetalhado';
import ReportCompleto from './ReportCompleto';
import PrintableReport from './PrintableReport';
import { generateReportPDF } from '../../utils/pdfGenerator';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('gerencial');
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const reportRef = React.useRef<any>(null);
    const { empresaAtualObj, projetoAtualObj, totals, funcoes } = useFunctionContext();

    // Função auxiliar para download de CSV
    const downloadCSV = (content, filename) => {
        // Adiciona BOM (Byte Order Mark) para que o Excel identifique UTF-8 corretamente
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!projetoAtualObj || isExportingPDF) return;

        setIsExportingPDF(true);
        
        // Pequeno delay para garantir que o componente PrintableReport 
        // tenha processado qualquer mudança de estado/renderização
        setTimeout(async () => {
            const element = document.getElementById('printable-report-content');
            
            if (!element) {
                console.error('Elemento do relatório não encontrado!');
                setIsExportingPDF(false);
                return;
            }

            const dataContext = {
                projetoAtualObj,
                empresaAtualObj,
                totals,
                funcoesToExport: activeTab === 'completo' ? filteredData : funcoes
            };

            const success = await generateReportPDF(activeTab, element, dataContext);
            
            setIsExportingPDF(false);
        }, 800);
    };

    const handleExportCSV = () => {
        if (!projetoAtualObj) return;

        let csvContent = "";
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `relatorio-${activeTab}-${projetoAtualObj.nome.replace(/\s+/g, '_')}-${timestamp}.csv`;

        switch (activeTab) {
            case 'gerencial':
                csvContent = `Relatório Gerencial - ${projetoAtualObj.nome}\n\n`;
                csvContent += `Métrica,Valor\n`;
                csvContent += `Total PF,${totals.totalPF}\n`;
                csvContent += `PF Bruto,${totals.totalPFBruto}\n`;
                csvContent += `PF Ajustado,${totals.totalPFAjustado}\n`;
                csvContent += `VAF,${totals.vaf}\n`;
                csvContent += `Valor Total (R$),${totals.valorTotal}\n`;
                csvContent += `Esforço (Horas),${totals.esforcoTotal}\n`;
                csvContent += `Data Início,${projetoAtualObj.dataInicioContagem || ''}\n`;
                csvContent += `Última Modificação,${projetoAtualObj.updatedAt || ''}\n`;
                break;

            case 'analitico':
                csvContent = `Relatório Analítico - ${projetoAtualObj.nome}\n\n`;
                csvContent += `Tipo,Quantidade\n`;
                csvContent += `Dados (ALI/AIE/ILF/EIF),${totals.funcoesDados}\n`;
                csvContent += `Transação (EE/SE/CE/EI/EO/EQ),${totals.funcoesTransacao}\n`;
                csvContent += `\nCobertura de Requisitos\n`;
                csvContent += `Total Requisitos,${totals.coberturaRequisitos?.totalRequisitos || 0}\n`;
                csvContent += `Requisitos Vinculados,${totals.coberturaRequisitos?.requisitosVinculados || 0}\n`;
                csvContent += `Percentual Cobertura,${totals.coberturaRequisitos?.percentualCobertura || '0%'}\n`;
                break;

            case 'detalhado':
            case 'completo':
                // Usa os dados filtrados se estiver na aba Completo, senão usa todas as funções
                const dataToExport = activeTab === 'completo' ? filteredData : funcoes;

                csvContent = `Relatório ${activeTab === 'completo' ? 'Completo' : 'Detalhado'} - ${projetoAtualObj.nome}\n`;
                csvContent += `Gerado em: ${new Date().toLocaleString()}\n\n`;

                // Cabeçalho CSV
                csvContent += `ID,Nome,Tipo,TD,AR/TR,Complexidade,PF,Requisito,Descricao\n`;

                // Linhas
                dataToExport.forEach(f => {
                    const row = [
                        f.numeroFuncao,
                        `"${f.nome}"`, // Aspas para evitar quebra com vírgulas no nome
                        f.tipo,
                        f.td,
                        f.arTr,
                        f.complexidade,
                        f.pf,
                        f.requisitoId || '',
                        `"${(f.descricao || '').replace(/"/g, '""')}"` // Escape de aspas na descrição
                    ];
                    csvContent += row.join(',') + "\n";
                });
                break;

            default:
                return;
        }

        downloadCSV(csvContent, filename);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'gerencial': return <ReportGerencial />;
            case 'analitico': return <ReportAnalitico />;
            case 'detalhado': return <ReportDetalhado />;
            case 'completo': return <ReportCompleto onFilteredDataChange={setFilteredData} />;
            default: return <ReportGerencial />;
        }
    };

    // Se não tiver empresa selecionada
    if (!empresaAtualObj) {
        /* ... código anterior ... */
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <h2>Selecione uma empresa para visualizar os relatórios</h2>
            </div>
        );
    }

    return (
        <div className="reports-container">
            <div className="no-print"> {/* Classe para ocultar na impressão */}
                <h1 style={{ marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#1246e2' }}>description</span>
                    Relatórios e Métricas
                </h1>

                <ReportHeader
                    onExportPDF={handleExportPDF}
                    onExportCSV={handleExportCSV}
                    activeTab={activeTab}
                    isExportingPDF={isExportingPDF}
                />

                <div style={styles.tabsContainer}>
                    <button
                        style={activeTab === 'gerencial' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('gerencial')}
                    >
                        <span className="material-symbols-outlined">monitoring</span>
                        Gerencial
                    </button>
                    <button
                        style={activeTab === 'analitico' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('analitico')}
                    >
                        <span className="material-symbols-outlined">analytics</span>
                        Analítico
                    </button>
                    <button
                        style={activeTab === 'detalhado' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('detalhado')}
                    >
                        <span className="material-symbols-outlined">assignment</span>
                        Detalhado
                    </button>
                    <button
                        style={activeTab === 'completo' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('completo')}
                    >
                        <span className="material-symbols-outlined">table_view</span>
                        Dados Completos
                    </button>
                </div>
            </div>

            <div style={styles.contentArea} className="report-print-area">
                {!projetoAtualObj ? (
                    <div style={styles.emptyState}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1' }}>folder_off</span>
                        <p>Selecione um projeto acima para visualizar os dados.</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </div>

            {/* 
                FLASH RENDER: Template para PDF. 
                Durante a exportação, ele fica NO TOPO de tudo para garantir a captura.
                Nos outros momentos, fica fora da área visível.
            */}
            <div style={{ 
                position: 'fixed', 
                top: isExportingPDF ? 0 : '-20000px', 
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 99999, 
                backgroundColor: 'white',
                overflow: 'auto',
                visibility: isExportingPDF ? 'visible' : 'hidden'
            }}>
                <div style={{ width: '750px', margin: '0 auto' }}>
                    <PrintableReport 
                        key={activeTab} // FORÇA O REACT A RECARREGAR O COMPONENTE
                        reportRef={reportRef} 
                        activeTab={activeTab} 
                        filteredData={filteredData} 
                    />
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    tabsContainer: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0',
        borderBottom: '1px solid #e2e8f0',
        overflowX: 'auto',
        paddingBottom: '0',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: 'transparent',
        color: '#64748b',
        border: 'none',
        borderBottom: '2px solid transparent',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
    tabActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: '#eff6ff',
        color: '#1246e2',
        border: 'none',
        borderBottom: '2px solid #1246e2',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
    contentArea: {
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minHeight: '400px',
        border: '1px solid #e2e8f0',
        borderTop: 'none',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        color: '#64748b',
        gap: '1rem',
    }
};

export default Reports;
