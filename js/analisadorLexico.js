/* ============================================================
   ANALISADOR LÉXICO
   (equivalente a AnalisadorLexico.java)

   Função: percorrer a string caractere por caractere e garantir
   que só existam símbolos que o provador reconhece:

     - letras MAIÚSCULAS (proposições: P, Q, R...)
     - parênteses ( )
     - operadores: ~  ^  v  ->  <->

   Se encontrar qualquer outro símbolo, a fórmula é rejeitada
   aqui mesmo, ANTES de tentar entender sua estrutura (isso evita
   que o parser tenha que lidar com "lixo" no meio do texto).
   ============================================================ */

export const AnalisadorLexico = {

  // Guarda a última mensagem de erro encontrada, para a
  // interface poder exibi-la na tela.
  ultimoErro: "",

  validar(formulaOriginal) {
    // Assim como no Java, removemos espaços antes de tudo.
    const formula = formulaOriginal.replace(/ /g, "");

    for (let i = 0; i < formula.length; i++) {
      const c = formula[i];

      // Letra maiúscula (A-Z) ou símbolos "de um caractere só"
      const ehLetraMaiuscula = c >= "A" && c <= "Z";
      if (
        ehLetraMaiuscula ||
        c === "(" ||
        c === ")" ||
        c === "~" ||
        c === "^" ||
        c === "v"
      ) {
        continue; // caractere válido, segue para o próximo
      }

      // operador "->"  (precisa checar os 2 caracteres juntos)
      if (c === "-" && i + 1 < formula.length && formula[i + 1] === ">") {
        i++; // já consumimos o ">" também, pula 1 posição extra
        continue;
      }

      // operador "<->" (precisa checar os 3 caracteres juntos)
      if (
        c === "<" &&
        i + 2 < formula.length &&
        formula[i + 1] === "-" &&
        formula[i + 2] === ">"
      ) {
        i += 2; // consumimos "-" e ">" também
        continue;
      }

      // Se chegou até aqui, o caractere não é reconhecido.
      this.ultimoErro = `Símbolo inválido encontrado: "${c}"`;
      return false;
    }

    return true; // passou por tudo sem achar símbolo estranho
  },
};