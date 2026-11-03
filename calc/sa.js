/* A · ANÉIS */

/* ══════════════════════════════════════════════════════════════════════════
   ⛔ 02/11 — O VEREDITO ESTAVA MORTO NA TELA QUE ESTÁ NO AR.
   `veredito()` existe no núcleo com todas as travas — «falta dizer quantos
   atendimentos», «sua precificação está errada», o preço mínimo — e NENHUMA
   delas era chamada aqui. Grep: só `nota.js`, que não está no fluxo. Resultado
   medido: com a semana toda em zero a tela imprimia «lucro líquido R$ 198,25 ·
   79,3%» em VERDE e, dois dedos abaixo, «hoje: − R$ 1.847». Duas contradições
   no mesmo cupom, e a trava que diria o porquê nunca renderizava.
   Agora o veredito é a primeira coisa do cupom.
   ══════════════════════════════════════════════════════════════════════════ */
const v = veredito(r);

/* ⛔ 02/11 — O BOTÃO MANDAVA CONTRATAR EM CIMA DE PREJUÍZO.
   Ele olhava só a margem do serviço. Medido: anel do degrau em − R$ 3.950 e,
   na mesma tela, «Aprender a montar uma equipe e multiplicar meus resultados».
   Multiplicar prejuízo é multiplicar prejuízo. Agora o convite para crescer só
   aparece quando o degrau dá número positivo. */
const LIMIAR = 0.15;
const podeCrescer = x.margem >= LIMIAR && r.proximo.liquido > r.hoje.liquido
                  && r.proximo.liquido > 0 && !r.semSalario;
document.getElementById('acao').innerHTML = podeCrescer
  ? 'Aprender a montar uma equipe<br>e multiplicar meus resultados'
  : 'Aprender a precificar melhor';

const CORES = { certo:'#12885C', apertado:'#A96808', limite:'#A96808',
                errado:'#BC3D20', semdados:'#A96808' };
const corV = CORES[v.nivel] || '#A96808';

/* o selo do veredito, no topo do miolo */
const selo = `
  <div class="selo" style="--c:${corV}">
    <b>${v.titulo}</b>
    <span>${v.frase}</span>
  </div>`;

/* ⚠️ as ressalvas que o número não consegue dizer sozinho. Só aparecem quando
   são verdade — ressalva que aparece sempre vira enfeite e ninguém lê. */
const avisos = [];
if (r.agendaEstoura) avisos.push(
  `Seu dia mais cheio tem <b>${r.horasPico.toFixed(1).replace('.', ',')}h de cadeira</b> `
  + `(${r.picoDia.toFixed(0)} × ${String(r.horas).replace('.', ',')}h). Confira se cabe — `
  + `o mês foi projetado em cima desse dia.`);
/* ⚠️ nada de pluralizar o nome do serviço («os 43 progressiva»): ela escreve o
   nome que quiser na tela 01, e não dá para conjugar o que não se conhece. */
if (x.servicoMes < x.atendDoSalao) avisos.push(
  `Dos ${x.atendDoSalao} atendimentos do salão no mês, só os `
  + `<b>${x.servicoMes} de ${d.servico.toLowerCase()}</b> entram nesta conta. `
  + `Os outros ${x.atendDoSalao - x.servicoMes} têm preço e custo diferentes.`);
if (r.pessoas > 0) avisos.push(
  `O salão foi dividido em partes iguais entre as ${r.bocas} de vocês. `
  + `Se alguém atende menos, o número dela muda.`);
avisos.push(`O degrau de ${r.degrau} supõe <b>as mesmas contas</b> do salão de hoje. `
  + `Mais cadeira costuma pedir mais espaço, e isso não foi perguntado.`);

cupom(`
  ${selo}
  <div class="tagWrap">
    <div class="barbante"></div>
    <div class="tag">
      <div class="et">Você cobra por<br>${d.servico}</div>
      <div class="pv"><span class="c">R$</span><span class="d">${
        (x.preco % 1 === 0 ? x.preco.toLocaleString('pt-BR')
                           : m(x.preco).replace('R$','').trim())}</span></div>
    </div>
  </div>
  <!-- ⛔ 02/11 — dizia «mas o seu lucro líquido é». Não era: o salário dela não
       estava descontado, então o número era pagamento + lucro somados, e ela lia
       como «o que sobra pra mim». Agora o salário está na conta E o rótulo diz
       de onde o número vem. -->
  <p class="mas">o que sobra <b>depois de pagar você</b>:</p>
  <div class="anelG">${aro(128,12, Math.max(0, Math.min(1, x.margem)), x.sobra < 0 ? '#BC3D20' : '#12885C')}
    <div class="meio">
      <b style="color:${x.sobra < 0 ? 'var(--vermelho)' : 'var(--verde)'}">${m(x.sobra)}</b><em>${(x.margem*100).toFixed(1).replace('.',',')}% do preço</em></div></div>
  ${x.tTrabalho > 0 ? `<p class="subAnel">Seu salário de ${m0(x.proLaboreMes)} já saiu daqui:
     <b>${m(x.tTrabalho)}</b> em cada atendimento.</p>` : ''}
  ${r.minimo != null && !r.semSalario ? `<p class="subAnel">Abaixo de <b>${m(r.minimo)}</b>
     esse serviço passa a tirar dinheiro do caixa.</p>` : ''}
  <div class="tracejo"></div>
  <p class="rot centro" style="margin-bottom:9px">O que ${d.servico.toLowerCase()} deixa no mês</p>
  <div class="anelPar">
    <div class="anelP"><div class="aro">${aro(92,7, Math.max(0, Math.min(1, r.proximo.liquido > 0 ? Math.max(0, r.hoje.liquido)/r.proximo.liquido : 0)),'#A7A8AD')}
      <span style="${r.hoje.liquido < 0 ? 'color:var(--vermelho)' : ''}">${m0(r.hoje.liquido)}</span></div>
      <div class="leg">${r.pessoas === 0
        ? 'Hoje, sozinha,<br>você faz'
        /* ⚠️ 02/11 — imprimia «com 1 PROFISSIONAIS». Plural é por número. */
        : 'Hoje, com ' + r.pessoas + (r.pessoas === 1 ? ' profissional,' : ' profissionais,')
          + '<br>você faz'}</div></div>
    <div class="anelP"><div class="aro">${aro(92,7,1, r.proximo.liquido < 0 ? '#BC3D20' : '#12885C')}
      <span style="color:${r.proximo.liquido < 0 ? 'var(--vermelho)' : '#12885C'}">${m0(r.proximo.liquido)}</span></div>
      <div class="leg ${r.proximo.liquido < 0 ? '' : 'verde'}">${r.pessoas === 0
        ? 'Com uma equipe<br>de ' + r.degrau + (r.degrau === 1 ? ' pessoa, faria' : ' pessoas, faria')
        : 'Com equipe<br>de ' + r.degrau + (r.degrau === 1 ? ' pessoa, faria' : ' pessoas, faria')}</div></div>
  </div>
  <ul class="ressalvas">${avisos.map(a => `<li>${a}</li>`).join('')}</ul>`);
