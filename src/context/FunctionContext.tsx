import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { calcularPF, classificarFuncao } from '../utils/ifpugCalculator';
import { Empresa, Projeto, Funcao, Requisito, SquadMembro } from '../types';

// Criar o Contexto
const FunctionContext = createContext<any>(null);

// Provider Component
export const FunctionProvider = ({ children }: { children: ReactNode }) => {
  // ====================
  // 1. ESTADO PRINCIPAL
  // ====================
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtual, setEmpresaAtual] = useState<string | null>(null);
  const [projetoAtual, setProjetoAtual] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>('idle');
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // ====================
  // 2. ESTRUTURA DE DADOS CORRETA
  // ====================
  const createInitialData = () => {
    return {
      empresas: [],
      empresaAtual: null,
      projetoAtual: null,
      lastModified: new Date().toISOString(),
      version: '1.4.0' // 🆕 VERSÃO ATUALIZADA COM CARGOS/FUNCIONÁRIOS
    };
  };

  // ====================
  // 3. HELPERS PARA ACESSAR DADOS ATUAIS (USANDO IDs)
  // ====================
  const getEmpresaAtual = (): Empresa | null => {
    if (!empresaAtual) return null;
    return empresas.find(emp => emp.id === empresaAtual) || null;
  };

  const getProjetoAtual = (): Projeto | null => {
    const empresa = getEmpresaAtual();
    if (!empresa || !empresa.projetos) return null;
    if (!projetoAtual) return null;
    return empresa.projetos.find(proj => proj.id === projetoAtual) || null;
  };

  // ✅ CORRETO: Buscar Funções do Projeto Atual
  const getTodasFuncoesAtuais = (): any[] => {
    const projeto = getProjetoAtual();
    if (!projeto) return [];
    if (projeto.funcoes) {
      return projeto.funcoes.map((func: any) => ({
        ...func,
        origem: 'projeto',
        origemNome: projeto.nome,
        origemId: projeto.id
      }));
    }
    return [];
  };

  // ✅ FUNÇÕES SEPARADAS PARA DASHBOARD
  const getFuncoesProjetoAtual = (): Funcao[] => {
    const projeto = getProjetoAtual();
    return projeto?.funcoes || [];
  };

  // 🆕 NOVO: Gerar próximo número sequencial para funções (001, 002...)
  const getProximoNumeroFuncao = (projetoId?: string): string => {
    const empresa = getEmpresaAtual();
    const projeto = empresa?.projetos?.find(p => p.id === (projetoId || projetoAtual));
    if (!projeto || !projeto.funcoes || projeto.funcoes.length === 0) return '001';

    const numeros = projeto.funcoes
      .map(f => parseInt(f.numeroFuncao))
      .filter(n => !isNaN(n));

    if (numeros.length === 0) return '001';
    const proximo = Math.max(...numeros) + 1;
    return proximo.toString().padStart(3, '0');
  };

  // 🆕 NOVO: Obter requisitos do projeto atual
  const getRequisitosProjeto = useCallback((): Requisito[] => {
    const projeto = getProjetoAtual();
    return projeto?.requisitos || [];
  }, [empresas, empresaAtual, projetoAtual]);

  // 🆕 NOVO: Obter requisitos funcionais (para dropdown)
  const getRequisitosFuncionais = useCallback((): Requisito[] => {
    const requisitos = getRequisitosProjeto();
    return requisitos.filter(req => req.tipo === 'funcional');
  }, [getRequisitosProjeto]);

  // 🆕 NOVO: Verificar se requisito está vinculado a alguma função
  const isRequisitoVinculado = useCallback((requisitoId: string): boolean => {
    const funcoes = getFuncoesProjetoAtual();
    return funcoes.some(func => func.requisitoId === requisitoId);
  }, [getFuncoesProjetoAtual]);

  // 🆕 NOVO: Obter funções vinculadas a um requisito
  const getFuncoesPorRequisito = useCallback((requisitoId: string): Funcao[] => {
    const funcoes = getFuncoesProjetoAtual();
    return funcoes.filter(func => func.requisitoId === requisitoId);
  }, [getFuncoesProjetoAtual]);

  // ====================
  // 4. PERSISTÊNCIA - CARREGAR (CORRIGIDA)
  // ====================
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        console.log('📂 [Context] Carregando dados do sistema...');
        let loadedData: any = null;

        // 1 - Tentar carregar do Backend (SQLite)
        try {
          console.log('🌐 [Context] Buscando estado atual no servidor...');
          const { backupAPI } = await import('../utils/webAdapter');
          const serverData = await backupAPI.load('ESTADO_ATUAL_DB.json');
          if (serverData && serverData.empresas) {
            console.log('✅ [Context] Dados carregados do servidor com sucesso');
            loadedData = serverData;
          }
        } catch (serverErr) {
          console.warn('⚠️ [Context] Falha ao carregar do servidor, tentando localStorage...', serverErr);
        }

        // 2 - Fallback para localStorage
        if (!loadedData) {
          console.log('💻 [Context] Usando localStorage como fallback');
          const stored = localStorage.getItem('standardpoint-data');
          if (stored) {
            loadedData = JSON.parse(stored);
          }
        }

        if (!mounted) return;

        if (loadedData && loadedData.empresas) {
          console.log(`✅ [Context] ${loadedData.empresas.length} empresa(s) carregada(s)`);

          const cargosDefault = [
            { id: 'c1', titulo: 'Analista de Negócios', fatorPF: 0 },
            { id: 'c2', titulo: 'Desenvolvedor Frontend', fatorPF: 0 },
            { id: 'c3', titulo: 'Desenvolvedor Backend', fatorPF: 0 },
            { id: 'c4', titulo: 'Desenvolvedor Fullstack', fatorPF: 0 },
            { id: 'c5', titulo: 'Analista de QA', fatorPF: 0 },
            { id: 'c6', titulo: 'Product Owner (PO)', fatorPF: 0 },
            { id: 'c7', titulo: 'Arquiteto de Software', fatorPF: 0 },
            { id: 'c8', titulo: 'Scrum Master', fatorPF: 0 }
          ];

          const empresasComFuncoes = loadedData.empresas.map(empresa => {
            let cargos = empresa.cargos || [...cargosDefault];
            let funcionarios = empresa.funcionarios || [];

            // Migração da equipe antiga
            if (empresa.equipe && empresa.equipe.length > 0 && funcionarios.length === 0) {
              console.log(`🔄 [Context] Migrando equipe da empresa ${empresa.nome}`);
              empresa.equipe.forEach(membro => {
                let cargoId = cargos.find(c => c.titulo.toLowerCase() === membro.cargo.toLowerCase())?.id;
                if (!cargoId) {
                  const newCargo = { id: `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, titulo: membro.cargo, fatorPF: 0 };
                  cargos.push(newCargo);
                  cargoId = newCargo.id;
                }
                funcionarios.push({
                  id: `func-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  nome: membro.nome,
                  cargoId: cargoId,
                  fatorIndividualPF: 0
                });
              });
            }

            const { equipe, ...empresaSemEquipe } = empresa; // Remove equipe antiga para limpar DB

            return {
              ...empresaSemEquipe,
              cargos,
              funcionarios,
              projetos: empresa.projetos?.map(projeto => ({
                ...projeto,
                funcoes: projeto.funcoes || [],
                requisitos: projeto.requisitos || [],
                squad: projeto.squad || [] // 🆕 GARANTIR QUE SQUAD EXISTA
              })) || []
            };
          });

          setEmpresas(empresasComFuncoes);


          if (loadedData.empresaAtual) {
            const empresaExiste = empresasComFuncoes.find(e => e.id === loadedData.empresaAtual);
            if (empresaExiste) {
              setEmpresaAtual(loadedData.empresaAtual);
              if (loadedData.projetoAtual) {
                const empresa = empresasComFuncoes.find(e => e.id === loadedData.empresaAtual);
                const projetoExiste = empresa?.projetos?.find(p => p.id === loadedData.projetoAtual);
                if (projetoExiste) {
                  setProjetoAtual(loadedData.projetoAtual);
                }
              }
            }
          }

          if (loadedData.lastModified) {
            setLastSaved(loadedData.lastModified);
          }
        } else {
          console.log('🆕 [Context] Criando estrutura inicial vazia');
          const initialData = createInitialData();
          setEmpresas(initialData.empresas);
          setEmpresaAtual(null);
          setProjetoAtual(null);
        }
      } catch (error) {
        console.error('❌ [Context] Erro ao carregar dados:', error);
        if (mounted) {
          const initialData = createInitialData();
          setEmpresas(initialData.empresas);
          setEmpresaAtual(null);
          setProjetoAtual(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoadComplete(true);
          console.log('🚀 [Context] Carregamento inicial completo');
        }
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
      console.log('🧹 [Context] Componente desmontado');
    };
  }, []);

  // ====================
  // 5. PERSISTÊNCIA - SALVAR (CORRIGIDA)
  // ====================
  useEffect(() => {
    if (loading || !initialLoadComplete) return;

    const saveData = async () => {
      try {
        setSaveStatus('saving');
        const dataToSave = {
          empresas,
          empresaAtual,
          projetoAtual,
          lastModified: new Date().toISOString(),
          version: '1.4.0'
        };

        // Salvar localmente
        localStorage.setItem('standardpoint-data', JSON.stringify(dataToSave));
        
        // Salvar no servidor (Auto-sync)
        try {
          const { backupAPI } = await import('../utils/webAdapter');
          await backupAPI.save(dataToSave, 'ESTADO_ATUAL_DB.json');
          console.log('✅ [Context] Dados sincronizados com o servidor');
        } catch (serverErr) {
          console.error('⚠️ [Context] Erro ao sincronizar com servidor:', serverErr);
        }

        setLastSaved(dataToSave.lastModified);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('❌ [Context] Erro ao salvar dados:', error);
        setSaveStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 2000);
    return () => clearTimeout(timeoutId);
  }, [empresas, empresaAtual, projetoAtual, loading, initialLoadComplete]);

  // ====================
  // 6. FUNÇÕES DE BACKUP
  // ====================
  const getBackupData = useCallback(() => {
    return {
      empresas,
      empresaAtual,
      projetoAtual,
      lastModified: new Date().toISOString(),
      version: '1.4.0',
      tipo: 'backup-manual',
      totalEmpresas: empresas.length,
      totalProjetos: empresas.reduce((acc, emp) => acc + (emp.projetos?.length || 0), 0)
    };
  }, [empresas, empresaAtual, projetoAtual]);

  const createBackup = useCallback(async () => {
    try {
      setSaveStatus('saving');
      const dadosBackup = getBackupData();

      const { backupAPI } = await import('../utils/webAdapter');
      const result = await backupAPI.save(dadosBackup);
      if (result) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return {
          success: true,
          message: `Backup salvo com sucesso no servidor: ${result.filename || ''}`,
          filePath: result.filename
        };
      }
      throw new Error('Falha ao salvar backup no servidor');


    } catch (error) {
      console.error('❌ [Context] Erro no backup:', error);
      setSaveStatus('error');
      return { success: false, message: (error as Error).message };
    }
  }, [getBackupData]);

  // ====================
  // 7. FUNÇÕES DE NEGÓCIO
  // ====================
  const adicionarEmpresa = (novaEmpresa) => {
    console.log('➕ [Context] Adicionando nova empresa:', novaEmpresa.nome);
    const cargosDefault = [
      { id: `cargo-${Date.now()}-1`, titulo: 'Analista de Negócios', fatorPF: 0 },
      { id: `cargo-${Date.now()}-2`, titulo: 'Desenvolvedor Frontend', fatorPF: 0 },
      { id: `cargo-${Date.now()}-3`, titulo: 'Desenvolvedor Backend', fatorPF: 0 },
      { id: `cargo-${Date.now()}-4`, titulo: 'Desenvolvedor Fullstack', fatorPF: 0 },
      { id: `cargo-${Date.now()}-5`, titulo: 'Analista de QA', fatorPF: 0 },
      { id: `cargo-${Date.now()}-6`, titulo: 'Product Owner (PO)', fatorPF: 0 },
      { id: `cargo-${Date.now()}-7`, titulo: 'Arquiteto de Software', fatorPF: 0 },
      { id: `cargo-${Date.now()}-8`, titulo: 'Scrum Master', fatorPF: 0 }
    ];

    const empresaComId = {
      ...novaEmpresa,
      id: `empresa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      hcpp: novaEmpresa.hcpp || 20,
      projetos: [],
      cargos: cargosDefault,
      funcionarios: [],
      dataCriacao: new Date().toISOString()
    };
    setEmpresas(prev => [...prev, empresaComId]);
  };

  const updateEmpresa = (id, dadosAtualizados) => {
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === id) {
        return {
          ...emp,
          ...dadosAtualizados,
          updatedAt: new Date().toISOString()
        };
      }
      return emp;
    }));
  };

  const removerEmpresa = (id) => {
    setEmpresas(prev => {
      const novasEmpresas = prev.filter(emp => emp.id !== id);
      if (empresaAtual === id) {
        setEmpresaAtual(null);
        setProjetoAtual(null);
      }
      return novasEmpresas;
    });
  };

  // ====================
  // 7.1 FUNÇÕES DE CARGOS E FUNCIONÁRIOS
  // ====================
  const adicionarCargo = (empresaId, novoCargo) => {
    console.log('➕ [Context] Adicionando cargo à empresa:', empresaId);
    const cargoComId = {
      ...novoCargo,
      id: `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fatorPF: parseFloat(novoCargo.fatorPF) || 0
    };

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return { ...emp, cargos: [...(emp.cargos || []), cargoComId], updatedAt: new Date().toISOString() };
      }
      return emp;
    }));
  };

  const atualizarCargo = (empresaId, cargoId, dadosAtualizados) => {
    console.log(`✏️ [Context] Atualizando cargo ${cargoId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          cargos: emp.cargos.map(c => c.id === cargoId ? { ...c, ...dadosAtualizados, fatorPF: parseFloat(dadosAtualizados.fatorPF) || 0 } : c),
          updatedAt: new Date().toISOString()
        };
      }
      return emp;
    }));
  };

  const removerCargo = (empresaId, cargoId) => {
    console.log(`🗑️ [Context] Removendo cargo ${cargoId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return { ...emp, cargos: emp.cargos.filter(c => c.id !== cargoId), updatedAt: new Date().toISOString() };
      }
      return emp;
    }));
  };

  const adicionarFuncionario = (empresaId, novoFuncionario) => {
    console.log('➕ [Context] Adicionando funcionario à empresa:', empresaId);
    const funcComId = {
      ...novoFuncionario,
      id: `func-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fatorIndividualPF: parseFloat(novoFuncionario.fatorIndividualPF) || 0
    };

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return { ...emp, funcionarios: [...(emp.funcionarios || []), funcComId], updatedAt: new Date().toISOString() };
      }
      return emp;
    }));
  };

  const atualizarFuncionario = (empresaId, funcId, dadosAtualizados) => {
    console.log(`✏️ [Context] Atualizando funcionario ${funcId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          funcionarios: emp.funcionarios.map(f => f.id === funcId ? { ...f, ...dadosAtualizados, fatorIndividualPF: parseFloat(dadosAtualizados.fatorIndividualPF) || 0 } : f),
          updatedAt: new Date().toISOString()
        };
      }
      return emp;
    }));
  };

  const removerFuncionario = (empresaId, funcId) => {
    console.log(`🗑️ [Context] Removendo funcionario ${funcId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return { ...emp, funcionarios: emp.funcionarios.filter(f => f.id !== funcId), updatedAt: new Date().toISOString() };
      }
      return emp;
    }));
  };


  const adicionarProjeto = (empresaId, novoProjeto) => {
    console.log('➕ [Context] Adicionando novo projeto à empresa:', empresaId);
    const projetoComId = {
      ...novoProjeto,
      id: `projeto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      funcoes: [],
      requisitos: [], // 🆕 INICIALIZAR ARRAY DE REQUISITOS
      squad: [], // 🆕 INICIALIZAR ARRAY DO SQUAD DO PROJETO
      dataCriacao: new Date().toISOString(),
      dataInicioContagem: new Date().toISOString(),
      dataFimContagem: null
    };

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return { ...emp, projetos: [...emp.projetos, projetoComId] };
      }
      return emp;
    }));
  };

  const removerProjeto = (empresaId, projetoId) => {
    console.log(`🗑️ [Context] Removendo projeto ${projetoId} da empresa ${empresaId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return { ...emp, projetos: emp.projetos.filter(p => p.id !== projetoId) };
      }
      return emp;
    }));
    if (projetoAtual === projetoId) setProjetoAtual(null);
  };

  // 🆕 FUNÇÃO PARA ATUALIZAR PROJETO (NECESSÁRIA PARA MELHORIA)
  const updateProjeto = (empresaId, projetoId, dadosAtualizados) => {
    console.log(`✏️ [Context] Atualizando projeto ${projetoId} da empresa ${empresaId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return { ...proj, ...dadosAtualizados, updatedAt: new Date().toISOString() };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  // ====================
  // 7.2 FUNÇÕES DE SQUAD DO PROJETO
  // ====================
  const adicionarMembroSquad = (empresaId, projetoId, membroInfo) => {
    console.log(`➕ [Context] Adicionando membro ao squad do projeto ${projetoId}`);
    const membroComId = {
      ...membroInfo,
      id: `squad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      adicionadoEm: new Date().toISOString()
    };

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return { ...proj, squad: [...(proj.squad || []), membroComId], updatedAt: new Date().toISOString() };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  const atualizarMembroSquad = (empresaId, projetoId, squadId, dadosAtualizados) => {
    console.log(`✏️ [Context] Atualizando membro squad ${squadId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return {
                ...proj,
                squad: proj.squad.map(sq => sq.id === squadId ? { ...sq, ...dadosAtualizados } : sq),
                updatedAt: new Date().toISOString()
              };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  const removerMembroSquad = (empresaId, projetoId, squadId) => {
    console.log(`🗑️ [Context] Removendo membro squad ${squadId}`);
    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return { ...proj, squad: proj.squad.filter(sq => sq.id !== squadId), updatedAt: new Date().toISOString() };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  // 🆕 NOVO: ADICIONAR REQUISITO AO PROJETO
  const adicionarRequisito = (empresaId, projetoId, requisito) => {
    console.log(`➕ [Context] Adicionando requisito ao projeto ${projetoId}:`, requisito.id);

    const requisitoCompleto = {
      ...requisito,
      id: requisito.id.trim().toUpperCase(), // Normalizar ID
      dataCriacao: new Date().toISOString()
    };

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              const requisitosAtuais = proj.requisitos || [];
              return {
                ...proj,
                requisitos: [...requisitosAtuais, requisitoCompleto],
                updatedAt: new Date().toISOString()
              };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  // 🆕 NOVO: ATUALIZAR REQUISITO
  const atualizarRequisito = (empresaId, projetoId, requisitoId, dadosAtualizados) => {
    console.log(`✏️ [Context] Atualizando requisito ${requisitoId}`);

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return {
                ...proj,
                requisitos: proj.requisitos.map(req => {
                  if (req.id === requisitoId) {
                    return {
                      ...req,
                      ...dadosAtualizados,
                      id: dadosAtualizados.id ? dadosAtualizados.id.trim().toUpperCase() : req.id,
                      updatedAt: new Date().toISOString()
                    };
                  }
                  return req;
                }),
                updatedAt: new Date().toISOString()
              };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  // 🆕 NOVO: REMOVER REQUISITO
  const removerRequisito = (empresaId, projetoId, requisitoId) => {
    console.log(`🗑️ [Context] Removendo requisito ${requisitoId}`);

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return {
                ...proj,
                requisitos: proj.requisitos.filter(req => req.id !== requisitoId),
                // 🆕 REMOVER VÍNCULO DAS FUNÇÕES
                funcoes: proj.funcoes.map(func => {
                  if (func.requisitoId === requisitoId) {
                    return { ...func, requisitoId: null, requisitoDescricao: null };
                  }
                  return func;
                }),
                updatedAt: new Date().toISOString()
              };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  // 🆕 NOVO: VERIFICAR SE ID DE REQUISITO JÁ EXISTE
  const isRequisitoIdDuplicado = (empresaId, projetoId, requisitoId, excluirId = null) => {
    const empresa = empresas.find(e => e.id === empresaId);
    const projeto = empresa?.projetos?.find(p => p.id === projetoId);
    if (!projeto?.requisitos) return false;

    return projeto.requisitos.some(req =>
      req.id.toUpperCase() === requisitoId.toUpperCase() && req.id !== excluirId
    );
  };

  const addFunction = (novaFuncao, destino = 'projeto') => {
    console.log(`➕ [Context] Adicionando nova função no ${destino}:`, novaFuncao.nome);
    const empresa = getEmpresaAtual();
    const projeto = getProjetoAtual();

    if (!empresa) {
      alert('⚠️ Selecione uma empresa antes de adicionar funções');
      return;
    }
    if (!projeto) {
      alert('⚠️ Selecione um projeto antes de adicionar funções');
      return;
    }

    const td = novaFuncao.td || 1;
    const arTr = novaFuncao.arTr || (novaFuncao.tipo === 'ALI' || novaFuncao.tipo === 'AIE' ? 1 : 0);
    const { pf, complexidade } = calcularPF(novaFuncao.tipo, td, arTr);

    // 🆕 BUSCAR DESCRIÇÃO DO REQUISITO SE VINCULADO
    let requisitoDescricao: string | null = null;
    if (novaFuncao.requisitoId) {
      const requisito = projeto.requisitos?.find(r => r.id === novaFuncao.requisitoId);
      requisitoDescricao = requisito?.descricao || null;
    }

    const funcaoCompleta = {
      id: `f${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numeroFuncao: novaFuncao.numeroFuncao || getProximoNumeroFuncao(projeto.id), // 🆕 NOVO: NÚMERO DA FUNÇÃO
      nome: novaFuncao.nome.trim(),
      tipo: novaFuncao.tipo,
      td: td,
      arTr: arTr,
      descricao: novaFuncao.descricao || '',
      complexidade: complexidade,
      pf: pf,
      dataCriacao: new Date().toISOString(),
      // 🆕 CAMPOS DE RASTREABILIDADE
      requisitoId: novaFuncao.requisitoId || null,
      requisitoDescricao: requisitoDescricao,
      // 🆕 PRESERVAR tipoMelhoria se fornecido (para edição) ou null (para nova)
      tipoMelhoria: novaFuncao.tipoMelhoria !== undefined ? novaFuncao.tipoMelhoria : null
    };

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresa.id) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projeto.id) {
              return {
                ...proj,
                funcoes: [...proj.funcoes, funcaoCompleta],
                dataFimContagem: new Date().toISOString()
              };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
    console.log('✅ [Context] Função adicionada com sucesso');
  };

  // 🆕 FUNÇÃO PARA ATUALIZAR FUNÇÃO (NECESSÁRIA PARA MELHORIA)
  const updateFunction = (funcaoId, dadosAtualizados) => {
    console.log(`✏️ [Context] Atualizando função ${funcaoId}`);

    const projeto = getProjetoAtual();
    let requisitoDescricao = dadosAtualizados.requisitoDescricao;

    // 🆕 ATUALIZAR DESCRIÇÃO DO REQUISITO SE MUDOU O ID
    if (dadosAtualizados.requisitoId !== undefined) {
      if (dadosAtualizados.requisitoId) {
        const requisito = projeto?.requisitos?.find(r => r.id === dadosAtualizados.requisitoId);
        requisitoDescricao = requisito?.descricao || null;
      } else {
        requisitoDescricao = null;
      }
    }

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === empresaAtual) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoAtual) {
              return {
                ...proj,
                funcoes: proj.funcoes.map(func => {
                  if (func.id === funcaoId) {
                    return {
                      ...func,
                      ...dadosAtualizados,
                      // 🆕 ATUALIZAR DESCRIÇÃO DO REQUISITO
                      requisitoDescricao: requisitoDescricao !== undefined ? requisitoDescricao : func.requisitoDescricao
                    };
                  }
                  return func;
                })
              };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  const removeFunction = (id, empresaIdOverride = null, projetoIdOverride = null) => {
    const targetEmpresaId = empresaIdOverride || empresaAtual;
    const targetProjetoId = projetoIdOverride || projetoAtual;

    if (!targetEmpresaId || !targetProjetoId) {
      console.warn('⚠️ [Context] Tentativa de remover função sem empresa/projeto alvo.', { id, targetEmpresaId, targetProjetoId });
      return;
    }

    setEmpresas(prev => prev.map(emp => {
      if (emp.id === targetEmpresaId) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === targetProjetoId) {
              return { ...proj, funcoes: proj.funcoes.filter(f => f.id !== id) };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  const saveVAF = (projetoId, vafData) => {
    console.log(`💾 [Context] Salvando VAF para projeto ${projetoId}:`, vafData);
    if (!projetoId) return;

    setEmpresas(prev => prev.map(emp => {
      const temProjeto = emp.projetos?.some(p => p.id === projetoId);
      if (temProjeto) {
        return {
          ...emp,
          projetos: emp.projetos.map(proj => {
            if (proj.id === projetoId) {
              return { ...proj, vaf: vafData, updatedAt: new Date().toISOString() };
            }
            return proj;
          })
        };
      }
      return emp;
    }));
  };

  // ====================
  // 8. CÁLCULOS - ATUALIZADO PARA 3 TIPOS DE CONTAGEM E RASTREABILIDADE
  // ====================
  const calculateTotals = useCallback(() => {
    const todasFuncoes = getTodasFuncoesAtuais();
    const empresa = getEmpresaAtual();
    const projeto = getProjetoAtual();

    let totalPFBruto = 0;
    let funcoesDados = 0;
    let funcoesTransacao = 0;

    // 🆕 ESTATÍSTICAS DE MELHORIA
    let melhoriaStats = {
      ADD: { count: 0, pf: 0 },
      CHG: { count: 0, pf: 0 },
      DEL: { count: 0, pf: 0 },
      CF: { count: 0, pf: 0 }
    };

    // 🆕 ESTATÍSTICAS DE RASTREABILIDADE
    const requisitos = projeto?.requisitos || [];
    const requisitosVinculadosIds = new Set();
    let funcoesSemRequisito = 0;

    todasFuncoes.forEach(func => {
      const pf = func.pf || 0;

      // Contagem normal
      totalPFBruto += pf;
      if (func.tipo === 'ALI' || func.tipo === 'AIE') {
        funcoesDados++;
      } else {
        funcoesTransacao++;
      }

      // 🆕 Se for melhoria, separar por classificação
      if (projeto?.tipoContagem === 'melhoria' && func.tipoMelhoria) {
        if (melhoriaStats[func.tipoMelhoria]) {
          melhoriaStats[func.tipoMelhoria].count++;
          melhoriaStats[func.tipoMelhoria].pf += pf;
        }
      }

      // 🆕 ESTATÍSTICAS DE RASTREABILIDADE
      if (func.requisitoId) {
        requisitosVinculadosIds.add(func.requisitoId);
      } else {
        funcoesSemRequisito++;
      }
    });

    const vaf = projeto?.vaf?.valor || 1.00;

    // 🆕 CÁLCULO DIFERENTE POR TIPO DE CONTAGEM
    let totalPFAjustado;

    if (projeto?.tipoContagem === 'melhoria') {
      // Fórmula IFPUG para melhoria: (ADD + CHG + DEL) - CF
      const baseMelhoria = melhoriaStats.ADD.pf +
        melhoriaStats.CHG.pf +
        melhoriaStats.DEL.pf;
      const cfPf = melhoriaStats.CF.pf;
      totalPFAjustado = (baseMelhoria - cfPf) * vaf;

      // Garantir que não fique negativo (embora CF raramente seja maior que a soma)
      if (totalPFAjustado < 0) totalPFAjustado = 0;
    } else {
      // Desenvolvimento ou Aplicação (baseline): soma simples
      totalPFAjustado = totalPFBruto * vaf;
    }

    const valorTotal = empresa ? totalPFAjustado * empresa.valorPF : 0;
    const hcpp = empresa?.hcpp || 20;
    const esforcoTotal = totalPFAjustado * hcpp;

    // 🆕 CÁLCULO DE COBERTURA DE REQUISITOS
    const totalRequisitos = requisitos.length;
    const requisitosVinculados = requisitosVinculadosIds.size;
    const percentualCobertura = totalRequisitos > 0
      ? Math.round((requisitosVinculados / totalRequisitos) * 100)
      : 0;

    return {
      totalPF: totalPFAjustado.toFixed(2),
      totalPFBruto: totalPFBruto.toFixed(2),
      totalPFAjustado: totalPFAjustado.toFixed(2),
      vaf: vaf.toFixed(3),
      funcoesDados,
      funcoesTransacao,
      totalItems: todasFuncoes.length,
      valorTotal: valorTotal.toFixed(2),
      esforcoTotal: esforcoTotal.toFixed(0),
      diasUteis: (esforcoTotal / 8).toFixed(1),
      hcpp: hcpp,
      // 🆕 Incluir stats de melhoria se aplicável
      melhoriaStats: projeto?.tipoContagem === 'melhoria' ? melhoriaStats : null,
      // 🆕 ESTATÍSTICAS DE RASTREABILIDADE
      coberturaRequisitos: {
        totalRequisitos,
        requisitosVinculados,
        funcoesSemRequisito,
        percentualCobertura: `${percentualCobertura}%`
      }
    };
  }, [empresas, empresaAtual, projetoAtual]);

  const totals = calculateTotals();

  // ====================
  // 9. SELEÇÃO
  // ====================
  const selecionarEmpresa = (empresaId) => {
    console.log(`🎯 [Context] Selecionando empresa: ${empresaId}`);
    if (!empresaId) {
      setEmpresaAtual(null);
      setProjetoAtual(null);
      return;
    }
    const empresaExiste = empresas.find(e => e.id === empresaId);
    if (empresaExiste) {
      setEmpresaAtual(empresaId);
      setProjetoAtual(null);
    }
  };

  const selecionarProjeto = (projetoId) => {
    const empresa = getEmpresaAtual();
    if (!empresa) return;
    if (!projetoId) {
      setProjetoAtual(null);
      return;
    }
    const projetoExiste = empresa.projetos?.find(p => p.id === projetoId);
    if (projetoExiste) {
      setProjetoAtual(projetoId);
    }
  };

  // ====================
  // 10. FUNÇÕES AUXILIARES
  // ====================
  const getEstatisticasProjeto = () => {
    const projeto = getProjetoAtual();
    if (!projeto) return null;
    return {
      funcoesDiretas: projeto.funcoes?.length || 0,
      totalFuncoes: projeto.funcoes?.length || 0
    };
  };

  // ====================
  // 11. VALOR DO CONTEXTO
  // ====================
  const value = {
    // Estado
    empresas,
    empresaAtual,
    projetoAtual,
    crAtual: null,
    loading,
    saveStatus,
    lastSaved,

    // Dados atuais
    empresaAtualObj: getEmpresaAtual(),
    projetoAtualObj: getProjetoAtual(),
    crAtualObj: null,
    funcoes: getTodasFuncoesAtuais(),
    funcoesProjeto: getFuncoesProjetoAtual(),
    funcoesCR: [],

    // Estatísticas
    totals,
    getEstatisticasProjeto,

    // Ações - Empresas
    adicionarEmpresa,
    updateEmpresa,
    removerEmpresa,
    selecionarEmpresa,

    // Ações - Projetos
    adicionarProjeto,
    removerProjeto,
    selecionarProjeto,
    updateProjeto, // 🆕 NOVO

    // 🆕 AÇÕES - REQUISITOS (RASTREABILIDADE)
    adicionarRequisito,
    atualizarRequisito,
    removerRequisito,
    getRequisitosProjeto,
    getRequisitosFuncionais,
    isRequisitoVinculado,
    getFuncoesPorRequisito,
    isRequisitoIdDuplicado,

    // Ações - Funções
    addFunction,
    removeFunction,
    saveVAF,
    updateFunction, // 🆕 NOVO
    getProximoNumeroFuncao, // 🆕 NOVO

    // 🆕 AÇÕES - SQUAD DO PROJETO
    adicionarMembroSquad,
    atualizarMembroSquad,
    removerMembroSquad,

    // 🆕 AÇÕES - CARGOS E FUNCIONÁRIOS
    adicionarCargo,
    atualizarCargo,
    removerCargo,
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario,

    // Funções de Backup
    createBackup,
    getBackupData,

    // Helper
    converterTipoParaPortugues: (tipo) => {
      const mapa = { 'EI': 'EE', 'EO': 'SE', 'EQ': 'CE', 'ILF': 'ALI', 'EIF': 'AIE' };
      return mapa[tipo] || tipo;
    },

    calcularEsforcoProjeto: (pfTotal) => {
      const empresa = getEmpresaAtual();
      const hcpp = empresa?.hcpp || 20;
      const esforcoHoras = pfTotal * hcpp;
      return {
        horas: esforcoHoras,
        dias: (esforcoHoras / 8).toFixed(1),
        hcpp: hcpp
      };
    }
  };

  return (
    <FunctionContext.Provider value={value}>
      {children}
    </FunctionContext.Provider>
  );
};

// Hook personalizado
export const useFunctionContext = () => {
  const context = useContext(FunctionContext);
  if (!context) {
    throw new Error('useFunctionContext deve ser usado dentro de FunctionProvider');
  }
  return context;
};


export { FunctionContext };