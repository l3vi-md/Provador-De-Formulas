/* ============================================================
   MAIN.JS
   (equivalente a Main.java)

   No Java, o main() era quem:
     1. lia o texto digitado (Scanner)
     2. chamava AnalisadorLexico.validar()
     3. chamava Parser.parse()
     4. chamava TabelaVerdade.analisar()
     5. imprimia tudo no console (System.out.println)

   Aqui, em vez de ler do teclado com Scanner, lemos do <input>;
   em vez de imprimir no console, desenhamos HTML na tela.
   O FLUXO de chamadas é o mesmo, só troca "console" por "página".

   No topo, importamos cada módulo, exatamente como o Main.java
   "enxergava" as outras classes por estarem no mesmo projeto.
   ============================================================ */

import { AnalisadorLexico } from "./analisadorLexico.js";
import { Parser } from "./parser.js";
import { TabelaVerdade } from "./tabelaVerdade.js";

// -------------------- Referências aos elementos do HTML --------------------
const inputFormula = document.getElementById("formulaInput");
const areaErro = document.getElementById("areaErro");
const areaResultado = document.getElementById("areaResultado");
const formulaFormatada = document.getElementById("formulaFormatada");
const areaTabela = document.getElementById("areaTabela");
const areaClassificacao = document.getElementById("areaClassificacao");

function mostrarErro(mensagem) {
  areaErro.innerHTML = `<div class="erro">⚠ ${mensagem}</div>`;
  areaResultado.style.display = "none";
}

function limparErro() {
  areaErro.innerHTML = "";
}

// Desenha a tabela HTML a partir dos dados gerados por TabelaVerdade.gerar()
function renderizarTabela(formula, dados) {
  const { proposicoes, linhasTabela, classificacao } = dados;

  // Cabeçalho: uma coluna por proposição + coluna final da fórmula
  let html = "<table><thead><tr>";
  proposicoes.forEach((p) => (html += `<th>${p}</th>`));
  html += `<th class="coluna-final">${formula.toString()}</th>`;
  html += "</tr></thead><tbody>";

  // Uma linha <tr> por combinação de valores
  linhasTabela.forEach((linha) => {
    html += "<tr>";
    linha.valores.forEach((v) => {
      const letra = v ? "V" : "F";
      html += `<td class="valor-${letra}">${letra}</td>`;
    });
    const letraFinal = linha.resultado ? "V" : "F";
    html += `<td class="coluna-final valor-${letraFinal}">${letraFinal}</td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  areaTabela.innerHTML = html;

  // Classificação final (tautologia / contradição / contingência)
  const classeCss =
    classificacao === "TAUTOLOGIA"
      ? "tautologia"
      : classificacao === "CONTRADIÇÃO"
      ? "contradicao"
      : "contingencia";

  areaClassificacao.innerHTML = `<div class="classificacao ${classeCss}">Classificação: ${classificacao}</div>`;
}

// Função principal, chamada quando o usuário clica em "Calcular".
// Equivale, na prática, ao corpo do main() do Java.
function calcular() {
  limparErro();
  areaResultado.style.display = "none";

  const texto = inputFormula.value.trim();

  if (texto === "") {
    mostrarErro("Digite uma fórmula antes de calcular.");
    return;
  }

  // ETAPA I - Análise léxica (igual ao Main.java)
  if (!AnalisadorLexico.validar(texto)) {
    mostrarErro("Fórmula lexicalmente inválida. " + AnalisadorLexico.ultimoErro);
    return;
  }

  let formula;

  // ETAPA II - Análise sintática (igual ao Main.java)
  try {
    const parser = new Parser();
    formula = parser.parse(texto);
  } catch (erro) {
    mostrarErro("Erro sintático: " + erro.message);
    return;
  }

  // ETAPA III - Geração e exibição da tabela verdade
  const dados = TabelaVerdade.gerar(formula);

  formulaFormatada.textContent = "Fórmula: " + formula.toString();
  renderizarTabela(formula, dados);

  areaResultado.style.display = "block";
}

// -------------------- Eventos da página --------------------

document.getElementById("btnCalcular").addEventListener("click", calcular);

inputFormula.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") calcular();
});

document.getElementById("btnLimpar").addEventListener("click", () => {
  inputFormula.value = "";
  limparErro();
  areaResultado.style.display = "none";
  inputFormula.focus();
});

// Botões de atalho (~, ^, v, ->, <->, parênteses) inserem o símbolo
// na posição do cursor dentro do campo de texto.
document.querySelectorAll("[data-inserir]").forEach((botao) => {
  botao.addEventListener("click", () => {
    const simbolo = botao.getAttribute("data-inserir");
    const inicio = inputFormula.selectionStart ?? inputFormula.value.length;
    const fim = inputFormula.selectionEnd ?? inputFormula.value.length;
    const valorAtual = inputFormula.value;

    inputFormula.value = valorAtual.slice(0, inicio) + simbolo + valorAtual.slice(fim);

    const novaPosicao = inicio + simbolo.length;
    inputFormula.focus();
    inputFormula.setSelectionRange(novaPosicao, novaPosicao);
  });
});