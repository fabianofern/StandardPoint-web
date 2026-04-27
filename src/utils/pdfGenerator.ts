import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface DataContext {
    projetoAtualObj: any;
    empresaAtualObj: any;
    funcoesToExport: any[];
}

// Helper para converter imagem da URL para base64
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            } else {
                reject(new Error("Could not get 2D context"));
            }
        };
        img.onerror = error => reject(error);
        img.src = imageUrl;
    });
};

// Variável para armazenar o banner em cache
let cachedBanner: string | null = null;

const loadBanner = async () => {
    if (cachedBanner) return cachedBanner;
    try {
        cachedBanner = await getBase64ImageFromUrl('/banner.png');
        return cachedBanner;
    } catch (e) {
        console.warn("Banner corporativo não encontrado (/banner.png).");
        return null;
    }
};

const drawHeaderAndFooter = (doc: any, title: string, dataContext: DataContext, bannerData: string | null, pageNumber: number, totalPages: number | null = null) => {
    const { projetoAtualObj, empresaAtualObj } = dataContext;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header - Logo
    if (bannerData) {
        doc.addImage(bannerData, 'PNG', 14, 10, 40, 15);
    } else {
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138); // Azul Escuro
        doc.setFont("helvetica", "bold");
        doc.text("StandardPoint", 14, 18);
    }

    // Header - Infos
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth - 14, 16, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("helvetica", "normal");
    doc.text(`Empresa: ${empresaAtualObj.nome} | Projeto: ${projetoAtualObj.nome}`, pageWidth - 14, 22, { align: 'right' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 14, 26, { align: 'right' });
    
    // Linha separadora superior
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);

    // Footer
    // Linha separadora inferior
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const pageText = totalPages ? `Página ${pageNumber} de ${totalPages}` : `Página ${pageNumber}`;
    doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
};

export const generateReportPDF = async (activeTab: string, element: HTMLElement, dataContext: DataContext) => {
    const { projetoAtualObj, funcoesToExport } = dataContext;
    const fileName = `Relatorio_${activeTab}_${projetoAtualObj.nome.replace(/\s+/g, '_')}.pdf`;

    let doc: any;
    const bannerData = await loadBanner();

    try {
        if (activeTab === 'gerencial' || activeTab === 'analitico') {
            // A. RELATÓRIO GERENCIAL e B. RELATÓRIO ANALÍTICO
            // Rasterização Total via html2canvas (Retrato)
            doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            // Temporariamente garantimos que o fundo do elemento seja branco antes de fotografar
            const originalBackground = element.style.backgroundColor;
            element.style.backgroundColor = '#ffffff';
            
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            element.style.backgroundColor = originalBackground;
            
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        } else if (activeTab === 'detalhado') {
            // C. RELATÓRIO DETALHADO (Híbrido - Paisagem)
            doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            
            const headerElement = document.getElementById('report-header-section');
            let startYForTable = 35;

            // Tentamos rasterizar o topo se ele existir
            if (headerElement) {
                const originalBg = headerElement.style.backgroundColor;
                headerElement.style.backgroundColor = '#ffffff';
                const canvas = await html2canvas(headerElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                headerElement.style.backgroundColor = originalBg;
                
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                // Calcula as proporções para caber na página com margens
                const imgWidth = pageWidth - 28; // Margens de 14mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                doc.addImage(imgData, 'JPEG', 14, 14, imgWidth, imgHeight);
                startYForTable = 14 + imgHeight + 10;
            } else {
                drawHeaderAndFooter(doc, "RELATÓRIO DETALHADO DE FUNÇÕES", dataContext, bannerData, 1);
                startYForTable = 35;
            }

            // Mapeando dados para a tabela
            const tableData = funcoesToExport.map(f => [
                f.numeroFuncao, 
                f.nome, 
                f.tipo, 
                f.td, 
                f.arTr, 
                f.complexidade, 
                f.pf, 
                f.requisitoId || '-',
                f.listaTDs ? (Array.isArray(f.listaTDs) ? f.listaTDs.join(', ') : f.listaTDs) : '',
                f.listaARsTRs ? (Array.isArray(f.listaARsTRs) ? f.listaARsTRs.join(', ') : f.listaARsTRs) : '',
                f.observacoesAuditoria || ''
            ]);

            autoTable(doc, {
                startY: startYForTable,
                head: [['ID', 'Nome da Função', 'Tipo', 'TD', 'AR/TR', 'Complexidade', 'PF', 'Requisito', 'Evidências (TDs)', 'Evidências (AR/TR)', 'Notas Auditoria']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [18, 70, 226], textColor: 255, fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
                bodyStyles: { fontSize: 7, textColor: [50, 50, 50], font: 'helvetica' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { top: 14, left: 14, right: 14, bottom: 20 },
                columnStyles: {
                    8: { cellWidth: 40 }, // Largura fixa para Evidências
                    9: { cellWidth: 40 },
                    10: { cellWidth: 40 }
                },
                didDrawPage: (data) => {
                    // Apenas desenha o footer nas páginas (header só na primeira se não houve canvas, ou não desenha header se usou canvas na pág 1)
                    // Para simplificar: footer em todas
                    doc.setDrawColor(226, 232, 240);
                    doc.line(14, doc.internal.pageSize.getHeight() - 15, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 15);
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(`Página ${data.pageNumber}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
                }
            });

        } else if (activeTab === 'completo') {
            // D. RELATÓRIO COMPLETO (Vetorial - Paisagem)
            doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            const tableData = funcoesToExport.map(f => [
                f.numeroFuncao, 
                f.nome, 
                f.tipo, 
                f.td, 
                f.arTr, 
                f.complexidade, 
                f.pf, 
                f.requisitoId || '-',
                f.descricao || ''
            ]);

            autoTable(doc, {
                startY: 35,
                head: [['ID', 'Nome da Função', 'Tipo', 'TD', 'AR/TR', 'Compl.', 'PF', 'Requisito', 'Descrição Técnica']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [18, 70, 226], textColor: 255, fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
                bodyStyles: { fontSize: 7, textColor: [50, 50, 50], font: 'helvetica' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { top: 35, left: 14, right: 14, bottom: 20 },
                columnStyles: {
                    8: { cellWidth: 100 } // Limita a largura da descrição longa
                },
                didDrawPage: (data) => {
                    // Header desenhado em TODAS as páginas
                    drawHeaderAndFooter(doc, "RELATÓRIO COMPLETO DE DADOS TÉCNICOS", dataContext, bannerData, data.pageNumber);
                }
            });
        }

        doc.save(fileName);
        return true;
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return false;
    }
};
