import { describe, it, expect } from 'vitest';
import { calcularPF, classificarFuncao, getCampoReferenciaLabel } from './ifpugCalculator';

describe('ifpugCalculator', () => {
  describe('calcularPF', () => {
    it('deve calcular ALI corretamente para complexidade Baixa', () => {
      // ALI, Baixa: TR=1, TD=1-19 -> PF = 7
      const result = calcularPF('ALI', 15, 1);
      expect(result.pf).toBe(7);
      expect(result.complexidade).toBe('Baixa');
    });

    it('deve calcular EE corretamente para complexidade Alta', () => {
      // EE, Alta: AR=3, TD=16+ -> PF = 6
      const result = calcularPF('EE', 20, 3);
      expect(result.pf).toBe(6);
      expect(result.complexidade).toBe('Alta');
    });

    it('deve converter tipos em inglês para português (EI -> EE)', () => {
      const result = calcularPF('EI', 20, 3);
      expect(result.tipoPT).toBe('EE');
      expect(result.pf).toBe(6);
    });

    it('deve retornar PF 3 para tipo desconhecido', () => {
      const result = calcularPF('TIPO_INVALIDO', 10, 2);
      expect(result.pf).toBe(3);
    });
  });

  describe('classificarFuncao', () => {
    it('deve classificar ALI e AIE como dados', () => {
      expect(classificarFuncao('ALI')).toBe('dados');
      expect(classificarFuncao('AIE')).toBe('dados');
      expect(classificarFuncao('ILF')).toBe('dados');
    });

    it('deve classificar EE, SE, CE como transacao', () => {
      expect(classificarFuncao('EE')).toBe('transacao');
      expect(classificarFuncao('SE')).toBe('transacao');
      expect(classificarFuncao('EI')).toBe('transacao');
    });
  });

  describe('getCampoReferenciaLabel', () => {
    it('deve retornar TR para ALI', () => {
      const result = getCampoReferenciaLabel('ALI');
      expect(result.label).toContain('TR');
    });

    it('deve retornar AR para EE', () => {
      const result = getCampoReferenciaLabel('EE');
      expect(result.label).toContain('AR');
    });
  });
});
