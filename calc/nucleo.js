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
  /* ⛔ 02/11 — esta pergunta existia aqui e NÃO existia no app: `BASE` não
     tinha o campo e `conta()` não descontava nada. Era a pergunta fantasma que
     fazia o «lucro líquido» da tela ser salário + lucro somados. Agora é
     `proLabore`, por MÊS (que é o número que a dona de salão sabe de cabeça;
     por hora ela não sabe), e ele entra na conta pelo rateio das contas. */
  { k:'proLabore', tit:'Quanto você quer ganhar por mês?',
    sub:'O seu salário. Sem ele na conta, o lucro é mentira.',
    sinal:'R$', suf:'',  passo:100, rot:'Seu salário' },
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
  /* ══════════════════════════════════════════════════════════════════════
     ⛔ 02/11 — AQUI MORAVA UMA SEGUNDA CONTA DO MESMO SERVIÇO.

     `conta()` recalculava produto, rateio e taxa por conta própria, e o rateio
     dela dividia as contas do salão por `atend` — o que UMA pessoa atende — em
     vez de por todos os atendimentos do salão. É exatamente o aluguel em dobro
     que foi consertado no `extrato()` e não aqui.

     Medido nos 7 casos da prova: num salão de 2, o anel da tela dizia
     R$ 180,50 e `conta()` dizia R$ 162,73 pelo MESMO serviço; num salão de 3,
     R$ 24,62 de diferença. E como cada uma arredondava do seu jeito, até no
     exemplo sobrava 1 centavo de distância.

     Agora existe UMA conta — a do extrato — e `conta()` LÊ as parcelas dela.
     É isso que faz as parcelas da tela fecharem com o total.
     ⚠️ Quem mexer aqui: não volte a calcular parcela nenhuma neste arquivo.
        Se faltar uma, ela nasce no `extrato()` e é lida aqui.
     ══════════════════════════════════════════════════════════════════════ */
  const x0 = extrato(d);
  const preco = n(d.preco), horas = n(d.horas);
  const atend = n(d.atend);
  const pCom = n(d.comissao) / 100;
  const pessoas = Math.max(0, Math.round(n(d.pessoas)));

  const produto = x0.tProduto;
  const taxa    = x0.tTaxas;
  const fixo    = x0.tSalao;     // rateio do salão por atendimento DO SALÃO
  const fixoMes = x0.fixoMes;
  const pTaxa   = x0.pTaxa;

  /* --- por serviço feito pelas mãos dela ---
     ✅ 02/11 — AGORA COM O TRABALHO DELA DESCONTADO. `x0.sobra` já tirou a
     fatia do salário dela junto com as outras contas do salão, então este
     número é lucro de verdade: o que sobra DEPOIS de ela estar paga. */
  const custo = x0.custo;
  const lucro = x0.sobra;
  const comissao = x0.tComissao;          /* já é 0 quando não há equipe */
  /* ⛔ 02/11 — O MÍNIMO IGNORAVA A COMISSÃO. Num serviço feito pela
     profissional a 40%, ele dizia R$ 62,67 quando o mínimo real é R$ 108,66.
     Agora entra tudo que o preço precisa cobrir: produto, o rateio (contas +
     salário dela), a comissão e as taxas. */
  const pTudo = pTaxa + (x0.temEquipe ? pCom * ((Math.max(1,pessoas+1)-1)/Math.max(1,pessoas+1)) : 0);
  const minimo = pTudo < .99 ? (produto + fixo) / (1 - pTudo) : null;

  /* ══════════════════════════════════════════════════════════════════════
     ⛔ 02/11 — O MÊS TINHA ARITMÉTICA PRÓPRIA, E POR ISSO DISCORDAVA DA TELA.
     `mesCom()` remontava faturamento, variáveis e fixo do zero. Medido no caso
     dela: o anel grande dizia R$ 177,03 por serviço e o anel pequeno do mesmo
     cupom dizia R$ 9.600,75 no mês — 177,03 × 87 dá R$ 15.401,61. R$ 5.800,86
     de divergência entre dois números da MESMA tela.

     Agora existe uma conta só: o mês é a sobra do serviço vezes quantos desses
     serviços o salão faz. Como o rateio do extrato já carrega a fatia certa das
     contas e do salário, a multiplicação fecha por construção.
     ⚠️ Quem mexer aqui: não reintroduza fórmula de mês. Se faltar uma parcela,
        ela nasce no `extrato()`.
     ══════════════════════════════════════════════════════════════════════ */
  const servicoMes = x0.servicoMes;
  const bocas = Math.max(1, pessoas + 1);

  /* o serviço sem comissão nenhuma — a base de onde cada cenário tira a sua */
  const semComissao = cent(lucro + comissao);
  const comCheia    = cent(semComissao - preco * pCom);

  const mesCom = p => {
    /* mais gente na cadeira → o salão faz mais DESTE serviço, na mesma
       proporção de bocas. Quem está sozinha hoje passa a ter `p` profissionais. */
    const nb    = p + 1;
    const serv  = servicoMes * (nb / bocas);
    const dela  = serv / nb;              /* as mãos dela não pagam comissão */
    const prof  = serv - dela;
    const liquido = cent(semComissao * dela + comCheia * prof);
    return { pessoas: p, serv, dela, prof, fat: cent(preco * serv),
             custo: cent(preco * serv - liquido), liquido,
             porServico: serv > 0 ? cent(liquido / serv) : 0 };
  };
  const hoje    = mesCom(pessoas);
  /* ══════════════════════════════════════════════════════════════════════
     O DEGRAU SUPÕE AS MESMAS CONTAS COM MAIS CADEIRA GIRANDO — e isso é
     verdade só até a sala encher. Acima disso precisaria de mais espaço, mais
     energia e mais lavatório, e nada disso foi perguntado. A tela diz isso em
     vez de o número fingir que o aluguel não muda.
     ══════════════════════════════════════════════════════════════════════ */
  const degrau  = pessoas === 0 ? 2 : pessoas * 2;
  const proximo = mesCom(degrau);

  /* ══════════════════════════════════════════════════════════════════════
     ⛔ 02/11 — A AGENDA NUNCA FOI CONFERIDA. A tela chamava o número do mês de
     «sua capacidade máxima» sem nunca perguntar se o dia cabe nas 24 horas.
     Medido: 10 progressivas de 3h por dia passavam lisas e a tela projetava
     R$ 41.173 no mês — 30 horas de cadeira num dia de 24.
     Aqui não se corrige a resposta dela; só se mede e se avisa.
     ══════════════════════════════════════════════════════════════════════ */
  const semana = Array.isArray(d.semana) ? d.semana.map(v => n(v)) : [];
  const picoDia = semana.length ? Math.max(...semana) / bocas : 0;
  const horasPico = picoDia * horas;
  const horasMes = horas * atend;

  return {
    preco, horas, produto, fixo, taxa, custo, lucro, minimo,
    /* o trabalho dela, já dentro de `fixo` — a tela nomeia, não soma de novo */
    trabalho: x0.tTrabalho, proLaboreMes: x0.proLaboreMes, semSalario: x0.semSalario,
    horasMes, horasPico, picoDia,
    /* 10h de cadeira num dia é o teto que usamos para avisar; acima disso o
       número do mês supõe um dia que provavelmente não existe */
    agendaEstoura: horasPico > 10,
    /* ⚠️ fixoMes e pTaxa saem daqui porque os indicadores precisavam deles e
       estavam lendo os campos soltos do exemplo (ver `indicadores`). */
    fixoMes, pTaxa, atendDoSalao: x0.atendDoSalao,
    hoje, proximo, degrau, mesCom,
    margem: preco > 0 ? lucro / preco : 0,
    porHora: horas > 0 ? lucro / horas : 0,
    paga: lucro < 0,
    atend, pessoas, comissao, semVolume: atend <= 0,
    servicoMes, semComissao, comCheia, bocas,
    /* ⚠️ `atendPorProf` nunca foi perguntado em tela nenhuma: `derivar()` grava
       sempre o mesmo valor de `atend`. Fica aqui só para quem lê o estado saber
       que a divisão é IGUAL entre as bocas — não é resposta dela. */
    atendProf: atend, divisaoIgual: true,
    temEquipeHoje: pessoas > 0,
    /* ⚠️ `so`/`eq` são dos mockups irmãos (sb/sc/sd/final). Antes tinham
       aritmética própria e divergiam da tela principal; agora saem do MESMO
       `mesCom`, então os quatro cupons mostram o mesmo número. */
    so:  mesCom(0),
    eq:  mesCom(pessoas || 2),
    ganho: cent(mesCom(pessoas || 2).liquido - mesCom(0).liquido),
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
/* ⛔ 02/11 — A FAIXA TINHA SIDO SUBIDA PARA CABER NO ERRO.
   Enquanto o salário dela não era descontado, a margem de QUALQUER serviço
   nascia inflada, e a régua foi erguida para 35%/55% para acompanhar. O efeito
   foi o pior possível: uma progressiva que deixava R$ 177 das mãos dela (sem
   pagar nada do trabalho) recebia o carimbo «Sua precificação está correta».
   Agora o salário dela está na conta e a margem é lucro de verdade — sobra
   DEPOIS de pagar produto, contas, o salário dela e as taxas. A faixa volta
   para patamar de lucro, não de faturamento. */
const REGUA = { limite: 0.08, apertado: 0.18,
  fonte: 'referência nossa — não existe órgão que fixe margem de salão no Brasil' };

function veredito(r){
  /* ⚠️ sem o salário dela respondido, o número não é lucro e a tela não pode
     carimbar «correta». Isto não é régua: é a conta estar incompleta. */
  if (r.semSalario) return {
    nivel: 'semdados', cor: '#A96808', icone: '!',
    titulo: 'Falta dizer quanto você quer ganhar',
    frase: 'Sem o seu salário na conta, o que sobra não é lucro — é o seu '
         + 'pagamento e o lucro misturados, e parece maior do que é.',
  };
  if (r.semVolume) return {
    nivel: 'semdados', cor: '#A96808', icone: '!',
    titulo: 'Falta dizer quantos atendimentos',
    frase: 'Sem volume não dá para dividir o custo do salão — e sem isso o lucro '
         + 'por serviço aparece maior do que é.',
  };
  if (r.paga) return {
    nivel: 'errado', cor: '#BC3D20', icone: 'x',
    titulo: 'Sua precificação está errada',
    frase: `Depois de pagar produto, contas e o seu salário, cada atendimento `
         + `tira ${R$(Math.abs(r.lucro))} do caixa. O mínimo para fechar é ${R$(r.minimo)}.`,
  };
  if (r.margem < REGUA.limite) return {
    nivel: 'limite', cor: '#A96808', icone: '!',
    titulo: 'Sua precificação está no limite',
    frase: `Depois do seu salário sobram só ${pc(r.margem)} do preço. `
         + `Um produto que subir já come o lucro.`,
  };
  if (r.margem < REGUA.apertado) return {
    nivel: 'apertado', cor: '#A96808', icone: '!',
    titulo: 'Sua precificação está apertada',
    frase: `${pc(r.margem)} sobram depois do seu salário. Paga tudo e sobra pouco: `
         + `não dá para repor equipamento nem guardar para o mês fraco.`,
  };
  return {
    nivel: 'certo', cor: '#12885C', icone: 'check',
    titulo: 'Sua precificação está correta',
    frase: `${pc(r.margem)} do preço sobram DEPOIS de pagar o seu salário — `
         + `acima dos ${pc(REGUA.apertado)} que usamos como referência.`,
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
    /* ⛔ 02/11 — ESTES DOIS LIAM CAMPOS QUE O APP NUNCA PREENCHE.
       `d.contaMes` e `d.taxas` são do atalho do exemplo; no caminho real o app
       grava `d.contas` e as duas taxas separadas. Medido: o ponto de equilíbrio
       imprimia **0 atendimentos** para pagar o salão (0 ÷ qualquer coisa), e o
       cenário zerava a taxa do cartão. Agora leem a mesma conta do resto da tela. */
    equilibrio: margemContrib > 0 ? Math.ceil(r.fixoMes / margemContrib) : null,
    /* quanto sobraria se ela cobrasse o preço mínimo e o preço-alvo */
    cenario(p){
      return p - r.produto - r.fixo - p * r.pTaxa;
    },
  };
}

/* número do documento, estável para o mesmo cálculo no mesmo dia.
   ⚠️ 02/11 — o prefixo era chumbado em `2026-1101`: o recibo imprimia
   «Nº 2026-1101-…» ao lado de «02 NOV 2026». Agora os dois são o mesmo dia.
   ⚠️ Os 6 últimos dígitos são o lucro em centavos — é por isso que o Nº muda
   quando o lucro muda. Era aí que a divergência das duas contas aparecia na
   tela: o anel dizia 180,50 e o Nº terminava em 016273. */
function numeroDoc(r){
  const t = new Date();
  const dia = String(t.getFullYear())
    + '-' + String(t.getMonth() + 1).padStart(2,'0')
    + String(t.getDate()).padStart(2,'0');
  /* ⛔ 02/11 — COM PREJUÍZO SAÍA LIXO. `padStart` numa string já com sinal
     imprimia «Nº 2026-1102-00-252» no cupom. Agora o sinal vira uma letra: P
     de prejuízo. */
  const neg = r.lucro < 0;
  const s = String(Math.abs(Math.round(r.lucro * 100))).padStart(6,'0').slice(-6);
  return dia + '-' + (neg ? 'P' : '') + s;
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
  /* ⚠️ 02/11 — O ATALHO DO EXEMPLO TAMBÉM PASSA POR AQUI, OBRIGATORIAMENTE.
     `d.produto`, `d.contaMes` e `d.taxas` são campos soltos (um número, sem
     lista) usados pelo PADRAO e pelos mockups. O extrato os IGNORAVA e caía nas
     constantes — então o exemplo tinha duas contas por construção, e divergia
     por 1 centavo. Campo solto agora vira uma linha só, e o extrato segue sendo
     a única conta da casa. */
  const _produtos = d.produtos || (d.produto != null
    ? [{ nome:'Produto do serviço', frasco:n(d.produto), rende:1 }] : PRODUTOS);
  const _contas = (d.contas || (d.contaMes != null
    ? [{ nome:'Contas do salão', v:n(d.contaMes) }] : CONTAS)).slice();
  /* ══════════════════════════════════════════════════════════════════════
     ⛔ 02/11 — AQUI FALTAVA O TRABALHO DELA, E ERA ISSO QUE INFLAVA O LUCRO.

     A calculadora perguntava preço, produto, contas, taxas e volume — e
     chamava o que sobrava de «lucro líquido». Não era: era o pagamento das
     mãos dela E o lucro, somados, sem separar. Medido numa progressiva de
     R$ 250 em 3h: a tela imprimia R$ 177,03 (70,8% do preço). R$ 177,03 em
     3 horas é R$ 59,01/h — o salário dela, chamado de lucro.

     O salário dela é custo do salão como o aluguel: tem que ser pago todo mês
     dê no que der. Então entra na MESMA lista, rateado pelo MESMO divisor, e
     atravessa o mesmo caminho de código. Uma conta só — é o que faz as
     parcelas da tela fecharem com o total e o mês fechar com o serviço.
     ⚠️ Quem mexer aqui: não crie um segundo rateio para o salário. Já houve
        esse bug (o aluguel em dobro) e ele custou meses de número errado.
     ══════════════════════════════════════════════════════════════════════ */
  if (n(d.proLabore) > 0) _contas.push({ nome:'Seu salário', v:n(d.proLabore), meu:true });
  /* ⛔ 02/11 — MEI NÃO PAGA IMPOSTO EM PORCENTAGEM. A tela 09 só aceitava %,
     com «2» de exemplo. Quem é MEI paga o DAS fixo (~R$ 80/mês): digitando o
     2 do exemplo ela pagava R$ 5,00 por atendimento em vez de R$ 0,92 — cerca
     de R$ 360/mês de imposto que não existe. Imposto fixo é conta do mês, não
     fatia da venda; entra aqui e é rateado como as outras. */
  if (n(d.impostoFixo) > 0) _contas.push({ nome:'Imposto (valor fixo)', v:n(d.impostoFixo) });
  const _taxas    = d.taxasLista
    || ((d.taxaCartao != null || d.taxaImposto != null)
        ? [{ nome:'Taxa da maquininha', pct:n(d.taxaCartao  || 0) },
           { nome:'Imposto',            pct:n(d.taxaImposto || 0) }]
        : (d.taxas != null
            ? [{ nome:'Cartão + imposto', pct:n(d.taxas) }]
            : [{ nome:'Taxa da maquininha', pct:3.5 },
               { nome:'Imposto',            pct:2   }]));

  const produtos = _produtos.map(p => ({
    nome: p.nome,
    /* «R$ 38 ÷ 1 usos» é o campo solto: o gasto já vem por atendimento */
    detalhe: n(p.rende) === 1 ? 'por atendimento'
           : R$0(n(p.frasco)) + ' ÷ ' + n(p.rende) + ' usos',
    v: cent(n(p.rende) > 0 ? n(p.frasco) / n(p.rende) : 0),
  }));
  /* ⛔ 02/11 — AQUI O ALUGUEL ERA COBRADO DUAS VEZES.
     `atend` é o que UMA pessoa atende (o total do salão dividido pelas bocas).
     Ratear as contas por ele significa que, num salão de 2 pessoas com 104
     atendimentos no mês, os R$ 1.200 de aluguel viravam R$ 23,08 em cada um
     dos 104 — R$ 2.400 no mês, o dobro do que ela paga.
     A conta do salão é PAGA UMA VEZ: ela se divide por TODOS os atendimentos do
     salão, não pelos de uma pessoa. Medido no caso dela: lucro líquido de
     R$ 189,17 (errado) para R$ 200,71 (certo). */
  const atendDoSalao = n(d.salaoMes) > 0 ? n(d.salaoMes) : atend;
  /* ══════════════════════════════════════════════════════════════════════
     ⛔ 02/11 — O MÊS COBRAVA PREÇO DE PROGRESSIVA EM TODO ATENDIMENTO.
     A tela 08 pergunta o movimento do SALÃO — todos os serviços, corte,
     escova, hidratação — e o mês multiplicava esse total pelo preço de UM
     serviço. Medido num salão misto de 87/mês (29 progressivas de R$ 250 +
     58 cortes de R$ 60): a tela projetava R$ 21.750 de faturamento contra
     R$ 10.730 reais. Inflava 103%, e a ressalva em letra miúda não mudava
     o número.
     Agora ela diz quantos daquele serviço o salão faz, e o mês projeta só
     esses. O rateio continua caindo sobre TODOS os atendimentos — porque o
     aluguel é pago por todos eles, não só pela progressiva.
     ══════════════════════════════════════════════════════════════════════ */
  const servicoMes = n(d.servicoMes) > 0 ? Math.min(n(d.servicoMes), atendDoSalao)
                   : atendDoSalao;
  const salao = _contas.map(c => ({
    nome: c.nome, detalhe: R$0(n(c.v)) + ' ÷ ' + atendDoSalao,
    v: cent(atendDoSalao > 0 ? n(c.v) / atendDoSalao : 0),
    meu: !!c.meu,
  }));
  const taxas = _taxas.map(t => ({
    nome: t.nome, detalhe: String(n(t.pct)).replace('.', ',') + '% de ' + R$0(preco),
    v: cent(preco * n(t.pct) / 100),
  }));

  /* ══════════════════════════════════════════════════════════════════════
     ⛔ 02/11 — A COMISSÃO SÓ EXISTIA NO MÊS, NUNCA NO SERVIÇO.
     Num salão com equipe, a maior parte dos atendimentos é feita por uma
     profissional que leva 40% — e o extrato do serviço não descontava nada
     disso. Medido num salão de 2: a tela dizia R$ 191,14 de «lucro» numa
     progressiva de R$ 250 que, feita pela profissional, deixa R$ 60,37.

     Quando há equipe, o serviço que a tela abre é o que a PROFISSIONAL faz —
     é ele que se multiplica quando o salão cresce, e é ele que decide se o
     preço aguenta uma cadeira a mais. Sem equipe, não há comissão nenhuma.
     ══════════════════════════════════════════════════════════════════════ */
  const temEquipe = Math.round(n(d.pessoas)) > 0;
  const pCom = n(d.comissao) / 100;
  /* ⚠️ A COMISSÃO ENTRA PELA FATIA, NÃO CHEIA — e é isso que faz os dois
     números da tela fecharem. Num salão de 3 bocas, 2 de cada 3 atendimentos
     são de profissional e pagam comissão; o terceiro é das mãos dela e não
     paga. Cobrar 40% cheios em todos mentiria para baixo; cobrar zero (como
     era até hoje) mente para cima. A fatia é a média real do salão — e é
     exatamente ela que, multiplicada pelo volume, dá o mês. */
  const bocasX = Math.max(1, Math.round(n(d.pessoas)) + 1);
  const fatiaProf = temEquipe ? (bocasX - 1) / bocasX : 0;
  const comissoes = (temEquipe && pCom > 0)
    ? [{ nome:'Comissão da profissional',
         detalhe: String(n(d.comissao)).replace('.', ',') + '% em '
                + (bocasX - 1) + ' de cada ' + bocasX + ' atendimentos',
         v: cent(preco * pCom * fatiaProf) }]
    : [];

  const soma = a => cent(a.reduce((s, x) => s + x.v, 0));
  const tProduto = soma(produtos), tSalao = soma(salao), tTaxas = soma(taxas);
  const tComissao = soma(comissoes);
  /* a fatia do salário dela dentro do custo fixo — a tela nomeia essa parcela,
     mas ela NÃO é somada de novo: já está dentro de tSalao */
  const trabalho = salao.filter(l => l.meu);
  const tTrabalho = soma(trabalho);
  const sobra = cent(preco - tProduto - tSalao - tComissao - tTaxas);
  /* a conta do salão CHEIA, como ela paga — é o que o mês desconta uma vez */
  const fixoMes = cent(_contas.reduce((s, c) => s + n(c.v), 0));
  const pTaxa = _taxas.reduce((s, t) => s + n(t.pct), 0) / 100;

  return {
    preco, atend, produtos, salao, taxas, fixoMes, pTaxa, atendDoSalao,
    /* ⚠️ `trabalho` é um RECORTE de `salao`, não uma lista nova. Quem for somar
       as parcelas da tela soma `salao` — somar as duas cobra o salário 2×. */
    trabalho, tTrabalho, proLaboreMes: n(d.proLabore) || 0,
    semSalario: !(n(d.proLabore) > 0),
    comissoes, tComissao, temEquipe, servicoMes,
    /* ⚠️ sem volume não existe rateio, e sem rateio o lucro por serviço SOBE —
       medido: 0 atendimentos devolvia R$ 198,25 contra R$ 177,03 com 87.
       Quem consome precisa saber que o número não vale. */
    semVolume: atend <= 0,
    /* ⚠️ «rateio» é jargão de contador. Na tela, custo fixo por atendimento. */
    titulos: ['Produto por atendimento', 'Custo fixo por atendimento',
              'Comissão da profissional', 'Taxas sobre a venda'],
    tProduto, tSalao, tTaxas, sobra,
    custo: cent(tProduto + tSalao + tComissao + tTaxas),
    margem: preco ? sobra / preco : 0,
  };
}
