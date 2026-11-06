/* ============================================================
   TABELA VERDADE (avaliação da fórmula)
   (equivalente a TabelaVerdade.java)

   Depois que temos a árvore (Formula), o trabalho é:

     a) Descobrir quais proposições (letras) aparecem na fórmula.
        Ex: "(P^Q)->R" usa as letras P, Q, R.

     b) Se existem N letras diferentes, existem 2^N combinações
        possíveis de Verdadeiro/Falso para elas. Percorremos TODAS.

     c) Para cada combinação, avaliamos a árvore recursivamente:
        - se o nó é uma proposição, olhamos o valor V/F dela nessa linha
        - se o nó tem operador, avaliamos esquerda e direita primeiro
          e combinamos o resultado (é aqui que a recursão da árvore
          "sobe" o resultado até a raiz)

     d) No final, se todas as linhas deram Verdadeiro -> TAUTOLOGIA
        Se todas deram Falso -> CONTRADIÇÃO
        Caso contrário -> CONTINGÊNCIA

   Diferença em relação ao Java: lá, essa classe também IMPRIMIA a
   tabela no console (System.out.println). Aqui separamos isso:
   este módulo só CALCULA os dados; quem desenha na tela é o main.js
   (isso deixa a lógica reaproveitável, sem depender do HTML).
   ============================================================ */

export const TabelaVerdade = {

  // Percorre a árvore coletando os NOMES das proposições usadas
  // (usa um Set para não repetir, depois ordenamos alfabeticamente,
  // igual ao TreeSet do Java).
  coletarProposicoes(formula, conjunto) {
    if (formula.ehProposicao()) {
      conjunto.add(formula.proposicao);
      return;
    }
    if (formula.esquerda) this.coletarProposicoes(formula.esquerda, conjunto);
    if (formula.direita) this.coletarProposicoes(formula.direita, conjunto);
  },

  // Avalia a árvore para uma combinação específica de valores V/F,
  // recebida no objeto `valores` (ex: { P: true, Q: false }).
  avaliar(formula, valores) {
    if (formula.ehProposicao()) {
      return valores[formula.proposicao];
    }

    switch (formula.operador) {
      case "~":
        return !this.avaliar(formula.esquerda, valores);

      case "^":
        return this.avaliar(formula.esquerda, valores) && this.avaliar(formula.direita, valores);

      case "v":
        return this.avaliar(formula.esquerda, valores) || this.avaliar(formula.direita, valores);

      case "->": {
        // P -> Q só é FALSO quando P é verdadeiro e Q é falso.
        // Equivale logicamente a "!P || Q".
        const esquerda = this.avaliar(formula.esquerda, valores);
        const direita = this.avaliar(formula.direita, valores);
        return !esquerda || direita;
      }

      case "<->":
        // P <-> Q é verdadeiro quando os dois lados têm o MESMO valor.
        return this.avaliar(formula.esquerda, valores) === this.avaliar(formula.direita, valores);

      default:
        throw new Error("Operador desconhecido: " + formula.operador);
    }
  },

  // Monta toda a estrutura de dados da tabela verdade:
  // lista de proposições, e uma linha por combinação, com os
  // valores de entrada + o resultado final da fórmula.
  gerar(formula) {
    const conjunto = new Set();
    this.coletarProposicoes(formula, conjunto);

    // Ordena alfabeticamente, igual ao TreeSet do Java
    const proposicoes = Array.from(conjunto).sort();

    const quantidade = proposicoes.length;
    const linhas = Math.pow(2, quantidade);

    let todasVerdadeiras = true;
    let todasFalsas = true;

    const linhasTabela = [];

    // Mesma técnica do Java: usamos os bits do número `i` para
    // gerar todas as combinações de V/F. Se quantidade = 2,
    // i vai de 0 a 3 (00, 01, 10, 11 em binário) e cada bit vira
    // o valor V/F de uma proposição.
    for (let i = 0; i < linhas; i++) {
      const valores = {};
      const linhaValores = [];

      for (let j = 0; j < quantidade; j++) {
        const valor = ((i >> (quantidade - j - 1)) & 1) === 1;
        valores[proposicoes[j]] = valor;
        linhaValores.push(valor);
      }

      const resultado = this.avaliar(formula, valores);

      if (!resultado) todasVerdadeiras = false;
      if (resultado) todasFalsas = false;

      linhasTabela.push({ valores: linhaValores, resultado });
    }

    let classificacao;
    if (todasVerdadeiras) classificacao = "TAUTOLOGIA";
    else if (todasFalsas) classificacao = "CONTRADIÇÃO";
    else classificacao = "CONTINGÊNCIA";

    return { proposicoes, linhasTabela, classificacao };
  },
};