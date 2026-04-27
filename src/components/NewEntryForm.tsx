import React, { useState, useEffect } from 'react';
import { useFunctionContext } from '../context/FunctionContext';
import { calcularPF, getCampoReferenciaLabel } from '../utils/ifpugCalculator';

// 🆕 COMPONENTE AUXILIAR: Tooltip informativo (copiado do EditFunctionModal)
const InfoTooltip = ({ title, content }) => {
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
        </div>
      )}
    </div>
  );
};

// 🆕 COMPONENTE AUXILIAR: Alerta de valor atípico (copiado do EditFunctionModal)
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

const NewEntryForm = () => {
  const {
    addFunction,
    empresaAtualObj,
    projetoAtualObj,
    crAtualObj,
    getRequisitosFuncionais,
    getRequisitosProjeto,
    getProximoNumeroFuncao
  } = useFunctionContext();

  // Estados
  const [formData, setFormData] = useState({
    numeroFuncao: '', // 🆕 NOVO
    nome: '',
    tipo: '',
    td: 1,
    arTr: 1,
    descricao: '',
    requisitoId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMelhoria = projetoAtualObj?.tipoContagem === 'melhoria';
  const requisitosFuncionais = getRequisitosFuncionais();
  const todosRequisitos = getRequisitosProjeto();
  const temRequisitos = todosRequisitos.length > 0;

  // 🆕 DEFINIÇÕES IFPUG PARA TOOLTIPS (NOVO)
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

  const tipos = [
    { value: 'EE', label: 'EE - Entrada Externa', descricao: 'Processo que adiciona ou modifica dados no sistema' },
    { value: 'SE', label: 'SE - Saída Externa', descricao: 'Processo que gera dados processados para o usuário' },
    { value: 'CE', label: 'CE - Consulta Externa', descricao: 'Processo que recupera dados sem modificação' },
    { value: 'ALI', label: 'ALI - Arquivo Lógico Interno', descricao: 'Grupo de dados mantidos dentro do sistema' },
    { value: 'AIE', label: 'AIE - Arquivo de Interface Externa', descricao: 'Grupo de dados referenciados externamente' },
  ];

  const { pf, complexidade } = calcularPF(formData.tipo, formData.td, formData.arTr);
  const referenciaInfo = getCampoReferenciaLabel(formData.tipo);

  // 🆕 DETERMINAR QUAL INFO MOSTRAR (AR ou TR)
  const isDados = formData.tipo === 'ALI' || formData.tipo === 'AIE';
  const infoReferencia = isDados ? ifpugInfo.TR : ifpugInfo.AR;

  useEffect(() => {
    if (formData.tipo === 'ALI' || formData.tipo === 'AIE') {
      setFormData(prev => ({ ...prev, arTr: Math.max(prev.arTr, 1) }));
    }
  }, [formData.tipo]);

  if (!empresaAtualObj) {
    return (
      <div style={styles.containerVazio}>
        <div style={styles.iconVazio}>🏢</div>
        <h3 style={styles.tituloVazio}>Nenhuma Empresa Selecionada</h3>
        <p style={styles.textoVazio}>Selecione uma empresa para adicionar funções.</p>
      </div>
    );
  }

  if (!projetoAtualObj) {
    return (
      <div style={styles.containerVazio}>
        <div style={styles.iconVazio}>📁</div>
        <h3 style={styles.tituloVazio}>Nenhum Projeto Selecionado</h3>
        <p style={styles.textoVazio}>Selecione um projeto para adicionar funções.</p>
      </div>
    );
  }

  // 🆕 AUTO-PREENCHER NÚMERO DA FUNÇÃO AO CARREGAR
  useEffect(() => {
    if (projetoAtualObj && !formData.numeroFuncao) {
      const proximo = getProximoNumeroFuncao(projetoAtualObj.id);
      setFormData(prev => ({ ...prev, numeroFuncao: proximo }));
    }
  }, [projetoAtualObj, getProximoNumeroFuncao, formData.numeroFuncao]);

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

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    else if (formData.nome.trim().length < 2) newErrors.nome = 'Mínimo 2 caracteres';

    if (!formData.numeroFuncao.trim()) {
      newErrors.numeroFuncao = 'Número é obrigatório';
    }

    if (!formData.tipo) newErrors.tipo = 'Selecione o tipo da função';

    if (formData.td < 1) newErrors.td = 'Mínimo 1';
    else if (formData.td > 999) newErrors.td = 'Máximo 999';

    if (formData.tipo === 'ALI' || formData.tipo === 'AIE') {
      if (formData.arTr < 1) newErrors.arTr = 'Mínimo 1';
    } else {
      if (formData.arTr < 0) newErrors.arTr = 'Não negativo';
    }
    if (formData.arTr > 999) newErrors.arTr = 'Máximo 999';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const destino = crAtualObj ? 'cr' : 'projeto';

      addFunction({
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        td: formData.td,
        arTr: formData.arTr,
        descricao: formData.descricao.trim(),
        tipoMelhoria: isMelhoria ? null : undefined,
        requisitoId: formData.requisitoId || null,
      }, destino);

      setFormData({
        nome: '',
        tipo: formData.tipo,
        td: 1,
        arTr: formData.tipo === 'ALI' || formData.tipo === 'AIE' ? 1 : 0,
        descricao: '',
        requisitoId: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Erro ao adicionar função:', error);
      alert('Erro ao adicionar função. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDestinoInfo = () => {
    if (crAtualObj) {
      return { label: 'CR', nome: crAtualObj.titulo, icone: '📄', cor: '#8b5cf6', descricao: 'Função será adicionada ao Change Request' };
    }
    return { label: 'Projeto', nome: projetoAtualObj.nome, icone: '📂', cor: '#3b82f6', descricao: 'Função será adicionada ao projeto' };
  };

  const destinoInfo = getDestinoInfo();

  const getRequisitoSelecionado = () => {
    if (!formData.requisitoId) return null;
    return requisitosFuncionais.find(r => r.id === formData.requisitoId);
  };

  const requisitoSelecionado = getRequisitoSelecionado();

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerPrincipal}>
          <span style={styles.iconePrincipal}>➕</span>
          <div>
            <h2 style={styles.tituloPrincipal}>Nova Função</h2>
            <p style={styles.subtitulo}>Adicione uma nova função ao projeto selecionado.</p>
          </div>
        </div>
        <div style={{
          ...styles.destinoBadge,
          borderColor: destinoInfo.cor,
          backgroundColor: `${destinoInfo.cor}20`,
          color: destinoInfo.cor
        }}>
          <span>{destinoInfo.icone}</span>
          <div>
            <strong>{destinoInfo.label}:</strong> {destinoInfo.nome}
          </div>
        </div>
      </div>

      {/* ALERTA PARA PROJETO DE MELHORIA */}
      {isMelhoria && (
        <div style={styles.melhoriaAlert}>
          <span style={styles.melhoriaAlertIcon}>⚠️</span>
          <div>
            <strong>Projeto de Melhoria (Enhancement)</strong>
            <p style={styles.melhoriaAlertText}>
              Após adicionar a função, classifique-a na tabela como ADD, CHG, DEL ou CF.
            </p>
          </div>
        </div>
      )}

      {/* ALERTA DE REQUISITOS NÃO VINCULADOS */}
      {temRequisitos && !formData.requisitoId && (
        <div style={styles.requisitoAlert}>
          <span style={styles.requisitoAlertIcon}>⚠️</span>
          <div>
            <strong>Função não vinculada a requisito</strong>
            <p style={styles.requisitoAlertText}>
              Recomendamos vincular esta função a um requisito funcional para rastreabilidade.
            </p>
          </div>
        </div>
      )}

      {/* CARD DE INFORMAÇÃO DO DESTINO */}
      <div style={{
        ...styles.infoCard,
        borderLeftColor: destinoInfo.cor,
        backgroundColor: `${destinoInfo.cor}10`
      }}>
        <p style={styles.infoTexto}>{destinoInfo.descricao}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>

          {/* LINHA 1: NOME E TIPO */}
          <div style={styles.formRow}>
            {/* 🆕 NÚMERO DA FUNÇÃO */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número *
                {errors.numeroFuncao && <span style={styles.errorBadge}>{errors.numeroFuncao}</span>}
              </label>
              <input
                type="text"
                name="numeroFuncao"
                value={formData.numeroFuncao}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.numeroFuncao && styles.inputError),
                  width: '80px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
                placeholder="001"
                disabled={isSubmitting}
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 2 }}>
              <label style={styles.label}>
                Nome da Função *
                {errors.nome && <span style={styles.errorBadge}>{errors.nome}</span>}
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                style={{ ...styles.input, ...(errors.nome && styles.inputError) }}
                placeholder="Ex: Cadastro de Cliente"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Tipo da Função *
              {errors.tipo && <span style={styles.errorBadge}>{errors.tipo}</span>}
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              style={{ ...styles.select, ...(errors.tipo && styles.inputError) }}
              disabled={isSubmitting}
            >
              <option value="">Selecione o tipo da função...</option>
              <optgroup label="Funções de Dados">
                <option value="ALI">ALI - Arquivo Lógico Interno</option>
                <option value="AIE">AIE - Arquivo de Interface Externa</option>
              </optgroup>
              <optgroup label="Funções de Transação">
                <option value="EE">EE - Entrada Externa</option>
                <option value="SE">SE - Saída Externa</option>
                <option value="CE">CE - Consulta Externa</option>
              </optgroup>
            </select>
          </div>

          {/* VÍNCULO COM REQUISITO */}
          {temRequisitos && (
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Vincular a Requisito (opcional)
                <span style={styles.optionalBadge}>Opcional</span>
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
                <option value="">Selecione um requisito funcional...</option>
                {requisitosFuncionais.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.id} - {req.nome || req.descricao.substring(0, 40) + '...'}
                  </option>
                ))}
              </select>

              {requisitoSelecionado && (
                <div style={styles.requisitoInfoCard}>
                  <div style={styles.requisitoInfoHeader}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981' }}>
                      check_circle
                    </span>
                    <span style={styles.requisitoInfoTitle}>Requisito vinculado:</span>
                  </div>
                  <div style={styles.requisitoInfoId}>{requisitoSelecionado.id}</div>
                  <div style={styles.requisitoInfoDesc}>{requisitoSelecionado.descricao}</div>
                </div>
              )}

              {todosRequisitos.filter(r => r.tipo === 'nao-funcional').length > 0 && (
                <div style={styles.rnfSection}>
                  <div style={styles.rnfTitle}>Requisitos Não-Funcionais disponíveis:</div>
                  <div style={styles.rnfList}>
                    {todosRequisitos
                      .filter(r => r.tipo === 'nao-funcional')
                      .slice(0, 3)
                      .map(r => (
                        <span key={r.id} style={styles.rnfTag}>{r.id}</span>
                      ))}
                    {todosRequisitos.filter(r => r.tipo === 'nao-funcional').length > 3 && (
                      <span style={styles.rnfTag}>+{todosRequisitos.filter(r => r.tipo === 'nao-funcional').length - 3}</span>
                    )}
                  </div>
                  <div style={styles.rnfNote}>
                    * RNF não são selecionáveis diretamente, mas devem ser considerados no projeto
                  </div>
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

          {/* 🆕 MÉTRICAS COM TOOLTIPS E ALERTAS */}
          <div style={styles.metricasCard}>
            <h4 style={styles.metricasTitulo}>📊 Métricas de Complexidade</h4>
            <div style={styles.metricasGrid}>
              {/* TD COM TOOLTIP E ALERTA */}
              <div style={styles.metricaItem}>
                <label style={styles.labelMetrica}>
                  TD (Tipos de Dado) *
                  <InfoTooltip {...ifpugInfo.TD} />
                  {errors.td && <span style={styles.errorBadge}>{errors.td}</span>}
                </label>
                <input
                  type="number"
                  name="td"
                  min="1"
                  max="999"
                  value={formData.td}
                  onChange={handleChange}
                  style={{
                    ...styles.inputMetrica,
                    ...(errors.td && styles.inputError),
                    ...(formData.td > 50 && styles.inputWarning)
                  }}
                  disabled={isSubmitting}
                />
                <span style={styles.metricaAjuda}>Campos únicos reconhecidos pelo usuário</span>
                {/* 🆕 ALERTA DE VALOR ATÍPICO */}
                <ValorAtipicoAlert
                  valor={formData.td}
                  tipo="TD"
                  limite={50}
                />
              </div>

              {/* AR/TR COM TOOLTIP E ALERTA */}
              <div style={styles.metricaItem}>
                <label style={styles.labelMetrica}>
                  {referenciaInfo.label} *
                  <InfoTooltip {...infoReferencia} />
                  {errors.arTr && <span style={styles.errorBadge}>{errors.arTr}</span>}
                </label>
                <input
                  type="number"
                  name="arTr"
                  min={formData.tipo === 'ALI' || formData.tipo === 'AIE' ? 1 : 0}
                  max="999"
                  value={formData.arTr}
                  onChange={handleChange}
                  style={{
                    ...styles.inputMetrica,
                    ...(errors.arTr && styles.inputError),
                    ...(formData.arTr > 20 && styles.inputWarning)
                  }}
                  disabled={isSubmitting}
                />
                <span style={styles.metricaAjuda}>{referenciaInfo.descricao}</span>
                {/* 🆕 ALERTA DE VALOR ATÍPICO */}
                <ValorAtipicoAlert
                  valor={formData.arTr}
                  tipo={isDados ? 'TR' : 'AR'}
                  limite={20}
                />
              </div>
            </div>

            {/* 🆕 LINKS PARA DOCUMENTAÇÃO */}
            <div style={styles.docLinksBox}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3b82f6' }}>
                menu_book
              </span>
              <span style={styles.docLinksText}>
                Dúvidas sobre contagem? Consulte:{' '}
                <a href="https://www.ifpug.org/ifpug-standards/" target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                  IFPUG CPM 4.3
                </a>
                {' • '}
                <a href="https://www.bfpug.com.br/" target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                  BFPUG Brasil
                </a>
              </span>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Descrição <span style={styles.optional}>(opcional)</span>
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Descreva brevemente a função..."
              rows="2"
              maxLength="200"
              disabled={isSubmitting}
            />
            <div style={styles.counter}>{formData.descricao.length}/200</div>
          </div>

          {/* CARD DE PRÉ-CÁLCULO */}
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <span style={styles.previewIcono}>🧮</span>
              <span style={styles.previewTitulo}>Pré-visualização do Cálculo</span>
            </div>

            <div style={styles.previewGrid}>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Tipo</span>
                <span style={styles.previewValor}>{formData.tipo}</span>
              </div>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Complexidade</span>
                <span style={{
                  ...styles.previewValor,
                  color: complexidade === 'Alta' ? '#dc2626' : complexidade === 'Média' ? '#d97706' : '#059669'
                }}>{complexidade}</span>
              </div>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Pontos de Função</span>
                <span style={{ ...styles.previewValor, ...styles.previewDestaque }}>{pf} PF</span>
              </div>
              <div style={styles.previewItem}>
                <span style={styles.previewLabel}>Valor Estimado</span>
                <span style={styles.previewValor}>R$ {(pf * empresaAtualObj.valorPF).toFixed(2)}</span>
              </div>
            </div>

            {formData.requisitoId && requisitoSelecionado && (
              <div style={styles.previewRequisito}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#10b981' }}>
                  link
                </span>
                <span>Vinculado a: <strong>{requisitoSelecionado.id}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* BOTÃO DE SUBMIT */}
        <div style={styles.acoes}>
          <button
            type="submit"
            style={{
              ...styles.botaoSubmit,
              ...(isSubmitting || !formData.nome.trim() ? styles.botaoDisabled : {})
            }}
            disabled={isSubmitting || !formData.nome.trim()}
          >
            {isSubmitting ? (
              <>
                <span style={styles.spinner}>⟳</span>
                Adicionando...
              </>
            ) : (
              <>
                <span>➕</span>
                Adicionar Função
              </>
            )}
          </button>
        </div>
      </form >
    </div >
  );
};

// ESTILOS ATUALIZADOS COM TOOLTIPS E ALERTAS
const styles = {
  container: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  containerVazio: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  },
  iconVazio: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  tituloVazio: {
    margin: '0 0 8px 0',
    color: '#374151',
    fontSize: '1.25rem'
  },
  textoVazio: {
    margin: 0,
    color: '#6b7280'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '12px'
  },
  headerPrincipal: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  iconePrincipal: {
    fontSize: '28px'
  },
  tituloPrincipal: {
    margin: '0 0 4px 0',
    color: '#111827',
    fontSize: '1.5rem',
    fontWeight: 700
  },
  subtitulo: {
    margin: 0,
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  destinoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 500,
    border: '2px solid',
    backgroundColor: '#eff6ff',
    color: '#1e40af'
  },
  melhoriaAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    marginBottom: '16px',
    color: '#92400e'
  },
  melhoriaAlertIcon: {
    fontSize: '20px',
    flexShrink: 0
  },
  melhoriaAlertText: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: '#a16207'
  },
  requisitoAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fefce8',
    border: '1px solid #fde047',
    borderRadius: '8px',
    marginBottom: '16px',
    color: '#854d0e'
  },
  requisitoAlertIcon: {
    fontSize: '20px',
    flexShrink: 0
  },
  requisitoAlertText: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: '#a16207'
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    borderLeft: '4px solid #3b82f6'
  },
  infoTexto: {
    margin: 0,
    color: '#475569',
    fontSize: '0.9rem'
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorBadge: {
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: '#fee2e2',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  optionalBadge: {
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: 'auto'
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#111827',
    transition: 'all 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  },
  // 🆕 ESTILO PARA VALORES ATÍPICOS
  inputWarning: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb'
  },
  select: {
    padding: '10px 12px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#111827',
    backgroundColor: 'white',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box'
  },
  selectComRequisito: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4'
  },
  tipoDescricao: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '4px'
  },
  optional: {
    color: '#9ca3af',
    fontWeight: 400
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
  rnfSection: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '8px'
  },
  rnfTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#1e40af',
    marginBottom: '8px'
  },
  rnfList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px'
  },
  rnfTag: {
    padding: '2px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 500
  },
  rnfNote: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontStyle: 'italic'
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
  metricasCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #e2e8f0'
  },
  metricasTitulo: {
    margin: '0 0 16px 0',
    fontSize: '0.95rem',
    color: '#374151',
    fontWeight: 600
  },
  metricasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  metricaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  labelMetrica: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#4b5563'
  },
  inputMetrica: {
    padding: '12px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box'
  },
  metricaAjuda: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  // 🆕 ESTILOS DO TOOLTIP
  infoIcon: {
    cursor: 'help',
    fontSize: '14px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 1,
    },
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
  // 🆕 ESTILOS DO ALERTA ATÍPICO
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
  // 🆕 LINKS DE DOCUMENTAÇÃO
  docLinksBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe'
  },
  docLinksText: {
    fontSize: '0.8rem',
    color: '#1e40af'
  },
  docLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
    ':hover': {
      textDecoration: 'underline'
    }
  },
  textarea: {
    padding: '10px 12px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#111827',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '60px',
    width: '100%',
    boxSizing: 'border-box'
  },
  counter: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'right'
  },
  previewCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    padding: '16px',
    color: 'white'
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  previewIcono: {
    fontSize: '20px'
  },
  previewTitulo: {
    fontSize: '0.95rem',
    fontWeight: 600
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px'
  },
  previewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  previewLabel: {
    fontSize: '0.75rem',
    opacity: 0.9
  },
  previewValor: {
    fontSize: '1rem',
    fontWeight: 600
  },
  previewDestaque: {
    fontSize: '1.25rem',
    color: '#fef08a'
  },
  previewRequisito: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    fontSize: '0.875rem',
    opacity: 0.9
  },
  acoes: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  botaoSubmit: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#1246e2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(18, 70, 226, 0.2)'
  },
  botaoDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  }
};

const cssStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(18, 70, 226, 0.3);
  }
  @media (max-width: 640px) {
    .formRow { grid-template-columns: 1fr !important; }
    .metricasGrid { grid-template-columns: 1fr !important; }
    .previewGrid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

export default NewEntryForm;