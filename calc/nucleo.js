/* Núcleo da calculadora. 9 perguntas, dois cenários: sozinha e com equipe. */

const PADRAO = {
  servico:  'Progressiva',
  preco:    250,    // quanto cobra pelo serviço
  horas:    3,      // quanto tempo leva
  produto:  38,     // produto gasto no serviço
  contaMes: 1847,   // o salão custa isso por mês, com ou sem equipe
  atend:    87,     // atendimentos no mês — média da semana x 4,33, da tabela da tela 06
  taxas:    5.5,    // cartão + imposto
  pessoas:  2,      // profissionais na equipe, além dela
  comissao: 40,     // % que cada profissional leva
};

const PERGUNTAS = [
  { k:'preco',    tit:'Quanto você cobra?',            sub:'O preço que a cliente paga hoje por esse serviço.',
    sinal:'R$', suf:'',  passo:10,  rot:'Preço cobrado' },
  { k:'horas',    tit:'Quanto tempo leva?',            sub:'De ponta a ponta: lavagem, espera e escova.',
    sinal:'',   suf:'h', passo:0.5, rot:'Tempo do serviço', dec:1 },
  { k:'produto',  tit:'Quanto gasta de produto?',      sub:'Só o que vai no cabelo da cliente.',
    sinal:'R$', suf:'',  passo:5,   rot:'Produto' },
  { k:'hora',     tit:'Quanto quer ganhar por hora?',  sub:'O seu salário. Sem ele, o lucro é mentira.',
    sinal:'R$', suf:'',  passo:5,   rot:'Sua hora' },
  { k:'contaMes', tit:'Quanto custa o salão por mês?', sub:'Aluguel, luz, internet, sistema, contador.',
    sinal:'R$', suf:'',  passo:50,  rot:'Salão por mês' },
  { k:'atend',    tit:'Quantos atendimentos no mês?',  sub:'A média de uma pessoa, não do salão inteiro.',
    sinal:'',   suf:'',  passo:1,   rot:'Atendimentos/mês' },
  { k:'taxas',    tit:'Cartão + imposto, somados?',    sub:'O que sai de cada venda antes de chegar em você.',
    sinal:'',   suf:'%', passo:0.5, rot:'Cartão + imposto', dec:1 },
  { k:'pessoas',  tit:'Quantas profissionais além de você?', sub:'Zero se você trabalha sozinha hoje.',
    sinal:'',   suf:'',  passo:1,   rot:'Profissionais' },
  { k:'comissao', tit:'Quanto de comissão elas levam?', sub:'A porcentagem que fica com a profissional.',
    sinal:'',   suf:'%', passo:5,   rot:'Comissão' },
];

const n = v => {
  const x = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return isFinite(x) ? x : 0;
};

