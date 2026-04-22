const db = require('../database/sqlite');
const fs = require('fs');
const path = require('path');

const importBackupToDb = db.transaction((dadosBackup) => {
  // Truncar tabelas (exceto users e configuracoes_backup)
  db.prepare('DELETE FROM funcoes').run();
  db.prepare('DELETE FROM requisitos').run();
  db.prepare('DELETE FROM squad_membros').run();
  db.prepare('DELETE FROM funcionarios').run();
  db.prepare('DELETE FROM cargos').run();
  db.prepare('DELETE FROM projetos').run();
  db.prepare('DELETE FROM empresas').run();

  const empresas = dadosBackup.empresas || [];
  
  const insertEmpresa = db.prepare('INSERT INTO empresas (id, nome, valor_pf, hcpp, fase_ciclo) VALUES (?, ?, ?, ?, ?)');
  const insertCargo = db.prepare('INSERT INTO cargos (id, empresa_id, titulo, fator_pf) VALUES (?, ?, ?, ?)');
  const insertFuncionario = db.prepare('INSERT INTO funcionarios (id, empresa_id, cargo_id, nome, fator_individual_pf) VALUES (?, ?, ?, ?, ?)');
  const insertProjeto = db.prepare('INSERT INTO projetos (id, empresa_id, nome, descricao, data_inicio_contagem, data_fim_contagem) VALUES (?, ?, ?, ?, ?, ?)');
  const insertSquad = db.prepare('INSERT INTO squad_membros (id, projeto_id, funcionario_id) VALUES (?, ?, ?)');
  const insertRequisito = db.prepare('INSERT INTO requisitos (id, projeto_id, descricao, tipo) VALUES (?, ?, ?, ?)');
  const insertFuncao = db.prepare('INSERT INTO funcoes (id, projeto_id, requisito_id, numero_funcao, nome, tipo, td, artr, descricao, complexidade, pf, tipo_melhoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  for (const emp of empresas) {
    insertEmpresa.run(
      emp.id, 
      emp.nome, 
      emp.valorPF || 0, 
      emp.hcpp || 20, 
      emp.faseCiclo || null
    );

    const cargos = emp.cargos || [];
    for (const cargo of cargos) {
      insertCargo.run(cargo.id, emp.id, cargo.titulo, cargo.fatorPF || 0);
    }

    const funcionarios = emp.funcionarios || [];
    for (const func of funcionarios) {
      insertFuncionario.run(func.id, emp.id, func.cargoId, func.nome, func.fatorIndividualPF || 0);
    }

    const projetos = emp.projetos || [];
    for (const proj of projetos) {
      insertProjeto.run(
        proj.id, 
        emp.id, 
        proj.nome, 
        proj.descricao || null, 
        proj.dataInicioContagem || null, 
        proj.dataFimContagem || null
      );

      const squad = proj.squad || [];
      for (const sq of squad) {
        insertSquad.run(sq.id, proj.id, sq.funcionarioId || sq.funcionario_id);
      }

      const requisitos = proj.requisitos || [];
      for (const req of requisitos) {
        let reqId = req.id;
        // Check for valid ID string instead of weird nulls if present
        if (!reqId) reqId = `req_${Date.now()}_${Math.random()}`;
        insertRequisito.run(reqId, proj.id, req.descricao || '', req.tipo || null);
      }

      const funcoes = proj.funcoes || [];
      for (const func of funcoes) {
        insertFuncao.run(
          func.id, 
          proj.id, 
          func.requisitoId || null, 
          func.numeroFuncao || null, 
          func.nome, 
          func.tipo, 
          func.td || 1, 
          func.arTr || 0, 
          func.descricao || null, 
          func.complexidade || null, 
          func.pf || 0, 
          func.tipoMelhoria || func.tipo_melhoria || null
        );
      }
    }
  }
});

const exportDbToBackup = () => {
   const empresasRaw = db.prepare('SELECT * FROM empresas').all();
   
   const empresas = empresasRaw.map(emp => {
      const cargos = db.prepare('SELECT * FROM cargos WHERE empresa_id = ?').all(emp.id).map(c => ({
         id: c.id,
         titulo: c.titulo,
         fatorPF: c.fator_pf
      }));

      const funcionarios = db.prepare('SELECT * FROM funcionarios WHERE empresa_id = ?').all(emp.id).map(f => ({
         id: f.id,
         cargoId: f.cargo_id,
         nome: f.nome,
         fatorIndividualPF: f.fator_individual_pf
      }));

      const projetosRaw = db.prepare('SELECT * FROM projetos WHERE empresa_id = ?').all(emp.id);
      const projetos = projetosRaw.map(proj => {
         const squad = db.prepare('SELECT * FROM squad_membros WHERE projeto_id = ?').all(proj.id).map(sq => ({
            id: sq.id,
            funcionarioId: sq.funcionario_id
         }));

         const requisitos = db.prepare('SELECT * FROM requisitos WHERE projeto_id = ?').all(proj.id).map(req => ({
            id: req.id,
            descricao: req.descricao,
            tipo: req.tipo
         }));

         const funcoes = db.prepare('SELECT * FROM funcoes WHERE projeto_id = ?').all(proj.id).map(f => ({
            id: f.id,
            requisitoId: f.requisito_id,
            numeroFuncao: f.numero_funcao,
            nome: f.nome,
            tipo: f.tipo,
            td: f.td,
            arTr: f.artr,
            descricao: f.descricao,
            complexidade: f.complexidade,
            pf: f.pf,
            tipoMelhoria: f.tipo_melhoria
         }));

         return {
            id: proj.id,
            nome: proj.nome,
            descricao: proj.descricao,
            dataInicioContagem: proj.data_inicio_contagem,
            dataFimContagem: proj.data_fim_contagem,
            squad,
            requisitos,
            funcoes
         };
      });

      return {
         id: emp.id,
         nome: emp.nome,
         valorPF: emp.valor_pf,
         hcpp: emp.hcpp,
         faseCiclo: emp.fase_ciclo,
         cargos,
         funcionarios,
         projetos
      };
   });

   return {
      empresas,
      empresaAtual: null,
      projetoAtual: null,
      lastModified: new Date().toISOString(),
      version: '1.4.0',
      tipo: 'db-export',
      totalEmpresas: empresas.length
   };
};

module.exports = {
   importBackupToDb,
   exportDbToBackup
};
