import { Projeto, Empresa } from '../types';

export const calcularMetricasSquad = (projetoAtualObj: Projeto | null, empresaAtualObj: Empresa | null, totals: any) => {
    const squadAtual = projetoAtualObj?.squad || [];
    const funcionariosEmpresa = empresaAtualObj?.funcionarios || [];
    const cargosEmpresa = empresaAtualObj?.cargos || [];

    const totalPFs = parseFloat(totals?.totalPF || 0);
    const hcppPadrao = parseFloat(totals?.hcpp || empresaAtualObj?.hcpp || 8.0);
    const esforcoTotal = totalPFs * hcppPadrao;

    let capacidadeDiariaSquad = 0;
    let membrosDetalhados: any[] = [];

    squadAtual.forEach((sq: any) => {
        const funcionario = funcionariosEmpresa.find((f: any) => f.id === sq.funcionarioId);
        if (!funcionario) return;

        let fatorFunc: any = funcionario.fatorIndividualPF;
        if (!fatorFunc || parseFloat(fatorFunc) <= 0) {
            const cargo = cargosEmpresa.find((c: any) => c.id === funcionario.cargoId);
            if (cargo && parseFloat(cargo.fatorPF as any) > 0) {
                fatorFunc = cargo.fatorPF;
            }
        }
        if (!fatorFunc || parseFloat(fatorFunc) <= 0) {
            fatorFunc = hcppPadrao;
        }

        const fatorIndividual = parseFloat(fatorFunc);
        const multiplicadorCapacidade = hcppPadrao / fatorIndividual;
        const dedicacao = sq.dedicacao || 100;
        const horasEntregues = multiplicadorCapacidade * 8 * (dedicacao / 100);

        capacidadeDiariaSquad += horasEntregues;

        membrosDetalhados.push({
            id: funcionario.id,
            nome: funcionario.nome,
            cargoNome: cargosEmpresa.find((c: any) => c.id === funcionario.cargoId)?.titulo || 'Sem Cargo',
            fatorIndividual,
            multiplicadorCapacidade,
            dedicacao: dedicacao,
            horasEntregues
        });
    });

    let prazoDiasUteis = 0;
    if (capacidadeDiariaSquad > 0) {
        prazoDiasUteis = (esforcoTotal > 0) ? (esforcoTotal / capacidadeDiariaSquad) : 0;
    } else {
        capacidadeDiariaSquad = 8;
        prazoDiasUteis = (esforcoTotal > 0) ? (esforcoTotal / capacidadeDiariaSquad) : 0;
    }

    let previsaoEntrega: string | null = null;
    const diasArredondados = Math.ceil(prazoDiasUteis);

    // Casting as any because dataInicioProjeto might be a legacy field not on the interface
    if ((projetoAtualObj as any)?.dataInicioProjeto && diasArredondados > 0) {
        let diasAdicionados = 0;
        let dataAtual = new Date((projetoAtualObj as any).dataInicioProjeto + 'T00:00:00');

        while (diasAdicionados < diasArredondados) {
            dataAtual.setDate(dataAtual.getDate() + 1);
            const diaSemana = dataAtual.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
                diasAdicionados++;
            }
        }
        previsaoEntrega = dataAtual.toLocaleDateString('pt-BR');
    }

    return {
        membros: membrosDetalhados,
        esforcoTotal,
        hcppPadrao,
        capacidadeDiariaSquad,
        prazoDiasUteis,
        previsaoEntrega
    };
};
