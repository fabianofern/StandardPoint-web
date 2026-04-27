import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';

const EmpresaConfig = ({ isCreatingNew = false, onNavigate, empresaId }) => {
  const {
    empresaAtualObj,
    updateEmpresa,
    adicionarEmpresa,
    removerEmpresa,
    selecionarEmpresa,
    empresas
  } = useFunctionContext();

  // Estado para hover
  const [submitHover, setSubmitHover] = useState(false);
  const [resetHover, setResetHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estados adicionais
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Estado do formulário ATUALIZADO
  const [formData, setFormData] = useState({
    nome: '',
    valorPF: '',
    hcpp: '',
    tecnologias: [],
    experienciaTime: [],
    faseCiclo: 'codificacao'
  });

  // Estados para novos itens
  const [novaTecnologia, setNovaTecnologia] = useState('');

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // ✅ CORRIGIDO: Verificar se estamos editando empresa específica via ID
  useEffect(() => {
    console.log('🔗 [EmpresaConfig] Inicializando:', {
      isCreatingNew,
      empresaId,
      empresaAtualObjId: empresaAtualObj?.id,
      empresaAtualObjNome: empresaAtualObj?.nome,
      totalEmpresas: empresas.length
    });

    // Se temos um empresaId específico, encontrar essa empresa
    let empresaParaEditar = empresaAtualObj;

    if (empresaId && empresas.length > 0) {
      const empresaEncontrada = empresas.find(emp => emp.id === empresaId);
      if (empresaEncontrada) {
        empresaParaEditar = empresaEncontrada;
        console.log('🔗 [EmpresaConfig] Empresa encontrada pelo ID:', empresaEncontrada.nome);
      }
    }

    if (isCreatingNew) {
      // Resetar para formulário vazio
      setFormData({
        nome: '',
        valorPF: '',
        hcpp: '',
        tecnologias: [],
        experienciaTime: [],
        faseCiclo: 'codificacao'
      });
      console.log('🔗 [EmpresaConfig] Modo criação - formulário resetado');
    } else if (empresaParaEditar) {
      // Carregar dados da empresa para editar
      setFormData({
        nome: empresaParaEditar.nome || '',
        valorPF: empresaParaEditar.valorPF || 850.00,
        hcpp: empresaParaEditar.hcpp || 20,
        tecnologias: empresaParaEditar.tecnologias || [],
        experienciaTime: empresaParaEditar.experienciaTime || [],
        faseCiclo: empresaParaEditar.faseCiclo || 'codificacao'
      });
      console.log('🔗 [EmpresaConfig] Carregados dados da empresa:', empresaParaEditar.nome);
    } else {
      console.warn('⚠️ [EmpresaConfig] Nenhuma empresa para editar e não está criando nova');
    }
  }, [empresaAtualObj, isCreatingNew, empresaId, empresas]);

  // ✅ CORRIGIDO: Adicionar estilo para animação apenas uma vez
  useEffect(() => {
    if (!document.getElementById('empresa-config-styles')) {
      const style = document.createElement('style');
      style.id = 'empresa-config-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .preset-item-hover:hover {
          border-color: #1246e2 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
        
        .tag-hover:hover {
          background-color: #a5b4fc !important;
          border-color: #818cf8 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ✅ CORRIGIDO: Redirecionar após sucesso
  useEffect(() => {
    if (shouldRedirect && onNavigate) {
      console.log('🔗 [EmpresaConfig] Redirecionando após ação...');
      setTimeout(() => {
        onNavigate('minhas-empresas');
      }, 1500);
      setShouldRedirect(false);
    }
  }, [shouldRedirect, onNavigate]);

  // Handlers para inputs normais
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'experienciaTime') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else if (name === 'valorPF' || name === 'hcpp') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handler para adicionar tecnologia manualmente
  const handleAddTecnologia = () => {
    const tech = novaTecnologia.trim();
    if (tech && !formData.tecnologias.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tecnologias: [...prev.tecnologias, tech]
      }));
      setNovaTecnologia('');
    }
  };

  // Handler para remover tecnologia
  const handleRemoveTecnologia = (tech) => {
    setFormData(prev => ({
      ...prev,
      tecnologias: prev.tecnologias.filter(t => t !== tech)
    }));
  };

  // ✅ CORRIGIDO: Handler para excluir empresa
  const handleDeleteEmpresa = async () => {
    if (!empresaAtualObj) {
      console.error('❌ [EmpresaConfig] Nenhuma empresa para excluir');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('🗑️ [EmpresaConfig] Excluindo empresa:', empresaAtualObj.nome);

      removerEmpresa(empresaAtualObj.id);

      // Desselecionar empresa
      selecionarEmpresa(null);

      setShowDeleteConfirm(false);
      setIsDeleting(false);

      // Navegar de volta para lista
      console.log('🔗 [EmpresaConfig] Navegando para lista após exclusão');
      if (onNavigate) {
        onNavigate('minhas-empresas');
      } else {
        // Fallback
        window.location.hash = '#minhas-empresas';
      }

    } catch (error) {
      console.error('❌ [EmpresaConfig] Erro ao excluir empresa:', error);
      setIsDeleting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.valorPF <= 0) {
      newErrors.valorPF = 'Valor do PF deve ser maior que zero';
    }

    if (formData.hcpp < 4 || formData.hcpp > 25) {
      newErrors.hcpp = 'HCPP deve estar entre 4 e 25 horas/PF';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CORRIGIDO: Handle submit com navegação
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isCreatingNew) {
        // Criar nova empresa
        console.log('➕ [EmpresaConfig] Criando nova empresa:', formData.nome);
        adicionarEmpresa({
          nome: formData.nome.trim(),
          valorPF: parseFloat(formData.valorPF.toFixed(2)),
          hcpp: parseFloat(formData.hcpp.toFixed(1)),
          tecnologias: formData.tecnologias,
          experienciaTime: formData.experienciaTime,
          faseCiclo: formData.faseCiclo
        });

        setSuccess(true);
        console.log('✅ [EmpresaConfig] Nova empresa criada com sucesso');

        // Redirecionar após criação
        setTimeout(() => {
          setShouldRedirect(true);
        }, 1000);

      } else if (empresaAtualObj) {
        // Atualizar empresa existente
        console.log('✏️ [EmpresaConfig] Atualizando empresa:', empresaAtualObj.nome);
        updateEmpresa(empresaAtualObj.id, {
          nome: formData.nome.trim(),
          valorPF: parseFloat(formData.valorPF.toFixed(2)),
          hcpp: parseFloat(formData.hcpp.toFixed(1)),
          tecnologias: formData.tecnologias,
          experienciaTime: formData.experienciaTime,
          faseCiclo: formData.faseCiclo
        });

        setSuccess(true);
        console.log('✅ [EmpresaConfig] Empresa atualizada com sucesso');

        // Não redireciona imediatamente - fica na página com mensagem de sucesso
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('❌ [EmpresaConfig] Erro ao salvar empresa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isCreatingNew) {
      setFormData({
        nome: '',
        valorPF: '',
        hcpp: '',
        tecnologias: [],
        experienciaTime: [],
        faseCiclo: 'codificacao'
      });
    } else if (empresaAtualObj) {
      setFormData({
        nome: empresaAtualObj.nome || '',
        valorPF: empresaAtualObj.valorPF || 850.00,
        hcpp: empresaAtualObj.hcpp || 20,
        tecnologias: empresaAtualObj.tecnologias || [],
        experienciaTime: empresaAtualObj.experienciaTime || [],
        faseCiclo: empresaAtualObj.faseCiclo || 'codificacao'
      });
    }
    setErrors({});
  };

  // Cálculos de impacto
  const impactoCalculos = {
    para100PF: {
      valor: 100 * formData.valorPF,
      horas: 100 * formData.hcpp,
      dias: (100 * formData.hcpp / 8).toFixed(1)
    },
    para500PF: {
      valor: 500 * formData.valorPF,
      horas: 500 * formData.hcpp,
      dias: (500 * formData.hcpp / 8).toFixed(1)
    }
  };

  // Estilos CSS inline
  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerContent: {
      flex: 1,
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#0f172a',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0,
      marginBottom: '0.5rem',
    },
    icon: {
      color: '#1246e2',
      fontSize: '28px',
    },
    subtitle: {
      color: '#64748b',
      fontSize: '0.875rem',
      margin: 0,
    },
    deleteSection: {
      marginLeft: '1rem',
    },
    deleteButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '0.5rem 1rem',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
    },
    deleteButtonHover: {
      backgroundColor: '#fee2e2',
      borderColor: '#fca5a5',
    },
    deleteButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    deleteIcon: {
      fontSize: '18px',
    },
    confirmDelete: {
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
    },
    confirmDeleteContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
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
    confirmActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    cancelButton: {
      padding: '0.625rem 1.25rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    confirmDeleteButton: {
      padding: '0.625rem 1.25rem',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      position: 'relative',
    },
    confirmDeleteButtonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    section: {
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #f1f5f9',
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 1rem 0',
    },
    sectionIcon: {
      color: '#1246e2',
      fontSize: '20px',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr', // 3 colunas na mesma linha
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    optional: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      fontWeight: 'normal',
      marginLeft: '4px',
    },
    errorText: {
      color: '#dc2626',
      fontSize: '0.75rem',
      fontWeight: 'normal',
    },
    input: {
      padding: '0.875rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#374151',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    inputError: {
      borderColor: '#dc2626',
      backgroundColor: '#fef2f2',
    },
    tooltipIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      cursor: 'help',
    },
    tooltipIconInner: {
      fontSize: '16px',
      color: '#9ca3af',
    },
    helpText: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.375rem',
      fontStyle: 'italic',
    },
    presetsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    presetItem: {
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderLeftWidth: '4px',
    },
    presetItemSelected: {
      borderColor: '#1246e2',
      backgroundColor: '#eff6ff',
      boxShadow: '0 0 0 3px rgba(18, 70, 226, 0.1)',
    },
    presetHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.5rem',
    },
    presetLabelContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    presetLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
    },
    presetRange: {
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    presetValue: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#1246e2',
    },
    presetDesc: {
      fontSize: '0.75rem',
      color: '#6b7280',
      margin: 0,
      lineHeight: 1.4,
    },
    checkboxGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      maxHeight: '150px',
      overflowY: 'auto',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
    },
    checkboxText: {
      fontSize: '0.875rem',
      color: '#374151',
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      backgroundColor: '#f8fafc',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      cursor: 'pointer',
    },
    radio: {
      marginTop: '2px',
      cursor: 'pointer',
    },
    radioContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    radioText: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
    },
    radioDesc: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
    // Estilos para sistema de tecnologias (tags)
    tagsInputContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    tagsInput: {
      flex: 1,
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
    },
    addTagButton: {
      padding: '0.75rem 1rem',
      backgroundColor: '#1246e2',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '60px',
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      minHeight: '60px',
      maxHeight: '150px',
      overflowY: 'auto',
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '0.5rem',
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0.375rem 0.75rem',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid #93c5fd',
    },
    tagText: {
      marginRight: '2px',
    },
    removeTagButton: {
      background: 'none',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeTagIcon: {
      fontSize: '14px',
      color: '#1e40af',
    },
    // Estilos para sistema de membros
    membrosInputContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr auto',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    membroInput: {
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
    },
    addMembroButton: {
      padding: '0.75rem 1rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '60px',
    },
    membrosTable: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '0.5rem',
    },
    membrosHeader: {
      backgroundColor: '#f1f5f9',
    },
    membrosHeaderCell: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#4b5563',
      borderBottom: '1px solid #e2e8f0',
    },
    membrosRow: {
      borderBottom: '1px solid #e2e8f0',
    },
    membrosRowLast: {
      borderBottom: 'none',
    },
    membrosCell: {
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      color: '#374151',
    },
    removeMembroButton: {
      background: 'none',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ef4444',
    },
    removeMembroIcon: {
      fontSize: '16px',
    },
    impactSection: {
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '1px solid #bae6fd',
    },
    impactTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#0369a1',
      margin: '0 0 1rem 0',
    },
    impactIcon: {
      color: '#0369a1',
      fontSize: '20px',
    },
    impactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
    },
    impactCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e2e8f0',
    },
    impactCardTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 0.75rem 0',
    },
    impactCardContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    impactItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    impactLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    impactValue: {
      fontSize: '0.875rem',
      color: '#0c4a6e',
      fontWeight: '500',
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e2e8f0',
    },
    resetButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    resetButtonHover: {
      backgroundColor: '#e5e7eb',
      borderColor: '#9ca3af',
    },
    resetIcon: {
      fontSize: '18px',
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
      transition: 'all 0.2s',
      minWidth: '180px',
      justifyContent: 'center',
      position: 'relative',
    },
    submitButtonHover: {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    },
    submitButtonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
    submitIcon: {
      fontSize: '18px',
    },
    successMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#d1fae5',
      border: '1px solid #a7f3d0',  // ✅ CORRIGIDO: aspas simples dentro de aspas duplas
      color: '#065f46',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginTop: '1.5rem',
      animation: 'fadeIn 0.3s ease-in',
    },
    successIcon: {
      fontSize: '24px',
      color: '#10b981',
    },
    redirectMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#dbeafe',
      border: '1px solid #93c5fd',  // ✅ CORRIGIDO: aspas simples dentro de aspas duplas
      color: '#1e40af',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginTop: '1.5rem',
      animation: 'fadeIn 0.3s ease-in',
    },
    redirectIcon: {
      fontSize: '24px',
      color: '#3b82f6',
      animation: 'spin 1s linear infinite',
    },
    loadingSpinner: {
      position: 'absolute',
      right: '12px',
      display: 'flex',
      alignItems: 'center',
    },
  };

  return (
    <div style={styles.container}>
      {/* Modal de confirmação para exclusão */}
      {!isCreatingNew && showDeleteConfirm && (
        <div style={styles.confirmDelete}>
          <div style={styles.confirmDeleteContent}>
            <h3 style={styles.confirmTitle}>
              <span className="material-symbols-outlined">
                warning
              </span>
              Excluir Empresa
            </h3>
            <p style={styles.confirmMessage}>
              Tem certeza que deseja excluir a empresa "{empresaAtualObj?.nome}"?
              Esta ação não pode ser desfeita. Todos os dados relacionados (projetos, CRs e funções) serão permanentemente removidos.
            </p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.cancelButton}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteEmpresa}
                style={{
                  ...styles.confirmDeleteButton,
                  ...(isDeleting && styles.confirmDeleteButtonDisabled)
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Permanentemente'}
                {isDeleting && (
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: '16px',
                      animation: 'spin 1s linear infinite'
                    }}>
                      sync
                    </span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h3 style={styles.title}>
            <span className="material-symbols-outlined" style={styles.icon}>
              {isCreatingNew ? 'add_business' : 'business'}
            </span>
            {isCreatingNew ? 'Criar Nova Empresa' : 'Configurações da Empresa'}
          </h3>
          <p style={styles.subtitle}>
            {isCreatingNew
              ? 'Preencha os dados para criar uma nova empresa'
              : `Configurando: ${empresaAtualObj?.nome || 'Empresa'}`}
          </p>
        </div>

        {/* Botão para excluir empresa (apenas se não estiver criando nova) */}
        {!isCreatingNew && empresaAtualObj && (
          <div style={styles.deleteSection}>
            <button
              type="button"
              style={{
                ...styles.deleteButton,
                ...(deleteHover && styles.deleteButtonHover),
                ...(isDeleting && styles.deleteButtonDisabled)
              }}
              onMouseEnter={() => !isDeleting && setDeleteHover(true)}
              onMouseLeave={() => !isDeleting && setDeleteHover(false)}
              onClick={() => !isDeleting && setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              <span className="material-symbols-outlined" style={styles.deleteIcon}>
                delete
              </span>
              {isDeleting ? 'Excluindo...' : 'Excluir Empresa'}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* SEÇÃO 1: DADOS BÁSICOS */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <span className="material-symbols-outlined" style={styles.sectionIcon}>
              info
            </span>
            Dados Básicos
          </h4>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Nome da Empresa *
                {errors.nome && <span style={styles.errorText}> - {errors.nome}</span>}
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.nome && styles.inputError)
                }}
                placeholder="Ex: Construtora ABC Ltda"
                autoFocus={isCreatingNew}
                disabled={isSubmitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Valor do PF (R$) *
                {errors.valorPF && <span style={styles.errorText}> - {errors.valorPF}</span>}
                <span style={styles.tooltipIcon} title="Valor monetário de cada Ponto de Função">
                  <span className="material-symbols-outlined" style={styles.tooltipIconInner}>
                    help
                  </span>
                </span>
              </label>
              <input
                type="number"
                name="valorPF"
                min="0.01"
                max="10000"
                step="0.01"
                value={formData.valorPF}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.valorPF && styles.inputError)
                }}
                disabled={isSubmitting}
              />
              <div style={styles.helpText}>
                Valor médio cobrado por ponto de função
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                HCPP (horas/PF) *
                {errors.hcpp && <span style={styles.errorText}> - {errors.hcpp}</span>}
                <span style={styles.tooltipIcon} title="Horas necessárias para desenvolver 1 Ponto de Função">
                  <span className="material-symbols-outlined" style={styles.tooltipIconInner}>
                    help
                  </span>
                </span>
              </label>
              <input
                type="number"
                name="hcpp"
                min="4"
                max="25"
                step="0.5"
                value={formData.hcpp}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.hcpp && styles.inputError)
                }}
                disabled={isSubmitting}
              />
              <div style={styles.helpText}>
                Horas de esforço por ponto de função (4-25h)
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: PRESETS DE PRODUTIVIDADE */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <span className="material-symbols-outlined" style={styles.sectionIcon}>
              speed
            </span>
            Níveis de Produtividade (HCPP)
          </h4>

          <div style={styles.presetsGrid}>
            {hcppPresets.map(preset => (
              <div
                key={preset.label}
                style={{
                  ...styles.presetItem,
                  borderLeftColor: preset.color,
                  ...(Math.abs(formData.hcpp - preset.value) <= 1 && styles.presetItemSelected),
                  cursor: isSubmitting ? 'default' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, hcpp: preset.value }))}
                className={!isSubmitting ? "preset-item-hover" : ""}
              >
                <div style={styles.presetHeader}>
                  <div style={styles.presetLabelContainer}>
                    <span style={styles.presetLabel}>{preset.label}</span>
                    <span style={{ ...styles.presetRange, color: preset.color }}>
                      {preset.range}
                    </span>
                  </div>
                  <span style={styles.presetValue}>{preset.value}h/PF</span>
                </div>
                <p style={styles.presetDesc}>{preset.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEÇÃO 3: TECNOLOGIA E EXPERIÊNCIA */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <span className="material-symbols-outlined" style={styles.sectionIcon}>
              terminal
            </span>
            Tecnologia e Experiência
          </h4>

          <div style={styles.formGrid}>
            {/* Tecnologias - SISTEMA DE TAGS */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Tecnologias Utilizadas
                <span style={styles.optional}>(opcional)</span>
              </label>

              {/* Input para adicionar nova tecnologia */}
              <div style={styles.tagsInputContainer}>
                <input
                  type="text"
                  value={novaTecnologia}
                  onChange={(e) => setNovaTecnologia(e.target.value)}
                  placeholder="Ex: React, Node.js, PostgreSQL..."
                  style={styles.tagsInput}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTecnologia())}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleAddTecnologia}
                  style={styles.addTagButton}
                  disabled={!novaTecnologia.trim() || isSubmitting}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              {/* Container das tags */}
              <div style={styles.tagsContainer}>
                {formData.tecnologias.map((tech, index) => (
                  <div key={index} style={styles.tag} className={!isSubmitting ? "tag-hover" : ""}>
                    <span style={styles.tagText}>{tech}</span>
                    <button
                      type="button"
                      onClick={() => !isSubmitting && handleRemoveTecnologia(tech)}
                      style={styles.removeTagButton}
                      disabled={isSubmitting}
                    >
                      <span className="material-symbols-outlined" style={styles.removeTagIcon}>
                        close
                      </span>
                    </button>
                  </div>
                ))}

                {formData.tecnologias.length === 0 && (
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    Nenhuma tecnologia adicionada. Digite acima e clique em "+" para adicionar.
                  </div>
                )}
              </div>

              <div style={styles.helpText}>
                {formData.tecnologias.length} tecnologia(s) adicionada(s)
              </div>
            </div>

            {/* Experiência do Time */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Experiência do Time
                <span style={styles.optional}>(opcional)</span>
              </label>
              <div style={styles.checkboxGrid}>
                {experienciaOptions.map(exp => (
                  <label key={exp.value} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="experienciaTime"
                      value={exp.value}
                      checked={formData.experienciaTime.includes(exp.value)}
                      onChange={handleChange}
                      style={styles.checkbox}
                      disabled={isSubmitting}
                    />
                    <span style={styles.checkboxText}>{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fase do Ciclo */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Fase do Ciclo de Desenvolvimento
              </label>
              <div style={styles.radioGroup}>
                {faseCicloOptions.map(option => (
                  <label key={option.value} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="faseCiclo"
                      value={option.value}
                      checked={formData.faseCiclo === option.value}
                      onChange={handleChange}
                      style={styles.radio}
                      disabled={isSubmitting}
                    />
                    <div style={styles.radioContent}>
                      <span style={styles.radioText}>{option.label}</span>
                      <span style={styles.radioDesc}>{option.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: IMPACTO DOS CÁLCULOS */}
        <div style={styles.impactSection}>
          <h4 style={styles.impactTitle}>
            <span className="material-symbols-outlined" style={styles.impactIcon}>
              insights
            </span>
            Impacto nos Cálculos
          </h4>

          <div style={styles.impactGrid}>
            <div style={styles.impactCard}>
              <h5 style={styles.impactCardTitle}>Para 100 PF</h5>
              <div style={styles.impactCardContent}>
                <div style={styles.impactItem}>
                  <span style={styles.impactLabel}>Valor:</span>
                  <span style={styles.impactValue}>
                    R$ {impactoCalculos.para100PF.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={styles.impactItem}>
                  <span style={styles.impactLabel}>Esforço:</span>
                  <span style={styles.impactValue}>
                    {impactoCalculos.para100PF.horas}h ({impactoCalculos.para100PF.dias} dias)
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.impactCard}>
              <h5 style={styles.impactCardTitle}>Para 500 PF</h5>
              <div style={styles.impactCardContent}>
                <div style={styles.impactItem}>
                  <span style={styles.impactLabel}>Valor:</span>
                  <span style={styles.impactValue}>
                    R$ {impactoCalculos.para500PF.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={styles.impactItem}>
                  <span style={styles.impactLabel}>Esforço:</span>
                  <span style={styles.impactValue}>
                    {impactoCalculos.para500PF.horas}h ({impactoCalculos.para500PF.dias} dias)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              ...styles.resetButton,
              ...(resetHover && styles.resetButtonHover)
            }}
            onMouseEnter={() => !isSubmitting && setResetHover(true)}
            onMouseLeave={() => !isSubmitting && setResetHover(false)}
            disabled={isSubmitting}
          >
            <span className="material-symbols-outlined" style={styles.resetIcon}>
              restart_alt
            </span>
            {isCreatingNew ? 'Limpar' : 'Restaurar'}
          </button>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(submitHover && styles.submitButtonHover),
              ...(isSubmitting && styles.submitButtonDisabled)
            }}
            onMouseEnter={() => !isSubmitting && setSubmitHover(true)}
            onMouseLeave={() => !isSubmitting && setSubmitHover(false)}
            disabled={isSubmitting}
          >
            <span className="material-symbols-outlined" style={styles.submitIcon}>
              {isCreatingNew ? 'add' : 'save'}
            </span>
            {isSubmitting ? 'Salvando...' : (isCreatingNew ? 'Criar Empresa' : 'Salvar Configurações')}
            {isSubmitting && (
              <span style={styles.loadingSpinner}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '16px',
                  animation: 'spin 1s linear infinite'
                }}>
                  sync
                </span>
              </span>
            )}
          </button>
        </div>

        {/* MENSAGEM DE SUCESSO */}
        {success && (
          <div style={styles.successMessage}>
            <span className="material-symbols-outlined" style={styles.successIcon}>
              check_circle
            </span>
            {isCreatingNew ? 'Empresa criada com sucesso!' : 'Configurações salvas com sucesso!'}
          </div>
        )}

        {/* MENSAGEM DE REDIRECIONAMENTO */}
        {shouldRedirect && (
          <div style={styles.redirectMessage}>
            <span className="material-symbols-outlined" style={styles.redirectIcon}>
              autorenew
            </span>
            Redirecionando para lista de empresas...
          </div>
        )}
      </form>
    </div>
  );
};

// ✅ CORRIGIDO: Definir arrays estáticos fora do componente
const hcppPresets = [
  {
    label: 'Elite',
    value: 6,
    range: '4-8h/PF',
    desc: 'Stacks modernos, alta automação, baixa dívida técnica',
    color: '#10b981'
  },
  {
    label: 'Alta Produtividade',
    value: 9.5,
    range: '9-10h/PF',
    desc: 'Equipe experiente, tecnologia madura',
    color: '#0ea5e9'
  },
  {
    label: 'Média',
    value: 15,
    range: '11-19h/PF',
    desc: 'Equipe padrão, tecnologia conhecida',
    color: '#f59e0b'
  },
  {
    label: 'Baixa Produtividade',
    value: 22.5,
    range: '20-25h/PF',
    desc: 'Equipe nova, tecnologia complexa',
    color: '#ef4444'
  },
];

const experienciaOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' }
];

const faseCicloOptions = [
  { value: 'codificacao', label: 'Só Codificação', desc: 'Apenas desenvolvimento (coding)' },
  { value: 'ciclo_completo', label: 'Ciclo Completo', desc: 'Análise, design, testes, deploy' }
];

export default EmpresaConfig;