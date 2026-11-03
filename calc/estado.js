/* ══════════════════════════════════════════════════════════════════════════
   O ESTADO COMPARTILHADO.

   ⚠️ ANTES AS TELAS NÃO CONVERSAVAM. Cada mockup era um HTML isolado com os
   valores dele; responder a notinha, os envelopes ou as taxas não mudava nada
   no resultado — ele sempre imprimia o exemplo. Para a pergunta «se fosse eu
   respondendo, chegaria no meu lucro?», a resposta era NÃO, e não por erro de
   fórmula: as respostas não chegavam lá.
   ══════════════════════════════════════════════════════════════════════════ */
const CHAVE = 'calcprec.v1';

/* ══════════════════════════════════════════════════════════════════════════
   ⚠️ NADA VEM PREENCHIDO.
   A calculadora abria com progressiva de R$ 250, duas profissionais e doze
   atendimentos por dia. Quem abrisse podia tomar aquilo pelo próprio número —
   ou nem notar que precisava trocar. Agora todo campo nasce vazio, com um
   exemplo em cinza dentro, e nenhum stepper começa com valor.
   ⚠️ `pessoas` nasce em ZERO: a calculadora não pode supor que ela tem equipe.
   ══════════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════════
   ⛔ 02/11 — DINHEIRO ERA LIDO DE DOIS JEITOS, E OS DOIS ERRAVAM.
   A tela 04 fazia `replace(',','.')` e nada mais: «1.200» virava **1,2** —
   um frasco de R$ 1.200 entrava como R$ 1,20 e o lucro subia por mil.
   A tela 07 fazia `replace(/\./g,'')` antes: «1200.50» virava **120050** —
   uma conta de R$ 1.200,50 entrava como R$ 120 mil e o lucro despencava.
   Medido nas duas, ao vivo, digitando como brasileira digita.

   Agora existe UM leitor, e ele é desconfiado: só trata o último separador
   como decimal se sobrarem 1 ou 2 dígitos depois dele. «1.200» é mil e
   duzentos; «1200.50» é mil e duzentos e cinquenta centavos; «1.200,00»
   também. Quem mexer aqui: mexa aqui, não na tela.
   ══════════════════════════════════════════════════════════════════════════ */
function dinheiro(v){
  const s = String(v == null ? '' : v).trim().replace(/[^\d.,]/g, '');
  if (!s) return null;
  const ult = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
  let x;
  if (ult < 0) x = parseFloat(s);
  else {
    const dec = s.slice(ult + 1);
    x = (dec.length === 1 || dec.length === 2)
      ? parseFloat(s.slice(0, ult).replace(/[.,]/g, '') + '.' + dec)
      : parseFloat(s.replace(/[.,]/g, ''));
  }
  return isFinite(x) ? x : null;
}

const BASE = {
  servico:  '',
  preco:    null,
  horas:    null,
  produtos: [{ nome:'', frasco:null, rende:null }],
  contas:   [{ nome:'', v:null }],   /* ⚠️ os nomes são dela: nada de aluguel/luz meus */
  /* ⛔ 02/11 — O CAMPO QUE FALTAVA. Sem ele o «lucro líquido» da tela era o
     salário dela somado ao lucro, e parecia 70% quando era 48%. */
  proLabore: null,
  taxaCartao:  null,
  taxaImposto: null,
  /* imposto fixo (MEI) em vez de percentual — ver tela 09 */
  impostoFixo: null,
  /* quantos atendimentos do mês são DESTE serviço (tela 08) */
  servicoSemana: null,
  /* a semana é do SALÃO quando há equipe e DELA quando trabalha sozinha */
  semana:   [0, 0, 0, 0, 0, 0, 0],
  pessoas:  0,
  respondeuPessoas: false,   /* zero é resposta — e resposta tem que ser dela */
  comissao: null,
  temEquipeHoje: false,
};

/* os exemplos que aparecem em cinza dentro do campo — nunca viram resposta */
const EXEMPLO = {
  servico:'Progressiva', preco:'250', horas:'3', comissao:'40',
  taxaCartao:'3,5', taxaImposto:'2',
  produto:{ nome:'Progressiva 1L', frasco:'240', rende:'10' },
  contas:{ 'Aluguel':'1.200', 'Luz + água':'280', 'Internet + telefone':'120',
           'Sistema / agenda':'97', 'Contador':'150' },
};

const EST = (() => {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    return Object.assign({}, BASE, salvo);
  } catch (e) { return Object.assign({}, BASE); }
})();

/* ⚠️ A DIVISÃO MORA AQUI, num lugar só, e roda TAMBÉM AO CARREGAR — não só ao
   salvar. Medido: com o estado zerado, `atend` nascia indefinido, o resultado
   imprimia «0 atendimentos» e os dois anéis davam −R$ 1.847 (só o aluguel).
   A semana vira o total do mês e, se há equipe, esse total se reparte
   igualmente entre ela e as profissionais. `atend` é sempre o que UMA pessoa
   atende — é o que o rateio do salão e o cenário com equipe esperam. */
function derivar(){
  if (!Array.isArray(EST.semana)) return;
  const porSemana = EST.semana.reduce((s, v) => s + (+v || 0), 0);
  EST.salaoMes = Math.round(porSemana * 4.33);
  const bocas = Math.max(1, Math.round(+EST.pessoas || 0) + 1);
  EST.atend = Math.round(EST.salaoMes / bocas);
  EST.atendPorProf = EST.atend;        /* divisão igual — é o que ela respondeu */
  EST.temEquipeHoje = bocas > 1;
  /* ⛔ 02/11 — QUANTOS DESSES SÃO O SERVIÇO QUE ELA ESTÁ CALCULANDO.
     A tela 08 pergunta o movimento do salão — todos os serviços. O mês
     multiplicava esse total pelo preço de UM serviço e inflava até 103% no
     salão misto. Agora o mês projeta só estes. Em branco = todos, que é o
     caso de quem só faz aquilo. */
  EST.servicoMes = (+EST.servicoSemana > 0)
    ? Math.min(Math.round(+EST.servicoSemana * 4.33), EST.salaoMes)
    : EST.salaoMes;
}

function salvar(campos){
  Object.assign(EST, campos || {});
  derivar();
  try { localStorage.setItem(CHAVE, JSON.stringify(EST)); } catch (e) {}
  return EST;
}

derivar();   /* ⚠️ sem isto o estado recém-criado não tem `atend` */

/* zera tudo — usado pelo botão «refazer o cálculo» */
function limpar(){
  try { localStorage.removeItem(CHAVE); } catch (e) {}
}
