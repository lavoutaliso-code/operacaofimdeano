/* A · ANÉIS */
/* ⚠️ O BOTÃO MUDA CONFORME A MARGEM. Abaixo de 15% o problema dela é o preço,
   e convidar para montar equipe seria multiplicar um serviço que dá prejuízo.
   Acima disso o preço já se paga, e o caminho é girar mais cadeiras. */
const LIMIAR = 0.15;
document.getElementById('acao').innerHTML = x.margem < LIMIAR
  ? 'Aprender a precificar melhor'
  : 'Aprender a montar uma equipe<br>e multiplicar meus resultados';

cupom(`
  <div class="tagWrap">
    <div class="barbante"></div>
    <div class="tag">
      <div class="et">Você cobra por<br>${d.servico}</div>
      <div class="pv"><span class="c">R$</span><span class="d">${
        (x.preco % 1 === 0 ? x.preco.toLocaleString('pt-BR')
                           : m(x.preco).replace('R$','').trim())}</span></div>
    </div>
  </div>
  <p class="mas">mas o seu lucro líquido é:</p>
  <div class="anelG">${aro(128,12, Math.max(0, Math.min(1, x.margem)), x.sobra < 0 ? '#BC3D20' : '#12885C')}
    <div class="meio">
      <b style="color:${x.sobra < 0 ? 'var(--vermelho)' : 'var(--verde)'}">${m(x.sobra)}</b><em>${(x.margem*100).toFixed(1).replace('.',',')}% do preço</em></div></div>
  <div class="tracejo"></div>
  <p class="rot centro" style="margin-bottom:9px">Sua capacidade máxima no mês</p>
  <div class="anelPar">
    <div class="anelP"><div class="aro">${aro(92,7, Math.max(0, Math.min(1, r.proximo.liquido ? r.hoje.liquido/r.proximo.liquido : 0)),'#A7A8AD')}
      <span style="${r.hoje.liquido < 0 ? 'color:var(--vermelho)' : ''}">${m0(r.hoje.liquido)}</span></div>
      <div class="leg">${r.pessoas === 0
        ? 'Hoje, sozinha,<br>você faz até'
        : 'Hoje, com ' + r.pessoas + ' profissionais,<br>você faz até'}</div></div>
    <div class="anelP"><div class="aro">${aro(92,7,1,'#12885C')}
      <span style="color:${r.proximo.liquido < 0 ? 'var(--vermelho)' : '#12885C'}">${m0(r.proximo.liquido)}</span></div>
      <div class="leg verde">${r.pessoas === 0
        ? 'Se tiver uma equipe<br>de ' + r.degrau + ' pessoas, fará'
        : 'Se aumentar pra equipe<br>de ' + r.degrau + ' pessoas, fará'}</div></div>
  </div>
  <p class="ressalva">O mês está projetado só com ${d.servico.toLowerCase()},
     ${r.atend} atendimentos por pessoa. Se você faz outros serviços, o número muda.</p>`);
