/* S1 · ANÉIS — o lucro no anel grande, o mês nos dois menores. */
const d=Object.assign({},PADRAO), x=extrato(d), r=conta(d);
const m=v=>'R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const m0=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');
const aro=(tam,larg,pct,cor)=>{const R=(tam-larg)/2, C=2*Math.PI*R;
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}">
    <circle cx="${tam/2}" cy="${tam/2}" r="${R}" fill="none" stroke="#EDEDEF" stroke-width="${larg}"/>
    <circle cx="${tam/2}" cy="${tam/2}" r="${R}" fill="none" stroke="${cor}" stroke-width="${larg}"
      stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg>`;};
const prop = r.so.liquido / r.eq.liquido;

document.getElementById('alvo').outerHTML = `
<div class="folha">
  <div class="capa"><h1>Calculadora<br>de Precificação</h1><div class="fio"></div><p>Seu resultado</p></div>
  <div class="corpo">
    <p class="serv">Serviço: <b>${d.servico}</b></p>
    <p class="rot centro">Seu lucro líquido</p>
    <div class="anelG">${aro(188,16,x.margem,'#12885C')}
      <div class="meio"><span class="rot">por ${d.servico.toLowerCase()}</span>
        <b>${m(x.sobra)}</b><em>${(x.margem*100).toFixed(1).replace('.',',')}% do preço</em></div></div>
    <div class="tracejo"></div>
    <p class="rot centro" style="margin-bottom:10px">O máximo que você faz no mês</p>
    <div class="anelPar">
      <div class="anelP"><div class="aro">${aro(96,10,prop,'#9FA0A5')}
        <span>${m0(r.so.liquido)}</span></div><div class="leg">Sozinha</div></div>
      <div class="anelP"><div class="aro">${aro(96,10,1,'#12885C')}
        <span style="color:#12885C">${m0(r.eq.liquido)}</span></div>
        <div class="leg">Com ${r.pessoas}<br>pessoas</div></div>
    </div>
  </div>
</div>`;
