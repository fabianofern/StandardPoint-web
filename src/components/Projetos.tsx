// components/Projetos.jsx - VERSÃO COM TIPO DE CONTAGEM E RASTREABILIDADE DE REQUISITOS
import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

interface ProjetosProps {
  onNavigate: (page: string, params?: any) => void;
}

const Projetos: React.FC<ProjetosProps> = ({ onNavigate }) => {
  const {
    empresaAtualObj,
    adicionarProjeto,
    updateEmpresa,
    selecionarProjeto,
    projetoAtual,
    // 🆕 NOVOS HELPERS DE REQUISITOS
    adicionarRequisito,
    atualizarRequisito,
    removerRequisito,
    isRequisitoIdDuplicado,
    getFuncoesPorRequisito
  } = useFunctionContext();

  const [projetos, setProjetos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projetoParaExcluir, setProjetoParaExcluir] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 ESTADO PARA GERENCIAMENTO DE REQUISITOS
  const [showRequisitosModal, setShowRequisitosModal] = useState(false);
  const [projetoSelecionadoRequisitos, setProjetoSelecionadoRequisitos] = useState(null);
  const [editingRequisito, setEditingRequisito] = useState(null);
  const [requisitoFormData, setRequisitoFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    tipo: 'funcional',
    prioridade: 'media'
  });
  const [requisitoErrors, setRequisitoErrors] = useState({});
  const [requisitoToDelete, setRequisitoToDelete] = useState(null);

  // 🆕 ESTADO DO FORMULÁRIO COM TIPO DE CONTAGEM
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    fronteiraAplicacao: '',
    tipoContagem: 'desenvolvimento', // 🆕 NOVO: desenvolvimento | melhoria | aplicacao
    status: 'ativo',
    dataInicioContagem: '',
    dataFimContagem: '',
    dataInicioProjeto: ''
  });

  const [errors, setErrors] = useState({});

  // 🆕 TIPOS DE CONTAGEM IFPUG
  const tiposContagem = [
    {
      value: 'desenvolvimento',
      label: 'Desenvolvimento',
      descricao: 'Nova aplicação do zero',
      cor: '#10b981'
    },
    {
      value: 'melhoria',
      label: 'Melhoria (Enhancement)',
      descricao: 'Manutenção evolutiva/corretiva',
      cor: '#f59e0b'
    },
    {
      value: 'aplicacao',
      label: 'Aplicação (Baseline)',
      descricao: 'Contagem da aplicação existente',
      cor: '#3b82f6'
    }
  ];

  // 🆕 TIPOS DE REQUISITO
  const tiposRequisito = [
    { value: 'funcional', label: 'Funcional', cor: '#10b981', icone: 'task_alt' },
    { value: 'nao-funcional', label: 'Não-Funcional', cor: '#3b82f6', icone: 'speed' }
  ];

  // 🆕 PRIORIDADES
  const prioridades = [
    { value: 'alta', label: 'Alta', cor: '#dc2626' },
    { value: 'media', label: 'Média', cor: '#f59e0b' },
    { value: 'baixa', label: 'Baixa', cor: '#10b981' }
  ];

  // Carregar projetos da empresa atual
  useEffect(() => {
    if (empresaAtualObj) {
      const projetosDaEmpresa = empresaAtualObj.projetos || [];
      setProjetos(projetosDaEmpresa);
      console.log(`📂 [Projetos] Carregados ${projetosDaEmpresa.length} projeto(s) da empresa "${empresaAtualObj.nome}"`);
    }
  }, [empresaAtualObj]);

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const stats = {
      totalProjetos: projetos.length,
      projetosAtivos: projetos.filter(p => p.status === 'ativo').length,
      // 🆕 ESTATÍSTICAS POR TIPO DE CONTAGEM
      projetosDesenvolvimento: projetos.filter(p => p.tipoContagem === 'desenvolvimento' || !p.tipoContagem).length,
      projetosMelhoria: projetos.filter(p => p.tipoContagem === 'melhoria').length,
      projetosAplicacao: projetos.filter(p => p.tipoContagem === 'aplicacao').length,
      totalFuncoes: projetos.reduce((acc, p) => acc + (p.funcoes?.length || 0), 0),
      // 🆕 ESTATÍSTICAS DE REQUISITOS
      totalRequisitos: projetos.reduce((acc, p) => acc + (p.requisitos?.length || 0), 0)
    };

    return stats;
  };

  const estatisticas = calcularEstatisticas();

  // 🆕 VALIDAÇÃO ATUALIZADA
  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome do projeto é obrigatório';
    }

    if (formData.nome.length > 100) {
      novosErros.nome = 'Nome muito longo (máx. 100 caracteres)';
    }

    if (formData.fronteiraAplicacao && formData.fronteiraAplicacao.length > 500) {
      novosErros.fronteiraAplicacao = 'Descrição muito longa (máx. 500 caracteres)';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // 🆕 HANDLER ATUALIZADO COM TIPO DE CONTAGEM
  const handleAbrirFormulario = (projeto = null) => {
    if (projeto) {
      setEditingProjeto(projeto);
      setFormData({
        nome: projeto.nome || '',
        descricao: projeto.descricao || '',
        fronteiraAplicacao: projeto.fronteiraAplicacao || '',
        tipoContagem: projeto.tipoContagem || 'desenvolvimento', // 🆕 CARREGAR TIPO
        status: projeto.status || 'ativo',
        dataInicioContagem: projeto.dataInicioContagem ? new Date(new Date(projeto.dataInicioContagem).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
        dataFimContagem: projeto.dataFimContagem ? new Date(new Date(projeto.dataFimContagem).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
        dataInicioProjeto: projeto.dataInicioProjeto ? projeto.dataInicioProjeto.split('T')[0] : ''
      });
    } else {
      setEditingProjeto(null);
      setFormData({
        nome: '',
        descricao: '',
        fronteiraAplicacao: '',
        tipoContagem: 'desenvolvimento', // 🆕 PADRÃO: DESENVOLVIMENTO
        status: 'ativo',
        dataInicioContagem: '',
        dataFimContagem: '',
        dataInicioProjeto: ''
      });
    }
    setShowForm(true);
    setErrors({});
  };

  const handleFecharFormulario = () => {
    setShowForm(false);
    setEditingProjeto(null);
    setFormData({
      nome: '',
      descricao: '',
      fronteiraAplicacao: '',
      tipoContagem: 'desenvolvimento',
      status: 'ativo',
      dataInicioContagem: '',
      dataFimContagem: '',
      dataInicioProjeto: ''
    });
    setErrors({});
  };

  // 🆕 HANDLER SALVAR ATUALIZADO COM TIPO DE CONTAGEM
  const handleSalvarProjeto = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!empresaAtualObj) {
      console.error('❌ [Projetos] Nenhuma empresa selecionada');
      alert('Selecione uma empresa primeiro');
      return;
    }

    setIsLoading(true);

    try {
      const dadosProjeto = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        fronteiraAplicacao: formData.fronteiraAplicacao.trim(),
        tipoContagem: formData.tipoContagem, // 🆕 SALVAR TIPO DE CONTAGEM
        status: formData.status,
        dataInicioContagem: formData.dataInicioContagem ? new Date(formData.dataInicioContagem).toISOString() : null,
        dataFimContagem: formData.dataFimContagem ? new Date(formData.dataFimContagem).toISOString() : null,
        dataInicioProjeto: formData.dataInicioProjeto ? formData.dataInicioProjeto : null
      };

      if (editingProjeto) {
        console.log('✏️ [Projetos] Atualizando projeto:', editingProjeto.nome);

        const projetoIndex = projetos.findIndex(p => p.id === editingProjeto.id);
        if (projetoIndex === -1) {
          throw new Error('Projeto não encontrado para edição');
        }

        const projetosAtualizados = [...projetos];
        projetosAtualizados[projetoIndex] = {
          ...editingProjeto,
          ...dadosProjeto,
          updatedAt: new Date().toISOString()
        };

        updateEmpresa(empresaAtualObj.id, {
          projetos: projetosAtualizados
        });

        console.log('✅ [Projetos] Projeto atualizado com sucesso');
      } else {
        console.log('➕ [Projetos] Criando novo projeto:', dadosProjeto.nome);

        adicionarProjeto(empresaAtualObj.id, dadosProjeto);

        console.log('✅ [Projetos] Novo projeto criado com sucesso');
      }

      handleFecharFormulario();

    } catch (error) {
      console.error('❌ [Projetos] Erro ao salvar projeto:', error);
      alert(`Erro ao salvar projeto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para excluir projeto
  const handleExcluirProjeto = (projeto) => {
    setProjetoParaExcluir(projeto);
    setShowDeleteConfirm(true);
  };

  const confirmarExclusaoProjeto = async () => {
    if (!projetoParaExcluir || !empresaAtualObj) return;

    setIsLoading(true);

    try {
      console.log('🗑️ [Projetos] Excluindo projeto:', projetoParaExcluir.nome);

      const projetosAtualizados = projetos.filter(p => p.id !== projetoParaExcluir.id);

      updateEmpresa(empresaAtualObj.id, {
        projetos: projetosAtualizados
      });

      if (projetoAtual === projetoParaExcluir.id) {
        selecionarProjeto(null);
      }

      console.log('✅ [Projetos] Projeto excluído com sucesso');
      setShowDeleteConfirm(false);
      setProjetoParaExcluir(null);

    } catch (error) {
      console.error('❌ [Projetos] Erro ao excluir projeto:', error);
      alert(`Erro ao excluir projeto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGerenciarFuncoes = (projetoId) => {
    console.log(`🔗 [Projetos] Navegando para Funções do projeto ID: ${projetoId}`);

    selecionarProjeto(projetoId);

    if (onNavigate) {
      onNavigate('nova-funcao');
    } else {
      window.location.hash = '#nova-funcao';
    }
  };

  const handleAlternarStatus = (projeto) => {
    const novoStatus = projeto.status === 'ativo' ? 'inativo' : 'ativo';

    const projetoIndex = projetos.findIndex(p => p.id === projeto.id);
    if (projetoIndex === -1) return;

    const projetosAtualizados = [...projetos];
    projetosAtualizados[projetoIndex] = {
      ...projeto,
      status: novoStatus,
      updatedAt: new Date().toISOString()
    };

    updateEmpresa(empresaAtualObj.id, {
      projetos: projetosAtualizados
    });

    console.log(`🔄 [Projetos] Status alterado para "${novoStatus}"`);
  };

  // 🆕 ABRIR MODAL DE REQUISITOS
  const handleGerenciarRequisitos = (projeto) => {
    setProjetoSelecionadoRequisitos(projeto);
    setShowRequisitosModal(true);
    resetRequisitoForm();
  };

  // 🆕 FECHAR MODAL DE REQUISITOS
  const handleFecharRequisitos = () => {
    setShowRequisitosModal(false);
    setProjetoSelecionadoRequisitos(null);
    setEditingRequisito(null);
    resetRequisitoForm();
  };

  // 🆕 RESETAR FORM DE REQUISITO
  const resetRequisitoForm = () => {
    setRequisitoFormData({
      id: '',
      nome: '',
      descricao: '',
      tipo: 'funcional',
      prioridade: 'media'
    });
    setRequisitoErrors({});
  };

  // 🆕 VALIDAR FORM DE REQUISITO
  const validarRequisito = () => {
    const erros = {};

    if (!requisitoFormData.id.trim()) {
      erros.id = 'ID do requisito é obrigatório';
    } else if (requisitoFormData.id.length > 10) {
      erros.id = 'ID muito longo (máx. 10 caracteres)';
    } else if (isRequisitoIdDuplicado(
      empresaAtualObj.id,
      projetoSelecionadoRequisitos.id,
      requisitoFormData.id,
      editingRequisito?.id
    )) {
      erros.id = 'ID já existe neste projeto';
    }

    if (!requisitoFormData.nome.trim()) {
      erros.nome = 'Nome do requisito é obrigatório';
    } else if (requisitoFormData.nome.length > 100) {
      erros.nome = 'Nome muito longo (máx. 100 caracteres)';
    }

    if (!requisitoFormData.descricao.trim()) {
      erros.descricao = 'Descrição é obrigatória';
    } else if (requisitoFormData.descricao.length > 500) {
      erros.descricao = 'Descrição muito longa (máx. 500 caracteres)';
    }

    setRequisitoErrors(erros);
    return Object.keys(erros).length === 0;
  };

  // 🆕 SALVAR REQUISITO
  const handleSalvarRequisito = (e) => {
    e.preventDefault();
    if (!validarRequisito()) return;

    const dadosRequisito = {
      id: requisitoFormData.id.trim().toUpperCase(),
      nome: requisitoFormData.nome.trim(),
      descricao: requisitoFormData.descricao.trim(),
      tipo: requisitoFormData.tipo,
      prioridade: requisitoFormData.prioridade
    };

    if (editingRequisito) {
      atualizarRequisito(
        empresaAtualObj.id,
        projetoSelecionadoRequisitos.id,
        editingRequisito.id,
        dadosRequisito
      );
      alert(`✅ Requisito ${dadosRequisito.id} atualizado com sucesso!`);
    } else {
      adicionarRequisito(
        empresaAtualObj.id,
        projetoSelecionadoRequisitos.id,
        dadosRequisito
      );
      alert(`✅ Requisito ${dadosRequisito.id} - ${dadosRequisito.nome} criado com sucesso!`);
    }

    resetRequisitoForm();
    setEditingRequisito(null);
  };

  // 🆕 EDITAR REQUISITO
  const handleEditarRequisito = (requisito) => {
    setEditingRequisito(requisito);
    setRequisitoFormData({
      id: requisito.id,
      nome: requisito.nome || '',
      descricao: requisito.descricao,
      tipo: requisito.tipo || 'funcional',
      prioridade: requisito.prioridade || 'media'
    });
  };

  // 🆕 CONFIRMAR EXCLUSÃO DE REQUISITO
  const handleExcluirRequisito = (requisito) => {
    const funcoesVinculadas = getFuncoesPorRequisito(requisito.id);
    if (funcoesVinculadas.length > 0) {
      if (!window.confirm(
        `⚠️ Atenção: Este requisito está vinculado a ${funcoesVinculadas.length} função(ões).\n\n` +
        `Se excluir, o vínculo será removido dessas funções.\n\n` +
        `Deseja continuar?`
      )) {
        return;
      }
    }
    setRequisitoToDelete(requisito);
  };

  // 🆕 CONFIRMAR EXCLUSÃO
  const confirmarExclusaoRequisito = () => {
    if (!requisitoToDelete) return;
    removerRequisito(
      empresaAtualObj.id,
      projetoSelecionadoRequisitos.id,
      requisitoToDelete.id
    );
    setRequisitoToDelete(null);
  };

  // 🆕 COMPONENTE AUXILIAR: InfoTooltip
  const InfoTooltip = ({ title, content }: { title: string, content: string }) => {
    const [show, setShow] = useState(false);

    return (
      <span style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }}>
        <span
          style={{ cursor: 'help', fontSize: '14px', opacity: 0.6 }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          ℹ️
        </span>
        {show && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '12px',
            backgroundColor: '#1e293b',
            color: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            width: '300px',
            maxWidth: '90vw',
            zIndex: 1001,
            lineHeight: '1.4',
          }}>
            <strong>{title}</strong>
            <div style={{ marginTop: '4px' }}>{content}</div>
          </div>
        )}
      </span>
    );
  };

  // 🆕 COMPONENTE AUXILIAR: Badge de Tipo de Contagem
  const TipoContagemBadge = ({ tipo }: { tipo: string }) => {
    const tipoInfo = tiposContagem.find(t => t.value === tipo) || tiposContagem[0];

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: `${tipoInfo.cor}20`,
        color: tipoInfo.cor,
        border: `1px solid ${tipoInfo.cor}40`,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
          {tipo === 'melhoria' ? 'upgrade' : tipo === 'aplicacao' ? 'inventory' : 'build'}
        </span>
        {tipoInfo.label}
      </span>
    );
  };

  // 🆕 COMPONENTE: Badge de Requisito
  const RequisitoBadge = ({ tipo, prioridade }: { tipo: string, prioridade: string }) => {
    const tipoInfo = tiposRequisito.find(t => t.value === tipo) || tiposRequisito[0];
    const prioridadeInfo = prioridades.find(p => p.value === prioridade) || prioridades[1];

    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.625rem',
          fontWeight: '600',
          backgroundColor: `${tipoInfo.cor}20`,
          color: tipoInfo.cor,
          border: `1px solid ${tipoInfo.cor}40`,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
            {tipoInfo.icone}
          </span>
          {tipoInfo.label}
        </span>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: prioridadeInfo.cor,
          display: 'inline-block',
          title: `Prioridade: ${prioridadeInfo.label}`
        }} />
      </div>
    );
  };

  if (!empresaAtualObj) {
    return (
      <div style={styles.container}>
        <div style={styles.empresaNaoSelecionada}>
          <span className="material-symbols-outlined" style={styles.empresaIcon}>
            business_off
          </span>
          <h3>Nenhuma empresa selecionada</h3>
          <p>Selecione uma empresa para gerenciar projetos.</p>
          <button
            onClick={() => onNavigate && onNavigate('minhas-empresas')}
            style={styles.botaoPrimario}
          >
            <span className="material-symbols-outlined">apartment</span>
            Ir para Minhas Empresas
          </button>
        </div>
      </div>
    );
  }

  // ESTILOS ATUALIZADOS
  const styles: Record<string, React.CSSProperties> = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    empresaNaoSelecionada: {
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    empresaIcon: {
      fontSize: '64px',
      color: '#cbd5e1',
      marginBottom: '1rem',
    },
    header: {
      marginBottom: '2rem',
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
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    empresaNome: {
      fontWeight: '600',
      color: '#1246e2',
    },
    // 🆕 GRID DE ESTATÍSTICAS ATUALIZADO
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1246e2',
      margin: '0 0 0.5rem 0',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#64748b',
      margin: 0,
    },
    // 🆕 ESTATÍSTICAS POR TIPO
    statsTipoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.5rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0',
    },
    statTipoItem: {
      textAlign: 'center',
      padding: '0.5rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#374151',
      margin: 0,
    },
    sectionIcon: {
      color: '#1246e2',
      fontSize: '20px',
    },
    newButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    projetosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '1.5rem',
    },
    projetoCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      transition: 'all 0.2s',
      position: 'relative',
    },
    projetoHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1rem',
    },
    projetoAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      backgroundColor: '#1246e2',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '18px',
      flexShrink: 0,
    },
    projetoInfo: {
      flex: 1,
      minWidth: 0,
    },
    projetoNome: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 0.25rem 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    projetoStatus: {
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '2px 8px',
      borderRadius: '10px',
      display: 'inline-block',
    },
    statusAtivo: {
      color: '#10b981',
      backgroundColor: '#d1fae5',
    },
    statusInativo: {
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
    },
    // 🆕 BADGE DE TIPO DE CONTAGEM NO CARD
    projetoTipoContagem: {
      marginTop: '0.5rem',
    },
    // 🆕 CONTADOR DE REQUISITOS
    projetoRequisitos: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.75rem',
      color: '#64748b',
      marginTop: '0.5rem',
    },
    projetoFronteira: {
      fontSize: '0.75rem',
      color: '#6b7280',
      margin: '0.5rem 0',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '6px',
      borderLeft: '3px solid #3b82f6',
      maxHeight: '60px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    projetoDescricao: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0 0 1rem 0',
      lineHeight: 1.5,
      maxHeight: '60px',
      overflow: 'hidden',
    },
    projetoDetails: {
      fontSize: '0.75rem',
      color: '#6b7280',
      margin: '0 0 0.5rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    projetoActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f1f5f9',
    },
    actionButton: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      color: '#374151',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    editButton: {
      backgroundColor: '#eff6ff',
      color: '#1246e2',
      borderColor: '#dbeafe',
    },
    deleteButton: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fecaca',
    },
    statusButton: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
      borderColor: '#fde68a',
    },
    crsButton: {
      backgroundColor: '#e0e7ff',
      color: '#4f46e5',
      borderColor: '#c7d2fe',
    },
    // 🆕 BOTÃO DE REQUISITOS
    requisitosButton: {
      backgroundColor: '#f0fdf4',
      color: '#15803d',
      borderColor: '#bbf7d0',
    },
    emptyState: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    emptyIcon: {
      fontSize: '48px',
      color: '#cbd5e1',
      marginBottom: '1rem',
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 0.5rem 0',
    },
    emptyText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0 0 1.5rem 0',
    },
    // Modal de formulário
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0f172a',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    modalCloseButton: {
      background: 'none',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    formLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    formError: {
      color: '#dc2626',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#374151',
      backgroundColor: 'white',
    },
    formInputError: {
      borderColor: '#dc2626',
      backgroundColor: '#fef2f2',
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#374151',
      backgroundColor: 'white',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    formTextareaFronteira: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#374151',
      backgroundColor: 'white',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    // 🆕 ESTILOS PARA SELECT DE TIPO DE CONTAGEM
    formSelect: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#374151',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    tipoContagemOption: {
      padding: '0.75rem',
      borderRadius: '6px',
      marginTop: '0.5rem',
      borderLeft: '3px solid',
    },
    formHelpText: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      fontStyle: 'italic',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '2rem',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    submitButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1246e2',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    loadingSpinner: {
      display: 'inline-block',
      animation: 'spin 1s linear infinite',
    },
    // Modal de confirmação de exclusão
    confirmModalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    confirmTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#dc2626',
      margin: '0 0 1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    confirmMessage: {
      color: '#4b5563',
      fontSize: '0.875rem',
      margin: '0 0 1.5rem 0',
      lineHeight: 1.5,
    },
    confirmDetails: {
      backgroundColor: '#f9fafb',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    confirmActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    confirmCancelButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    confirmDeleteButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    botaoPrimario: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1246e2',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    // 🆕 ESTILOS DO MODAL DE REQUISITOS
    requisitosModalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    requisitosHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0',
    },
    requisitosTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0f172a',
      margin: 0,
    },
    requisitosSubtitle: {
      fontSize: '0.875rem',
      color: '#64748b',
      margin: '0.25rem 0 0 0',
    },
    requisitosForm: {
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid #e2e8f0',
    },
    requisitosFormTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    requisitosGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem',
    },
    requisitosList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    requisitoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      transition: 'all 0.2s',
    },
    requisitoItemEditing: {
      borderColor: '#1246e2',
      backgroundColor: '#eff6ff',
    },
    requisitoInfo: {
      flex: 1,
      minWidth: 0,
    },
    requisitoId: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#0f172a',
      fontFamily: 'monospace',
      marginBottom: '0.25rem',
    },
    requisitoDescricao: {
      fontSize: '0.875rem',
      color: '#475569',
      lineHeight: 1.4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
    requisitoActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    requisitoButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#64748b',
    },
    requisitoButtonEdit: {
      color: '#3b82f6',
      borderColor: '#dbeafe',
      backgroundColor: '#eff6ff',
    },
    requisitoButtonDelete: {
      color: '#dc2626',
      borderColor: '#fecaca',
      backgroundColor: '#fef2f2',
    },
    requisitoVinculos: {
      fontSize: '0.75rem',
      color: '#059669',
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    emptyRequisitos: {
      textAlign: 'center',
      padding: '3rem 2rem',
      color: '#64748b',
    },
    coberturaBar: {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f0fdf4',
      borderRadius: '8px',
      border: '1px solid #bbf7d0',
    },
    coberturaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    coberturaLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#15803d',
    },
    coberturaValue: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#15803d',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#dcfce7',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#22c55e',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
  };

  // 🆕 CALCULAR ESTATÍSTICAS DE COBERTURA
  const calcularCobertura = (projeto) => {
    if (!projeto?.requisitos || projeto.requisitos.length === 0) return null;

    const funcoes = projeto.funcoes || [];
    const requisitosVinculados = new Set(funcoes.map(f => f.requisitoId).filter(Boolean));
    const total = projeto.requisitos.length;
    const vinculados = requisitosVinculados.size;
    const percentual = Math.round((vinculados / total) * 100);

    return { total, vinculados, percentual };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span className="material-symbols-outlined" style={styles.titleIcon}>
            folder
          </span>
          Projetos
        </h1>
        <p style={styles.subtitle}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            apartment
          </span>
          Empresa: <span style={styles.empresaNome}>{empresaAtualObj.nome}</span>
        </p>
      </div>

      {/* Estatísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{estatisticas.totalProjetos}</h3>
          <p style={styles.statLabel}>Total de Projetos</p>

          {/* 🆕 ESTATÍSTICAS POR TIPO DE CONTAGEM */}
          <div style={styles.statsTipoGrid}>
            <div style={{ ...styles.statTipoItem, backgroundColor: '#d1fae5', color: '#065f46' }}>
              <div style={{ fontWeight: 'bold' }}>{estatisticas.projetosDesenvolvimento}</div>
              <div>Dev</div>
            </div>
            <div style={{ ...styles.statTipoItem, backgroundColor: '#fef3c7', color: '#92400e' }}>
              <div style={{ fontWeight: 'bold' }}>{estatisticas.projetosMelhoria}</div>
              <div>Melh</div>
            </div>
            <div style={{ ...styles.statTipoItem, backgroundColor: '#dbeafe', color: '#1e40af' }}>
              <div style={{ fontWeight: 'bold' }}>{estatisticas.projetosAplicacao}</div>
              <div>App</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{estatisticas.projetosAtivos}</h3>
          <p style={styles.statLabel}>Projetos Ativos</p>
        </div>

        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{estatisticas.totalFuncoes}</h3>
          <p style={styles.statLabel}>Funções PF</p>
        </div>

        {/* 🆕 CARD DE REQUISITOS */}
        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{estatisticas.totalRequisitos}</h3>
          <p style={styles.statLabel}>Requisitos</p>
        </div>
      </div>

      {/* Seção de Projetos */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <span className="material-symbols-outlined" style={styles.sectionIcon}>
              folder_open
            </span>
            Todos os Projetos
          </h2>

          <button
            style={styles.newButton}
            onClick={() => handleAbrirFormulario()}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined">add</span>
            Novo Projeto
          </button>
        </div>

        {projetos.length === 0 ? (
          <div style={styles.emptyState}>
            <span className="material-symbols-outlined" style={styles.emptyIcon}>
              folder_off
            </span>
            <h3 style={styles.emptyTitle}>Nenhum projeto cadastrado</h3>
            <p style={styles.emptyText}>
              Esta empresa ainda não tem projetos cadastrados.
              Clique em "Novo Projeto" para criar o primeiro projeto.
            </p>
            <button
              style={styles.newButton}
              onClick={() => handleAbrirFormulario()}
              disabled={isLoading}
            >
              <span className="material-symbols-outlined">add</span>
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div style={styles.projetosGrid}>
            {projetos.map((projeto) => {
              const funcoesCount = projeto.funcoes?.length || 0;
              const requisitosCount = projeto.requisitos?.length || 0;
              const cobertura = calcularCobertura(projeto);

              return (
                <div key={projeto.id} style={styles.projetoCard}>
                  <div style={styles.projetoHeader}>
                    <div style={styles.projetoAvatar}>
                      {projeto.nome?.substring(0, 2).toUpperCase() || 'PJ'}
                    </div>

                    <div style={styles.projetoInfo}>
                      <h3 style={styles.projetoNome} title={projeto.nome}>
                        {projeto.nome}
                      </h3>
                      <span style={{
                        ...styles.projetoStatus,
                        ...(projeto.status === 'ativo' ? styles.statusAtivo : styles.statusInativo)
                      }}>
                        {projeto.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                      {/* 🆕 BADGE DE TIPO DE CONTAGEM */}
                      <div style={styles.projetoTipoContagem}>
                        <TipoContagemBadge tipo={projeto.tipoContagem || 'desenvolvimento'} />
                      </div>
                      {/* 🆕 CONTADOR DE REQUISITOS */}
                      <div style={styles.projetoRequisitos}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          task_alt
                        </span>
                        {requisitosCount} requisito(s)
                        {cobertura && (
                          <span style={{ marginLeft: '8px', color: cobertura.percentual === 100 ? '#059669' : '#f59e0b' }}>
                            ({cobertura.percentual}% vinculado)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {projeto.fronteiraAplicacao && (
                    <div style={styles.projetoFronteira} title={projeto.fronteiraAplicacao}>
                      <strong>Fronteira:</strong> {projeto.fronteiraAplicacao}
                    </div>
                  )}

                  {projeto.descricao && (
                    <p style={styles.projetoDescricao}>{projeto.descricao}</p>
                  )}

                  <div style={styles.projetoDetails}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      description
                    </span>
                    <span>{funcoesCount} função(ões)</span>
                  </div>

                  <div style={styles.projetoDetails}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      calendar_today
                    </span>
                    <span>
                      Criado em: {new Date(projeto.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div style={styles.projetoActions}>
                    <button
                      style={{ ...styles.actionButton, ...styles.crsButton }}
                      onClick={() => handleGerenciarFuncoes(projeto.id)}
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        list
                      </span>
                      Funções
                    </button>

                    {/* 🆕 BOTÃO DE REQUISITOS */}
                    <button
                      style={{ ...styles.actionButton, ...styles.requisitosButton }}
                      onClick={() => handleGerenciarRequisitos(projeto)}
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        task_alt
                      </span>
                      Requisitos
                      {requisitosCount > 0 && (
                        <span style={{
                          marginLeft: '4px',
                          backgroundColor: '#15803d',
                          color: 'white',
                          borderRadius: '10px',
                          padding: '2px 6px',
                          fontSize: '0.625rem',
                        }}>
                          {requisitosCount}
                        </span>
                      )}
                    </button>

                    <button
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onClick={() => handleAbrirFormulario(projeto)}
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        edit
                      </span>
                      Editar
                    </button>

                    <button
                      style={{ ...styles.actionButton, ...styles.statusButton }}
                      onClick={() => handleAlternarStatus(projeto)}
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {projeto.status === 'ativo' ? 'toggle_off' : 'toggle_on'}
                      </span>
                      {projeto.status === 'ativo' ? 'Inativar' : 'Ativar'}
                    </button>

                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => handleExcluirProjeto(projeto)}
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        delete
                      </span>
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Formulário (Criar/Editar Projeto) */}
      {showForm && (
        <div style={styles.modalOverlay} onClick={handleFecharFormulario}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span className="material-symbols-outlined">
                  {editingProjeto ? 'edit' : 'add'}
                </span>
                {editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
              </h3>
              <button
                style={styles.modalCloseButton}
                onClick={handleFecharFormulario}
                disabled={isLoading}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSalvarProjeto}>
              {/* Nome do Projeto */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  style={{
                    ...styles.formInput,
                    ...(errors.nome && styles.formInputError)
                  }}
                  placeholder="Ex: Sistema de Gestão Comercial"
                  disabled={isLoading}
                  autoFocus
                />
                {errors.nome && (
                  <span style={styles.formError}>{errors.nome}</span>
                )}
              </div>

              {/* 🆕 TIPO DE CONTAGEM */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Tipo de Contagem *
                  <InfoTooltip
                    title="Tipos de Contagem IFPUG"
                    content="Desenvolvimento: Nova aplicação. Melhoria: Manutenção evolutiva (usa fórmula ADD/CHG/DEL). Aplicação: Baseline da aplicação existente."
                  />
                </label>
                <select
                  value={formData.tipoContagem}
                  onChange={(e) => setFormData({ ...formData, tipoContagem: e.target.value })}
                  style={styles.formSelect}
                  disabled={isLoading}
                >
                  {tiposContagem.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {/* 🆕 DESCRIÇÃO DO TIPO SELECIONADO */}
                {(() => {
                  const tipoSelecionado = tiposContagem.find(t => t.value === formData.tipoContagem);
                  return (
                    <div style={{
                      ...styles.tipoContagemOption,
                      backgroundColor: `${tipoSelecionado.cor}10`,
                      borderLeftColor: tipoSelecionado.cor,
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '6px',
                    }}>
                      <div style={{ fontWeight: '600', color: tipoSelecionado.cor, fontSize: '0.875rem' }}>
                        {tipoSelecionado.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                        {tipoSelecionado.descricao}
                      </div>
                      {formData.tipoContagem === 'melhoria' && (
                        <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '4px', fontStyle: 'italic' }}>
                          ⚠️ Será necessário classificar funções como ADD, CHG ou DEL
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Fronteira da Aplicação */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Fronteira da Aplicação (Application Boundary)
                  <InfoTooltip
                    title="O que é Fronteira da Aplicação?"
                    content="Define o escopo do software sendo medido. Inclui: sistemas externos que interagem, bancos de dados mantidos, interfaces com usuários. Exclui: sistemas operacionais, hardware, outros softwares não relacionados."
                  />
                </label>
                <textarea
                  value={formData.fronteiraAplicacao}
                  onChange={(e) => setFormData({ ...formData, fronteiraAplicacao: e.target.value })}
                  style={errors.fronteiraAplicacao ? { ...styles.formTextareaFronteira, ...styles.formInputError } : styles.formTextareaFronteira}
                  placeholder="Descreva a fronteira da aplicação conforme IFPUG...

Exemplo:
- Sistema web de e-commerce
- Integra com gateway de pagamento externo
- Mantém cadastro de produtos e clientes
- Interface com sistema de estoque legado"
                  disabled={isLoading}
                />
                {errors.fronteiraAplicacao && (
                  <span style={styles.formError}>{errors.fronteiraAplicacao}</span>
                )}
                <div style={styles.formHelpText}>
                  Recomendado para garantir consistência na contagem. Máx. 500 caracteres.
                </div>
              </div>

              {/* Descrição */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  style={styles.formTextarea}
                  placeholder="Descreva o objetivo e escopo do projeto..."
                  disabled={isLoading}
                />
              </div>

              {/* 🆕 DATAS DE CONTAGEM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.formLabel}>
                    Data de Início da Contagem
                    <InfoTooltip
                      title="Data de Início da Contagem"
                      content="Data em que a contagem de funções começou. Geralmente é a data de criação do projeto."
                    />
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataInicioContagem}
                    onChange={(e) => setFormData({ ...formData, dataInicioContagem: e.target.value })}
                    style={styles.formInput}
                  />
                </div>

                <div>
                  <label style={styles.formLabel}>
                    Data de Fim da Contagem
                    <InfoTooltip
                      title="Data de Fim da Contagem"
                      content="Data em que a contagem de funções foi finalizada. Atualizada automaticamente ao adicionar funções, mas pode ser editada manualmente."
                    />
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataFimContagem}
                    onChange={(e) => setFormData({ ...formData, dataFimContagem: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              {/* 🆕 DATAS DO PROJETO E STATUS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.formLabel}>
                    Data de Início do Projeto *
                    <InfoTooltip
                      title="Data de Início (Execução)"
                      content="Data prevista para o início dos trabalhos da equipe alocada no módulo de Estimativas."
                    />
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]} // Bloqueia passado
                    value={formData.dataInicioProjeto}
                    onChange={(e) => {
                      const dataSelecionada = e.target.value;
                      if (dataSelecionada) {
                        const dataObj = new Date(dataSelecionada + "T00:00:00");
                        const diaDaSemana = dataObj.getDay();
                        // 0 = Domingo, 6 = Sábado
                        if (diaDaSemana === 0 || diaDaSemana === 6) {
                          alert("Atenção: Projetos não podem ser iniciados em finais de semana (Sábado ou Domingo). Por favor, escolha um dia útil.");
                          e.target.value = formData.dataInicioProjeto; // Reverter visualmente
                          return;
                        }
                      }
                      setFormData({ ...formData, dataInicioProjeto: dataSelecionada });
                    }}
                    style={{
                      ...styles.formInput,
                      ...(errors.dataInicioProjeto && styles.formInputError)
                    }}
                    required
                  />
                  {errors.dataInicioProjeto && (
                    <span style={styles.formError}>{errors.dataInicioProjeto}</span>
                  )}
                </div>

                {/* Status */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.formSelect}
                    disabled={isLoading}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={handleFecharFormulario}
                  style={styles.cancelButton}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    ...(isLoading && styles.submitButtonDisabled)
                  }}
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {editingProjeto ? 'save' : 'add'}
                  </span>
                  {isLoading ? 'Salvando...' : (editingProjeto ? 'Salvar Alterações' : 'Criar Projeto')}
                  {isLoading && (
                    <span className="material-symbols-outlined" style={styles.loadingSpinner}>
                      sync
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🆕 MODAL DE GERENCIAMENTO DE REQUISITOS */}
      {showRequisitosModal && projetoSelecionadoRequisitos && (
        <div style={styles.modalOverlay} onClick={handleFecharRequisitos}>
          <div style={styles.requisitosModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.requisitosHeader}>
              <div>
                <h3 style={styles.requisitosTitle}>
                  <span className="material-symbols-outlined" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    task_alt
                  </span>
                  Gerenciar Requisitos
                </h3>
                <p style={styles.requisitosSubtitle}>
                  Projeto: {projetoSelecionadoRequisitos.nome}
                </p>
              </div>
              <button
                style={styles.modalCloseButton}
                onClick={handleFecharRequisitos}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulário de Requisito */}
            <div style={styles.requisitosForm}>
              <h4 style={styles.requisitosFormTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {editingRequisito ? 'edit' : 'add_circle'}
                </span>
                {editingRequisito ? 'Editar Requisito' : 'Adicionar Requisito'}
              </h4>

              <form onSubmit={handleSalvarRequisito}>
                <div style={styles.requisitosGrid}>
                  <div>
                    <label style={styles.formLabel}>
                      ID do Requisito *
                      <InfoTooltip
                        title="ID do Requisito"
                        content="Digite um identificador único (máx. 10 caracteres). Exemplos: RF01, REQ01, US123. Não pode se repetir no projeto."
                      />
                    </label>
                    <input
                      type="text"
                      value={requisitoFormData.id}
                      onChange={(e) => setRequisitoFormData({ ...requisitoFormData, id: e.target.value })}
                      style={{
                        ...styles.formInput,
                        ...(requisitoErrors.id && styles.formInputError),
                        fontFamily: 'monospace',
                        textTransform: 'uppercase'
                      }}
                      placeholder="Ex: RF01"
                      maxLength={10}
                      disabled={!!editingRequisito}
                    />
                    {requisitoErrors.id && (
                      <span style={styles.formError}>{requisitoErrors.id}</span>
                    )}
                  </div>

                  <div>
                    <label style={styles.formLabel}>
                      Nome do Requisito *
                      <InfoTooltip
                        title="Nome do Requisito"
                        content="Nome curto e descritivo do requisito. Exemplo: 'Cadastrar Clientes', 'Gerar Relatório de Vendas'."
                      />
                    </label>
                    <input
                      type="text"
                      value={requisitoFormData.nome}
                      onChange={(e) => setRequisitoFormData({ ...requisitoFormData, nome: e.target.value })}
                      style={{
                        ...styles.formInput,
                        ...(requisitoErrors.nome && styles.formInputError)
                      }}
                      placeholder="Ex: Cadastrar Clientes"
                      maxLength={100}
                    />
                    {requisitoErrors.nome && (
                      <span style={styles.formError}>{requisitoErrors.nome}</span>
                    )}
                  </div>

                  <div>
                    <label style={styles.formLabel}>Tipo *</label>
                    <select
                      value={requisitoFormData.tipo}
                      onChange={(e) => setRequisitoFormData({ ...requisitoFormData, tipo: e.target.value })}
                      style={styles.formSelect}
                    >
                      {tiposRequisito.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={styles.formLabel}>
                    Descrição *
                    {requisitoErrors.descricao && <span style={styles.formError}> - {requisitoErrors.descricao}</span>}
                  </label>
                  <textarea
                    value={requisitoFormData.descricao}
                    onChange={(e) => setRequisitoFormData({ ...requisitoFormData, descricao: e.target.value })}
                    style={{
                      ...styles.formTextarea,
                      ...(requisitoErrors.descricao && styles.formInputError),
                      minHeight: '80px'
                    }}
                    placeholder="Descreva o requisito de forma clara e objetiva..."
                    maxLength={500}
                  />
                  <div style={styles.formHelpText}>
                    {requisitoFormData.descricao.length}/500 caracteres
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={styles.formLabel}>Prioridade (opcional)</label>
                  <select
                    value={requisitoFormData.prioridade}
                    onChange={(e) => setRequisitoFormData({ ...requisitoFormData, prioridade: e.target.value })}
                    style={styles.formSelect}
                  >
                    {prioridades.map(p => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formActions}>
                  {editingRequisito && (
                    <button
                      type="button"
                      onClick={resetRequisitoForm}
                      style={styles.cancelButton}
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button
                    type="submit"
                    style={styles.submitButton}
                  >
                    <span className="material-symbols-outlined">
                      {editingRequisito ? 'save' : 'add'}
                    </span>
                    {editingRequisito ? 'Salvar Alterações' : 'Adicionar Requisito'}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Requisitos */}
            <div>
              <h4 style={{ ...styles.requisitosFormTitle, marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  list
                </span>
                Requisitos Cadastrados ({projetoSelecionadoRequisitos.requisitos?.length || 0})
              </h4>

              {(!projetoSelecionadoRequisitos.requisitos || projetoSelecionadoRequisitos.requisitos.length === 0) ? (
                <div style={styles.emptyRequisitos}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block' }}>
                    inbox
                  </span>
                  <p>Nenhum requisito cadastrado ainda.</p>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Adicione requisitos para vincular às funções PF.
                  </p>
                </div>
              ) : (
                <div style={styles.requisitosList}>
                  {/* 🆕 BUSCAR REQUISITOS DIRETAMENTE DO ESTADO GLOBAL PARA SINCRONIZAÇÃO INSTANTÂNEA */}
                  {(empresaAtualObj.projetos.find(p => p.id === projetoSelecionadoRequisitos.id)?.requisitos || []).map((requisito) => {
                    const funcoesVinculadas = getFuncoesPorRequisito(requisito.id);
                    const isEditing = editingRequisito?.id === requisito.id;

                    return (
                      <div
                        key={requisito.id}
                        style={{
                          ...styles.requisitoItem,
                          ...(isEditing && styles.requisitoItemEditing)
                        }}
                      >
                        <div>
                          <RequisitoBadge
                            tipo={requisito.tipo}
                            prioridade={requisito.prioridade}
                          />
                        </div>

                        <div style={styles.requisitoInfo}>
                          <div style={styles.requisitoId}>
                            {requisito.id}{requisito.nome ? ` - ${requisito.nome}` : ''}
                          </div>
                          <div style={styles.requisitoDescricao} title={requisito.descricao}>
                            {requisito.descricao}
                          </div>
                          {funcoesVinculadas.length > 0 && (
                            <div style={styles.requisitoVinculos}>
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                                link
                              </span>
                              Vinculado a {funcoesVinculadas.length} função(ões)
                            </div>
                          )}
                        </div>

                        <div style={styles.requisitoActions}>
                          <button
                            style={{ ...styles.requisitoButton, ...styles.requisitoButtonEdit }}
                            onClick={() => handleEditarRequisito(requisito)}
                            title="Editar requisito"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              edit
                            </span>
                          </button>
                          <button
                            style={{ ...styles.requisitoButton, ...styles.requisitoButtonDelete }}
                            onClick={() => handleExcluirRequisito(requisito)}
                            title="Excluir requisito"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Barra de Progresso de Cobertura */}
              {(() => {
                const cobertura = calcularCobertura(projetoSelecionadoRequisitos);
                if (!cobertura || cobertura.total === 0) return null;

                return (
                  <div style={styles.coberturaBar}>
                    <div style={styles.coberturaHeader}>
                      <span style={styles.coberturaLabel}>Cobertura de Requisitos</span>
                      <span style={styles.coberturaValue}>
                        {cobertura.vinculados} de {cobertura.total} ({cobertura.percentual}%)
                      </span>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${cobertura.percentual}%`,
                          backgroundColor: cobertura.percentual === 100 ? '#22c55e' :
                            cobertura.percentual >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                    <div style={{ ...styles.formHelpText, marginTop: '0.5rem' }}>
                      {cobertura.percentual === 100
                        ? '✅ Todos os requisitos estão vinculados a funções PF'
                        : '⚠️ Alguns requisitos ainda não possuem funções vinculadas'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Requisito */}
      {requisitoToDelete && (
        <div style={styles.modalOverlay} onClick={() => setRequisitoToDelete(null)}>
          <div style={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>
              <span className="material-symbols-outlined">warning</span>
              Excluir Requisito
            </h3>

            <p style={styles.confirmMessage}>
              Tem certeza que deseja excluir o requisito <strong>"{requisitoToDelete.id}"</strong>?
            </p>

            <div style={styles.confirmDetails}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Atenção:</strong> Esta ação não pode ser desfeita.
              </div>
              <div>
                • {requisitoToDelete.descricao}
              </div>
            </div>

            <div style={styles.confirmActions}>
              <button
                style={styles.confirmCancelButton}
                onClick={() => setRequisitoToDelete(null)}
              >
                Cancelar
              </button>
              <button
                style={styles.confirmDeleteButton}
                onClick={confirmarExclusaoRequisito}
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Projeto */}
      {showDeleteConfirm && projetoParaExcluir && (
        <div style={styles.modalOverlay} onClick={() => !isLoading && setShowDeleteConfirm(false)}>
          <div style={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>
              <span className="material-symbols-outlined">warning</span>
              Excluir Projeto
            </h3>

            <p style={styles.confirmMessage}>
              Tem certeza que deseja excluir o projeto <strong>"{projetoParaExcluir.nome}"</strong>?
            </p>

            <div style={styles.confirmDetails}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Atenção:</strong> Esta ação não pode ser desfeita.
              </div>
              <div>
                • {projetoParaExcluir.funcoes?.length || 0} função(ões) direta(s) serão excluídas
                <br />
                • {projetoParaExcluir.requisitos?.length || 0} requisito(s) serão excluídos
                <br />
                • Todas as funções PF relacionadas serão perdidas
              </div>
            </div>

            <div style={styles.confirmActions}>
              <button
                style={styles.confirmCancelButton}
                onClick={() => !isLoading && setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                style={styles.confirmDeleteButton}
                onClick={confirmarExclusaoProjeto}
                disabled={isLoading}
              >
                {isLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projetos;