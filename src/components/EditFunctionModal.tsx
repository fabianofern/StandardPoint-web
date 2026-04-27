import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';
import { calcularPF, getCampoReferenciaLabel } from '../utils/ifpugCalculator';

// COMPONENTE AUXILIAR: Tooltip informativo
const InfoTooltip = ({ title, content, link, linkText }) => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }}>
      <span
        style={styles.infoIcon}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        ℹ️
      </span>
      {show && (
        <div style={styles.tooltip}>
          <strong>{title}</strong>
          <div style={{ marginTop: '4px', fontSize: '12px', lineHeight: '1.4' }}>
            {content}
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.tooltipLink}
              onClick={(e) => e.stopPropagation()}
            >
              {linkText || 'Saiba mais →'}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// COMPONENTE AUXILIAR: Alerta de valor atípico
const ValorAtipicoAlert = ({ valor, tipo, limite }) => {
  if (valor <= limite) return null;

  return (
    <div style={styles.alertaAtipico}>
      <span style={styles.alertaIcon}>⚠️</span>
      <span>
        Valor alto detectado ({valor}).
        {tipo === 'TD'
          ? ' TDs > 50 são incomuns. Verifique se não há contagem duplicada de campos.'
          : ' Valores > 20 são raros. Confira se não há subgrupos sendo contados como únicos.'}
      </span>
    </div>
  );
};

const EditFunctionModal = ({ function: func, onClose }) => {
  const {
    addFunction,
    removeFunction,
    empresaAtualObj,
    projetoAtualObj,
    crAtualObj,
    getRequisitosFuncionais,
    getRequisitosProjeto
  } = useFunctionContext();

  // Estado do formulário
  const [formData, setFormData] = useState({
    numeroFuncao: func.numeroFuncao || '', // 🆕 NOVO
    nome: func.nome || func.name || '',
    tipo: func.tipo || func.type || 'EE',
    td: func.det || func.td || 1,
    arTr: func.ret || func.arTr || 1,
    requisitoId: func.requisitoId || '',
    dataCadastro: func.dataCriacao || new Date().toISOString(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OBTER REQUISITOS
  const requisitosFuncionais = getRequisitosFuncionais();
  const todosRequisitos = getRequisitosProjeto();
  const temRequisitos = todosRequisitos.length > 0;

  // 🆕 DEFINIÇÕES IFPUG PARA TOOLTIPS (ATUALIZADO - iguais ao NewEntryForm)
  const ifpugInfo = {
    TD: {
      title: 'Tipos de Dados (TD) / Data Element Types (DET)',
      content: 'Campo único e reconhecível pelo usuário. Conte: campos de entrada, saída, leitura/escrita em ALI/AIE, mensagens de erro, campos calculados, códigos de retorno. Ex: Nome do cliente, CPF, Data de nascimento.'
    },
    AR: {
      title: 'Arquivos Referenciados (AR) / File Types Referenced (FTR)',
      content: 'Conte: ALIs lidos, AIEs lidas, ALIs atualizadas. Não conte a mesma ALI/AIE duas vezes. Ex: Se uma consulta lê 2 tabelas = AR = 2'
    },
    TR: {
      title: 'Tipos de Registro (TR) / Record Element Types (RET)',
      content: 'Subgrupo de dados reconhecível pelo usuário dentro de um ALI/AIE. Conte: entidades relacionadas em 1:N. Ex: Cliente (dados principais) + Endereços (lista) = 2 RETs'
    }
  };

  // Tipos disponíveis em português
  const tipos = [
    { value: 'EE', label: 'EE - Entrada Externa' },
    { value: 'SE', label: 'SE - Saída Externa' },
    { value: 'CE', label: 'CE - Consulta Externa' },
    { value: 'ALI', label: 'ALI - Arquivo Lógico Interno' },
    { value: 'AIE', label: 'AIE - Arquivo de Interface Externa' },
  ];

  // Calcular PF em tempo real
  const { pf, complexidade } = calcularPF(formData.tipo, formData.td, formData.arTr);
  const referenciaInfo = getCampoReferenciaLabel(formData.tipo);

  // 🆕 DETERMINAR QUAL INFO MOSTRAR (AR ou TR) - igual ao NewEntryForm
  const isDados = formData.tipo === 'ALI' || formData.tipo === 'AIE';
  const infoReferencia = isDados ? ifpugInfo.TR : ifpugInfo.AR;

  // Atualizar cálculos quando formData mudar
  useEffect(() => {
    const { pf: novoPf, complexidade: novaComplexidade } = calcularPF(formData.tipo, formData.td, formData.arTr);
  }, [formData.tipo, formData.td, formData.arTr]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === 'td' || name === 'arTr') {
      const numValue = parseInt(value) || 1;

      if (name === 'td' && numValue < 1) processedValue = 1;
      else if (name === 'arTr') {
        if (formData.tipo === 'ALI' || formData.tipo === 'AIE') {
          processedValue = numValue < 1 ? 1 : numValue;
        } else {
          processedValue = numValue < 0 ? 0 : numValue;
        }
      } else {
        processedValue = numValue;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // VALIDAÇÕES MAIS RIGOROSAS (iguais ao NewEntryForm)
    if (formData.td < 1) {
      newErrors.td = 'TD deve ser no mínimo 1';
    } else if (formData.td > 999) {
      newErrors.td = 'TD máximo é 999';
    }

    // Validações específicas por tipo
    if (formData.tipo === 'ALI' || formData.tipo === 'AIE') {
      if (formData.arTr < 1) {
        newErrors.arTr = 'TR deve ser no mínimo 1';
      } else if (formData.arTr > 999) {
        newErrors.arTr = 'TR máximo é 999';
      }
    } else {
      if (formData.arTr < 0) {
        newErrors.arTr = 'Valor não pode ser negativo';
      } else if (formData.arTr > 999) {
        newErrors.arTr = 'AR máximo é 999';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      removeFunction(func.id);

      const destino = crAtualObj ? 'cr' : 'projeto';

      addFunction({
        numeroFuncao: formData.numeroFuncao, // 🆕 PRESERVAR/EDITAR NÚMERO
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        td: formData.td,
        arTr: formData.arTr,
        det: formData.td,
        ret: formData.arTr,
        tipoMelhoria: func.tipoMelhoria || null,
        requisitoId: formData.requisitoId || null,
        dataCriacao: formData.dataCadastro,
      }, destino);

      console.log('✅ [EditFunctionModal] Função editada com sucesso');
      onClose();

    } catch (error) {
      console.error('❌ [EditFunctionModal] Erro ao editar função:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obter informações do destino atual
  const getDestinoInfo = () => {
    if (crAtualObj) {
      return {
        tipo: 'cr',
        nome: crAtualObj.titulo,
        icone: 'description',
        cor: '#8b5cf6',
        descricao: 'Esta função será movida para o CR atual'
      };
    } else {
      return {
        tipo: 'projeto',
        nome: projetoAtualObj?.nome || 'Projeto',
        icone: 'folder',
        cor: '#3b82f6',
        descricao: 'Esta função será movida para o projeto atual'
      };
    }
  };

  const destinoInfo = getDestinoInfo();

  // OBTER REQUISITO ATUAL
  const getRequisitoAtual = () => {
    if (!formData.requisitoId) return null;
    return requisitosFuncionais.find(r => r.id === formData.requisitoId);
  };

  const requisitoAtual = getRequisitoAtual();

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.headerContent}>
            <h3 style={styles.modalTitle}>
              <span className="material-symbols-outlined" style={styles.editIcon}>
                edit
              </span>
              Editar Função
            </h3>
            <div style={styles.destinoInfo}>
              <span style={{
                ...styles.destinoBadge,
                backgroundColor: `${destinoInfo.cor}20`,
                color: destinoInfo.cor,
                border: `1px solid ${destinoInfo.cor}40`,
              }}>
                <span className="material-symbols-outlined" style={styles.destinoIcon}>
                  {destinoInfo.icone}
                </span>
                {destinoInfo.tipo === 'projeto' ? 'Projeto' : 'CR'}: {destinoInfo.nome}
              </span>
              <p style={styles.destinoDescricao}>{destinoInfo.descricao}</p>
            </div>
          </div>
          <button
            style={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            title="Fechar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            {/* Informações da função */}
            <div style={styles.functionInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>ID:</span>
                <span style={styles.infoValue}>{func.id}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Data de Cadastro:</span>
                <input
                  type="datetime-local"
                  value={formData.dataCadastro ? new Date(new Date(formData.dataCadastro).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, dataCadastro: new Date(e.target.value).toISOString() })}
                  style={{
                    ...styles.infoValue,
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {func.tipoMelhoria && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Classificação Melhoria:</span>
                  <span style={{
                    ...styles.infoValue,
                    color: func.tipoMelhoria === 'ADD' ? '#059669' :
                      func.tipoMelhoria === 'CHG' ? '#d97706' :
                        func.tipoMelhoria === 'DEL' ? '#dc2626' :
                          func.tipoMelhoria === 'CF' ? '#6366f1' : '#6b7280',
                    fontWeight: '600'
                  }}>
                    {func.tipoMelhoria} ({func.tipoMelhoria === 'ADD' ? 'Adicionada' :
                      func.tipoMelhoria === 'CHG' ? 'Alterada' :
                        func.tipoMelhoria === 'DEL' ? 'Excluída' :
                          func.tipoMelhoria === 'CF' ? 'Convertida' : 'N/A'})
                  </span>
                </div>
              )}
              {func.requisitoId && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Requisito Vinculado:</span>
                  <span style={{ ...styles.infoValue, color: '#10b981', fontWeight: '600' }}>
                    {func.requisitoId}
                  </span>
                </div>
              )}
            </div>

            {/* 🆕 NÚMERO DA FUNÇÃO */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número da Função *
                {errors.numeroFuncao && <span style={styles.errorText}> - {errors.numeroFuncao}</span>}
                <InfoTooltip
                  title="Número da Função"
                  content="Identificador sequencial da função no projeto (ex: 001, 002). Pode ser alterado conforme necessário."
                />
              </label>
              <input
                type="text"
                name="numeroFuncao"
                value={formData.numeroFuncao}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.numeroFuncao && styles.inputError),
                  width: '120px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
                placeholder="Ex: 001"
                disabled={isSubmitting}
              />
            </div>

            {/* Nome da Função */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Nome da Função *
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
                placeholder="Ex: Cadastro de Cliente"
                autoFocus
                disabled={isSubmitting}
              />
              <div style={styles.helpText}>
                Nome descritivo da função (mínimo 2 caracteres)
              </div>
            </div>

            {/* Tipo da Função */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo da Função *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                style={styles.select}
                disabled={isSubmitting}
              >
                {tipos.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <div style={styles.tipoInfo}>
                <span style={styles.tipoInfoLabel}>
                  {tipos.find(t => t.value === formData.tipo)?.label.split(' - ')[0]}:
                </span>
                <span style={styles.tipoInfoDesc}>
                  {tipos.find(t => t.value === formData.tipo)?.label.split(' - ')[1]}
                </span>
              </div>
            </div>

            {/* VÍNCULO COM REQUISITO */}
            {temRequisitos && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Vincular a Requisito (opcional)
                </label>
                <select
                  name="requisitoId"
                  value={formData.requisitoId}
                  onChange={handleChange}
                  style={{
                    ...styles.select,
                    ...(formData.requisitoId ? styles.selectComRequisito : {})
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">
                    {func.requisitoId ? 'Remover vínculo' : 'Selecione um requisito funcional...'}
                  </option>
                  {requisitosFuncionais.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.id} - {req.nome || req.descricao.substring(0, 40) + '...'}
                    </option>
                  ))}
                </select>

                {requisitoAtual && (
                  <div style={styles.requisitoInfoCard}>
                    <div style={styles.requisitoInfoHeader}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981' }}>
                        check_circle
                      </span>
                      <span style={styles.requisitoInfoTitle}>Requisito vinculado:</span>
                    </div>
                    <div style={styles.requisitoInfoId}>{requisitoAtual.id}</div>
                    <div style={styles.requisitoInfoDesc}>{requisitoAtual.descricao}</div>
                  </div>
                )}

                {func.requisitoId && !formData.requisitoId && (
                  <div style={styles.alertaRemocao}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      warning
                    </span>
                    <span>O vínculo com o requisito <strong>{func.requisitoId}</strong> será removido ao salvar.</span>
                  </div>
                )}
              </div>
            )}

            {!temRequisitos && (
              <div style={styles.semRequisitosBox}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f59e0b' }}>
                  info
                </span>
                <div>
                  <strong>Projeto sem requisitos cadastrados</strong>
                  <p style={styles.semRequisitosText}>
                    Cadastre requisitos na tela de projetos para habilitar a rastreabilidade.
                  </p>
                </div>
              </div>
            )}

            {/* 🆕 TD E AR/TR COM TOOLTIPS E ALERTAS ATUALIZADOS */}
            <div style={styles.row}>
              <div style={styles.column}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    TD (Tipos de Dado) *
                    <InfoTooltip {...ifpugInfo.TD} />
                    {errors.td && <span style={styles.errorText}> - {errors.td}</span>}
                  </label>
                  <input
                    type="number"
                    name="td"
                    min="1"
                    max="999"
                    value={formData.td}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.td && styles.inputError),
                      // 🆕 BORDA AMARELA PARA VALOR ATÍPICO
                      ...(formData.td > 50 && styles.inputWarning)
                    }}
                    disabled={isSubmitting}
                  />
                  <div style={styles.helpText}>
                    Campos únicos reconhecidos pelo usuário
                  </div>
                  {/* 🆕 ALERTA DE VALOR ATÍPICO - IGUAL AO NEWENTRYFORM */}
                  <ValorAtipicoAlert
                    valor={formData.td}
                    tipo="TD"
                    limite={50}
                  />
                </div>
              </div>

              <div style={styles.column}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    {referenciaInfo.label} *
                    <InfoTooltip {...infoReferencia} />
                    {errors.arTr && <span style={styles.errorText}> - {errors.arTr}</span>}
                  </label>
                  <input
                    type="number"
                    name="arTr"
                    min={formData.tipo === 'ALI' || formData.tipo === 'AIE' ? '1' : '0'}
                    max="999"
                    value={formData.arTr}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.arTr && styles.inputError),
                      // 🆕 BORDA AMARELA PARA VALOR ATÍPICO
                      ...(formData.arTr > 20 && styles.inputWarning)
                    }}
                    disabled={isSubmitting}
                  />
                  <div style={styles.helpText}>
                    {referenciaInfo.descricao}
                  </div>
                  {/* 🆕 ALERTA DE VALOR ATÍPICO - IGUAL AO NEWENTRYFORM */}
                  <ValorAtipicoAlert
                    valor={formData.arTr}
                    tipo={isDados ? 'TR' : 'AR'}
                    limite={20}
                  />
                </div>
              </div>
            </div>

            {/* Preview do cálculo */}
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <span className="material-symbols-outlined" style={styles.previewIcon}>
                  visibility
                </span>
                <span style={styles.previewTitle}>Pré-visualização</span>
              </div>
              <div style={styles.previewContent}>
                <div style={styles.previewGrid}>
                  <div style={styles.previewItem}>
                    <span style={styles.previewLabel}>Complexidade:</span>
                    <span style={{
                      ...styles.previewValue,
                      color: complexidade === 'Alta' ? '#dc2626' :
                        complexidade === 'Média' ? '#d97706' : '#059669'
                    }}>
                      {complexidade}
                    </span>
                  </div>
                  <div style={styles.previewItem}>
                    <span style={styles.previewLabel}>Pontos de Função:</span>
                    <span style={styles.previewValue}>
                      <strong>{pf} PF</strong>
                    </span>
                  </div>
                </div>
                {empresaAtualObj && (
                  <div style={styles.previewNote}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>
                      info
                    </span>
                    Valor estimado: R$ {(pf * empresaAtualObj.valorPF).toFixed(2)}
                  </div>
                )}
                {formData.requisitoId && requisitoAtual && (
                  <div style={styles.previewRequisito}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>
                      link
                    </span>
                    Vinculado a: <strong>{requisitoAtual.id}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* 🆕 LINKS PARA DOCUMENTAÇÃO - IGUAL AO NEWENTRYFORM */}
            <div style={styles.documentacaoBox}>
              <span className="material-symbols-outlined" style={styles.docIcon}>
                menu_book
              </span>
              <div>
                <strong>Dúvidas sobre contagem?</strong>
                <div style={styles.docLinks}>
                  <a
                    href="https://www.ifpug.org/ifpug-standards/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.docLink}
                  >
                    IFPUG CPM 4.3
                  </a>
                  <span style={styles.docSeparator}>•</span>
                  <a
                    href="https://www.bfpug.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.docLink}
                  >
                    BFPUG Brasil
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              style={{
                ...styles.cancelButton,
                ...(isSubmitting && styles.buttonDisabled)
              }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                ...styles.saveButton,
                ...(isSubmitting && styles.buttonDisabled)
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined" style={styles.loadingIcon}>
                    sync
                  </span>
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={styles.saveIcon}>
                    save
                  </span>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
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
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '95vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem 1.5rem 1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    gap: '1rem',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
    color: '#0f172a',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  editIcon: {
    color: '#3b82f6',
    fontSize: '24px',
  },
  destinoInfo: {
    marginTop: '0.5rem',
  },
  destinoBadge: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '0.25rem',
  },
  destinoIcon: {
    fontSize: '16px',
  },
  destinoDescricao: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0,
    fontStyle: 'italic',
  },
  closeButton: {
    padding: '6px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalBody: {
    padding: '1.5rem',
  },
  functionInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    border: '1px solid #e5e7eb',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '0.75rem',
    color: '#374151',
    fontFamily: 'monospace',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: 'normal',
    marginLeft: '4px',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  // 🆕 ESTILO PARA VALORES ATÍPICOS (IGUAL AO NEWENTRYFORM)
  inputWarning: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  selectComRequisito: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4'
  },
  requisitoInfoCard: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px'
  },
  requisitoInfoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  requisitoInfoTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#15803d'
  },
  requisitoInfoId: {
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#166534',
    fontFamily: 'monospace',
    marginBottom: '4px'
  },
  requisitoInfoDesc: {
    fontSize: '0.8rem',
    color: '#166534',
    lineHeight: 1.4
  },
  alertaRemocao: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#dc2626'
  },
  semRequisitosBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  semRequisitosText: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: '#92400e'
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    fontStyle: 'italic',
  },
  tipoInfo: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    borderLeft: '3px solid #3b82f6',
  },
  tipoInfoLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: '2px',
  },
  tipoInfoDesc: {
    fontSize: '0.75rem',
    color: '#475569',
    lineHeight: 1.3,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoIcon: {
    cursor: 'help',
    fontSize: '14px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  tooltip: {
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
    width: '280px',
    maxWidth: '90vw',
    zIndex: 1001,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    lineHeight: '1.4',
  },
  tooltipLink: {
    display: 'inline-block',
    marginTop: '8px',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '500',
  },
  // 🆕 ESTILOS DO ALERTA ATÍPICO (IGUAL AO NEWENTRYFORM)
  alertaAtipico: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#9a3412',
    lineHeight: '1.4',
  },
  alertaIcon: {
    fontSize: '14px',
    flexShrink: 0,
    marginTop: '1px',
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    marginTop: '1rem',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '0.75rem',
  },
  previewIcon: {
    color: '#64748b',
    fontSize: '20px',
  },
  previewTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  previewContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  previewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  previewValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  previewNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#475569',
    backgroundColor: '#e2e8f0',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    borderLeft: '3px solid #3b82f6',
  },
  previewRequisito: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    color: '#059669'
  },
  // 🆕 ESTILOS DA DOCUMENTAÇÃO (IGUAL AO NEWENTRYFORM)
  documentacaoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
  },
  docIcon: {
    fontSize: '24px',
    color: '#3b82f6',
  },
  docLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  docLink: {
    color: '#2563eb',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  docSeparator: {
    color: '#93c5fd',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f9fafb',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveIcon: {
    fontSize: '18px',
  },
  loadingIcon: {
    fontSize: '18px',
    animation: 'spin 1s linear infinite',
  },
};

// Adicionar animação de spin
const spinAnimation = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Injetar animação
if (!document.getElementById('edit-modal-spin-animation')) {
  const style = document.createElement('style');
  style.id = 'edit-modal-spin-animation';
  style.textContent = spinAnimation;
  document.head.appendChild(style);
}

export default EditFunctionModal;