function conta(d) {
  /* ⚠️ produto, contas e taxas vêm das LISTAS respondidas quando existirem —
     os campos soltos (d.produto, d.contaMes, d.taxas) são só o atalho do
     exemplo. Se os dois caminhos divergirem, o extrato e o mês divergem. */
  const x0 = extrato(d);
  const preco = n(d.preco), horas = n(d.horas);
  const produto = d.produtos ? x0.tProduto : n(d.produto);
  const atend = n(d.atend);
  const fixoMes = d.contas ? d.contas.reduce((s, c) => s + n(c.v), 0) : n(d.contaMes);
  const pTaxa = (d.taxaCartao != null || d.taxaImposto != null)
    ? (n(d.taxaCartao || 0) + n(d.taxaImposto || 0)) / 100
    : n(d.taxas) / 100;
  const pCom = n(d.comissao) / 100;
  const pessoas = Math.max(0, Math.round(n(d.pessoas)));

  const taxa = preco * pTaxa;
  const fixo = atend > 0 ? fixoMes / atend : 0; // rateio por atendimento

  /* --- por serviço feito pelas mãos dela ---
     ⚠️ SEM DESCONTAR O TRABALHO DELA (ela tirou essa pergunta). Então este
     número é tudo o que sobra para ela: o pagamento do próprio trabalho E o
     lucro, juntos. Não é «lucro além do salário». */
  const custo = produto + fixo + taxa;
  const lucro = preco - custo;
  const minimo = pTaxa < .99 ? (produto + fixo) / (1 - pTaxa) : null;

  /* --- no mês: sozinha --- */
  const soFat    = preco * atend;
  const soVar    = (produto + taxa) * atend;
  const soLiquido = soFat - soVar - fixoMes;

  /* --- no mês: com equipe (mesmo aluguel, mais cadeiras girando) --- */
  const comissao = preco * pCom;
  /* ⚠️ ANTES A EQUIPE FAZIA SEMPRE O MESMO TANTO QUE ELA. A média respondida na
     tela 07 é a DELA; supor que cada profissional repete isso inflava o cenário
     com equipe sem nunca ter sido perguntado. Agora dá para responder. */
  const atendProf = d.atendPorProf != null ? n(d.atendPorProf) : atend;
  const eqServ   = atendProf * pessoas;
  const eqFat    = preco * (atend + eqServ);
  const eqVar    = (produto + taxa) * atend
                 + (produto + taxa + comissao) * eqServ;
  const eqLiquido = eqFat - eqVar - fixoMes;

  /* ══════════════════════════════════════════════════════════════════════
     OS DOIS CENÁRIOS SÃO «HOJE» E «O PRÓXIMO DEGRAU».
     Antes eram fixos (sozinha × com equipe). Mas quem já tem duas profissionais
     não precisa ver quanto faria sozinha — precisa ver quanto faria com quatro.
     Regra: sem equipe → o degrau é 2; com equipe → dobra o que ela tem.
     ⚠️ A comissão do degrau futuro é a mesma que ela respondeu; quem está
     sozinha responde «quanto pagaria», senão a equipe futura sairia de graça.
     ══════════════════════════════════════════════════════════════════════ */
  const mesCom = p => {
    const serv = atend * (1 + p);
    const fatM = preco * serv;
    const varM = (produto + taxa) * atend
               + (produto + taxa + preco * pCom) * (atend * p);
    return { pessoas: p, serv, fat: fatM, custo: varM + fixoMes,
             liquido: fatM - varM - fixoMes };
  };
  const hoje    = mesCom(pessoas);
  const degrau  = pessoas === 0 ? 2 : pessoas * 2;
  const proximo = mesCom(degrau);

  return {
    preco, horas, produto, fixo, taxa, custo, lucro, minimo,
    hoje, proximo, degrau, mesCom,
    margem: preco > 0 ? lucro / preco : 0,
    porHora: horas > 0 ? lucro / horas : 0,
    paga: lucro < 0,
    atend, pessoas, comissao, semVolume: atend <= 0,
    atendProf, temEquipeHoje: !!d.temEquipeHoje,
    so:  { fat: soFat, custo: soVar + fixoMes, liquido: soLiquido, serv: atend },
    eq:  { fat: eqFat, custo: eqVar + fixoMes, liquido: eqLiquido, serv: atend + eqServ },
    ganho: eqLiquido - soLiquido,
    fixoPorServicoEquipe: (atend + eqServ) > 0 ? fixoMes / (atend + eqServ) : 0,
  };
}

const R$ = v => (v == null || !isFinite(v)) ? '—'
  : v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const R$0 = v => (v == null || !isFinite(v)) ? '—'
  : v.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });
const pc = v => (v == null || !isFinite(v)) ? '—'
  : (v * 100).toFixed(1).replace('.', ',') + '%';
const nf = v => Number(v).toLocaleString('pt-BR');

/* data do recibo — fixa no mockup para o print não mudar a cada volta */
/* ⚠️ a data era chumbada em 01 NOV 2026 — o cupom mentia no dia seguinte */
const HOJE = (() => {
  const M = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  const d = new Date();
  return String(d.getDate()).padStart(2,'0') + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
})();

