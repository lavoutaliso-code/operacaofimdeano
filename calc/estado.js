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
const BASE = {
  servico:  '',
  preco:    null,
  horas:    null,
  produtos: [{ nome:'', frasco:null, rende:null }],
  contas:   [{ nome:'', v:null }],   /* ⚠️ os nomes são dela: nada de aluguel/luz meus */
  taxaCartao:  null,
  taxaImposto: null,
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
