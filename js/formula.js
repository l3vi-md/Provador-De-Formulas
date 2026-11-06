/* ============================================================
   CLASSE FORMULA
   (equivalente a Formula.java)

   Uma fórmula lógica é representada como uma ÁRVORE:

     - Um "nó folha" é uma proposição simples, tipo "P".
     - Um "nó interno" tem um operador (~, ^, v, ->, <->) e um ou
       dois "filhos", que são, por sua vez, outras Formulas.

   Exemplos:
     "P"        -> folha: proposicao = "P"
     "~P"       -> operador "~", esquerda = folha "P"  (sem direita)
     "P ^ Q"    -> operador "^", esquerda = "P", direita = "Q"
     "(P^Q)->R" -> operador "->",
                     esquerda = (operador "^", esq="P", dir="Q"),
                     direita  = folha "R"

   Essa estrutura em árvore é o que permite avaliar fórmulas
   complexas: a gente resolve os filhos primeiro (recursivamente)
   e depois combina os resultados com o operador do nó.
   ============================================================ */

export class Formula {

  // No Java existiam 3 construtores diferentes (sobrecarga):
  //   Formula(proposicao)
  //   Formula(operador, esquerda)
  //   Formula(operador, esquerda, direita)
  // Em JS não existe sobrecarga de construtor, então usamos
  // parâmetros opcionais para imitar os 3 casos.
  constructor(operadorOuProposicao, esquerda = null, direita = null) {
    if (esquerda === null) {
      // Construtor "folha": Formula("P") -> proposição simples
      this.proposicao = operadorOuProposicao;
      this.operador = null;
    } else {
      // Construtor "nó": Formula("^", esq, dir) ou Formula("~", esq)
      this.operador = operadorOuProposicao;
      this.proposicao = null;
    }
    this.esquerda = esquerda;
    this.direita = direita;
  }

  // Uma folha (proposição) não tem operador nem filhos.
  ehProposicao() {
    return this.proposicao !== null;
  }

  // Reconstrói o texto da fórmula a partir da árvore (útil para
  // mostrar de volta pro usuário, já formatada com parênteses).
  // Equivale ao @Override toString() do Java.
  toString() {
    if (this.ehProposicao()) {
      return this.proposicao;
    }
    if (this.operador === "~") {
      return "~" + this.esquerda.toString();
    }
    return "(" + this.esquerda.toString() + " " + this.operador + " " + this.direita.toString() + ")";
  }
}