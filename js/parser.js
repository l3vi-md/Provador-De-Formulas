/* ============================================================
   PARSER (análise sintática)
   (equivalente a Parser.java)

   O parser transforma o TEXTO em uma ÁRVORE de objetos Formula.

   Ele usa a técnica de "descida recursiva" (recursive descent):
   cada operador tem sua própria função, e essas funções se chamam
   em cadeia respeitando a PRECEDÊNCIA dos operadores, da MENOR
   para a MAIOR prioridade:

       bicondicional  ( <-> )      <- processado por último (menor prioridade)
            |
       condicional    ( -> )
            |
       disjuncao      ( v )
            |
       conjuncao      ( ^ )
            |
       negacao        ( ~ )
            |
       primaria       ( letras e parênteses )   <- processado primeiro

   Ou seja: para entender uma fórmula, primeiro tentamos achar um
   "<->" no nível mais alto; para achar os dois lados desse "<->",
   primeiro tentamos achar um "->"; e assim por diante, até chegar
   nas proposições (letras) ou parênteses.

   Isso garante que "P v Q ^ R" seja lido como "P v (Q ^ R)",
   porque "^" tem prioridade maior que "v" (é processado antes,
   "mais fundo" na árvore de chamadas).
   ============================================================ */

import { Formula } from "./formula.js";

export class Parser {
  constructor() {
    this.texto = "";
    this.posicao = 0;
  }

  // Ponto de entrada: recebe o texto da fórmula e devolve a árvore Formula.
  parse(formula) {
    this.texto = formula.replace(/ /g, "");
    this.posicao = 0;

    const resultado = this.bicondicional();

    // Se sobrou texto sem ser consumido, tem algo errado
    // (ex: parênteses fechando demais, símbolo solto no fim).
    if (this.posicao !== this.texto.length) {
      throw new Error("Erro sintático na posição " + this.posicao);
    }

    return resultado;
  }

  // Nível 1 (menor precedência): P <-> Q <-> R  =>  ((P<->Q)<->R)
  bicondicional() {
    let esquerda = this.condicional();
    while (this.match("<->")) {
      const direita = this.condicional();
      esquerda = new Formula("<->", esquerda, direita);
    }
    return esquerda;
  }

  // Nível 2: P -> Q -> R  =>  ((P->Q)->R)
  condicional() {
    let esquerda = this.disjuncao();
    while (this.match("->")) {
      const direita = this.disjuncao();
      esquerda = new Formula("->", esquerda, direita);
    }
    return esquerda;
  }

  // Nível 3: P v Q v R  =>  ((PvQ)vR)
  disjuncao() {
    let esquerda = this.conjuncao();
    while (this.match("v")) {
      const direita = this.conjuncao();
      esquerda = new Formula("v", esquerda, direita);
    }
    return esquerda;
  }

  // Nível 4: P ^ Q ^ R  =>  ((P^Q)^R)
  conjuncao() {
    let esquerda = this.negacao();
    while (this.match("^")) {
      const direita = this.negacao();
      esquerda = new Formula("^", esquerda, direita);
    }
    return esquerda;
  }

  // Nível 5 (maior precedência entre os binários): ~P
  // É recursiva porque permite "~~P" (negação da negação).
  negacao() {
    if (this.match("~")) {
      const formula = this.negacao();
      return new Formula("~", formula);
    }
    return this.primaria();
  }

  // Nível 6 (base): uma letra maiúscula sozinha, ou "( ... )"
  // reiniciando todo o ciclo de precedência por dentro dos parênteses.
  primaria() {
    if (this.match("(")) {
      const formula = this.bicondicional();
      if (!this.match(")")) {
        throw new Error("Parêntese ')' esperado.");
      }
      return formula;
    }

    if (this.posicao < this.texto.length) {
      const c = this.texto[this.posicao];
      if (c >= "A" && c <= "Z") {
        this.posicao++;
        return new Formula(c); // folha: proposição simples
      }
    }

    throw new Error("Proposição esperada na posição " + this.posicao);
  }

  // Função auxiliar: se o texto, a partir da posição atual, começa
  // com "token", "consome" esse token (avança a posição) e retorna
  // true. Caso contrário, não mexe em nada e retorna false.
  match(token) {
    if (this.texto.startsWith(token, this.posicao)) {
      this.posicao += token.length;
      return true;
    }
    return false;
  }
}