/* ══════════════════════════════════════════════════════════════════════════
   O VEREDITO DA PRECIFICAÇÃO — não é «caixa conferido», é se o preço está certo.

   ⚠️ A RÉGUA AINDA NÃO TEM FONTE. Estas faixas de margem são um ponto de
      partida, não uma norma: não existe órgão que fixe margem de salão no
      Brasil. Enquanto a referência não for escolhida (SEBRAE, sindicato, ou a
      régua que ela mesma usar), a tela diz de onde o número veio.
   ⚠️ O QUE NÃO DEPENDE DE RÉGUA NENHUMA é o prejuízo: se o preço não paga
      produto + o trabalho dela + o rateio do salão + as taxas, está errado, e
      isso é medido, não opinado.
   ══════════════════════════════════════════════════════════════════════════ */
/* ⚠️ A FAIXA SUBIU porque a base mudou: sem descontar o trabalho dela, a
   margem de qualquer serviço sobe junto. Continua sem fonte. */
const REGUA = { limite: 0.35, apertado: 0.55, fonte: 'faixa a definir' };

function veredito(r){
  if (r.semVolume) return {
    nivel: 'semdados', cor: '#A96808', icone: '!',
    titulo: 'Falta dizer quantos atendimentos',
    frase: 'Sem volume não dá para dividir o custo do salão — e sem isso o lucro '
         + 'por serviço aparece maior do que é.',
  };
  if (r.paga) return {
    nivel: 'errado', cor: '#BC3D20', icone: 'x',
    titulo: 'Sua precificação está errada',
    frase: `Cada atendimento tira ${R$(Math.abs(r.lucro))} do seu bolso. `
         + `O mínimo para não trabalhar de graça é ${R$(r.minimo)}.`,
  };
  if (r.margem < REGUA.limite) return {
    nivel: 'limite', cor: '#A96808', icone: '!',
    titulo: 'Sua precificação está no limite',
    frase: `Sobram só ${pc(r.margem)} do preço. Um produto que subir já come o lucro.`,
  };
  if (r.margem < REGUA.apertado) return {
    nivel: 'apertado', cor: '#A96808', icone: '!',
    titulo: 'Sua precificação está apertada',
    frase: `${pc(r.margem)} sobram. Paga as contas, mas não dá para repor equipamento.`,
  };
  return {
    nivel: 'certo', cor: '#12885C', icone: 'check',
    titulo: 'Sua precificação está correta',
    frase: `${pc(r.margem)} do preço sobram para você — acima dos ${pc(REGUA.apertado)} `
         + `que estamos usando como referência.`,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   INDICADORES DA NOTA — todos derivados dos 8 números que ela respondeu.
   Nenhum vem de fora; nenhum é estimado.
   ══════════════════════════════════════════════════════════════════════════ */
function indicadores(d){
  const r = conta(d);
  const preco = r.preco;
  const margemContrib = preco - r.produto - r.taxa;        // sobra antes do salão
  return {
    ...r,
    /* quanto cada parcela pesa no preço */
    pProduto: preco ? r.produto / preco : 0,
    pSalao:   preco ? r.fixo / preco : 0,
    pTaxa:    preco ? r.taxa / preco : 0,
    pSobra:   preco ? r.lucro / preco : 0,
    custoTotal: r.produto + r.fixo + r.taxa,
    /* o que cada hora de cadeira rende, já limpa */
    porHoraCadeira: r.horas > 0 ? r.lucro / r.horas : 0,
    /* ponto de equilíbrio: quantos atendimentos só para pagar o salão */
    margemContrib,
    equilibrio: margemContrib > 0 ? Math.ceil(n(d.contaMes) / margemContrib) : null,
    /* quanto sobraria se ela cobrasse o preço mínimo e o preço-alvo */
    cenario(p){
      const taxa = p * (n(d.taxas)/100);
      return p - r.produto - r.fixo - taxa;
    },
  };
}

/* número do documento, estável para o mesmo cálculo */
function numeroDoc(r){
  const s = String(Math.round(r.lucro * 100)).padStart(6,'0');
  return '2026-1101-' + s.slice(-6);
}

/* ══════════════════════════════════════════════════════════════════════════
   O EXTRATO — o preço dela aberto linha por linha.
   Cada item vem de uma resposta: os produtos da notinha (tela 03), as contas
   dos envelopes (tela 05) e as duas taxas (tela 07). Nada é estimado.

   ⚠️ O TOTAL É A SOMA DO QUE ESTÁ NA TELA, não a conta "exata" por trás.
      Se eu arredondo cada parcela para centavos e somo o valor cheio, a tela
      mostra parcelas que não fecham com o total — e aí ela não consegue
      conferir. Aqui o subtotal é a soma das parcelas já arredondadas.
   ══════════════════════════════════════════════════════════════════════════ */
const PRODUTOS = [
  { nome:'Progressiva 1L',          frasco:240, rende:10  },
  { nome:'Shampoo + condicionador', frasco:90,  rende:12  },
  { nome:'Máscara de nutrição',     frasco:120, rende:20  },
  { nome:'Luva, papel e touca',     frasco:50,  rende:100 },
];
const CONTAS = [
  { nome:'Aluguel',             v:1200 },
  { nome:'Luz + água',          v:280  },
  { nome:'Internet + telefone', v:120  },
  { nome:'Sistema / agenda',    v:97   },
  { nome:'Contador',            v:150  },
];
const TAXAS = [
  { nome:'Taxa da maquininha', pct:3.5 },
  { nome:'Imposto',            pct:2   },
];

const cent = v => Math.round(v * 100) / 100;

/* ══════════════════════════════════════════════════════════════════════════
   ⚠️ O EXTRATO LÊ AS RESPOSTAS, NÃO AS CONSTANTES. Antes PRODUTOS, CONTAS e
   TAXAS eram fixos aqui: mexer na notinha (tela 04), nos envelopes (06) ou nas
   taxas (08) mudava o número do MÊS e não mudava o do SERVIÇO — o carimbo e o
   mês discordavam entre si. Medido: taxa de 5,5% → 12% deixava o lucro por
   serviço parado em R$ 177,03 enquanto o mês caía de 15.401 para 13.987.
   ══════════════════════════════════════════════════════════════════════════ */
function extrato(d){
  const preco = n(d.preco), atend = n(d.atend);
  const _produtos = d.produtos || PRODUTOS;
  const _contas   = d.contas   || CONTAS;
  const _taxas    = d.taxasLista || [
    { nome:'Taxa da maquininha', pct: d.taxaCartao  != null ? n(d.taxaCartao)  : 3.5 },
    { nome:'Imposto',            pct: d.taxaImposto != null ? n(d.taxaImposto) : 2   },
  ];

  const produtos = _produtos.map(p => ({
    nome: p.nome, detalhe: R$0(n(p.frasco)) + ' ÷ ' + n(p.rende) + ' usos',
    v: cent(n(p.rende) > 0 ? n(p.frasco) / n(p.rende) : 0),
  }));
  const salao = _contas.map(c => ({
    nome: c.nome, detalhe: R$0(n(c.v)) + ' ÷ ' + atend,
    v: cent(atend > 0 ? n(c.v) / atend : 0),
  }));
  const taxas = _taxas.map(t => ({
    nome: t.nome, detalhe: String(n(t.pct)).replace('.', ',') + '% de ' + R$0(preco),
    v: cent(preco * n(t.pct) / 100),
  }));

  const soma = a => cent(a.reduce((s, x) => s + x.v, 0));
  const tProduto = soma(produtos), tSalao = soma(salao), tTaxas = soma(taxas);
  const sobra = cent(preco - tProduto - tSalao - tTaxas);

  return {
    preco, atend, produtos, salao, taxas,
    /* ⚠️ sem volume não existe rateio, e sem rateio o lucro por serviço SOBE —
       medido: 0 atendimentos devolvia R$ 198,25 contra R$ 177,03 com 87.
       Quem consome precisa saber que o número não vale. */
    semVolume: atend <= 0,
    /* ⚠️ «rateio» é jargão de contador. Na tela, custo fixo por atendimento. */
    titulos: ['Produto por atendimento', 'Custo fixo por atendimento', 'Taxas sobre a venda'],
    tProduto, tSalao, tTaxas, sobra,
    custo: cent(tProduto + tSalao + tTaxas),
    margem: preco ? sobra / preco : 0,
  };
}
