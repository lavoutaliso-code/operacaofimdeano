/* motor-torneira.js — a torneira da AOVIVO-5-gargalos/AOVIVO-solucao virada em peça
   reutilizável. Mesma geometria (J3), mesmos furos, mesmas tampas, mesmo boneco.
   Novo: progresso por gargalo (0..1). Furo encolhe conforme o checklist anda e
   fecha com tampa em 1. O vazamento é proporcional ao que falta.               */
(function(){
const NS='http://www.w3.org/2000/svg';
const OURO='#F2B01E', OURO2='#D98A05', TRACO='#6F757B', LARANJA='#FA6503';
// o dinheiro que VAZA não pode ter a mesma cara do que CHEGA: moeda perdida sai
// apagada no chão, moeda de lucro fica dourada e maior.
const PERDA='#CFC4AC', PERDA2='#AE9F82';
let seq=0;

const el=(t,a,pai)=>{const e=document.createElementNS(NS,t);
  for(const k in a) e.setAttribute(k,a[k]); if(pai) pai.appendChild(e); return e;};

class Torneira{
  constructor(svg, opts){
    this.svg=svg; this.uid='t'+(++seq);
    this.o=Object.assign({
      boneco:true, chamadas:true, chao:true,
      nomes:['Preço','Agenda','Cliente','Entrada','Sobra'],
      bracoFrac:.108, bracoMin:44, bracoMax:100, bracoLarg:.125,
      pyFrac:.415, chaoFrac:.965, leva:30, maxPilha:22,
      bonecoEsc:.60, comecaLisa:false,
      auto:true,        // false = só anda quando mandar (enviar())
      inteira:false,    // true = calcula o tamanho pra peça INTEIRA caber na caixa
      bonecoT:2.2,      // altura reservada pro lucro líquido, em braços
      // ⚠️ ANTES A BICA FICAVA COLADA NO LUCRO LÍQUIDO. A moeda saía da torneira e
      // já estava nos pés dele: não dava pra VER o dinheiro chegando. Agora existe
      // um vão de queda (quedaT, em braços) e o lucro líquido mora ao LADO da
      // coluna de queda (afastoT), então a moeda faz um arco visível até a pilha.
      quedaT:1.05,      // vão livre entre a bica e a cabeça do lucro líquido
      afastoT:1.15,     // quanto o lucro líquido anda pra direita da bica
      margem:10,
      onMudanca:null
    }, opts||{});
    this.oBase=this.o.bonecoEsc;      // tamanho de origem do lucro líquido
    // cano LISO = ainda não respondido: não tem furo desenhado e não vaza.
    this.liso=[0,1,2,3,4].map(()=>!!this.o.comecaLisa);
    this.prog=[0,0,0,0,0];            // 0..1 por gargalo (1 = fechado)
    this.pilhas=[0,0,0,0,0];          // moeda perdida em cada furo
    this.cofre=0;                     // moeda que chegou no fim
    this.moedas=[]; this.alvo=null;   // alvo = furo em destaque
    this.G={};
    this.desenhar();
    this._r=()=>this.desenhar(); addEventListener('resize',this._r);
    // a caixa pode crescer sem a janela mudar (painel que recolhe, palco que
    // toma a tela): sem isto a peça fica desenhada no tamanho antigo.
    if(window.ResizeObserver){
      this._ro=new ResizeObserver(()=>{ clearTimeout(this._tro);
        this._tro=setTimeout(()=>this.desenhar(),110); });
      this._ro.observe(svg);
    }
    requestAnimationFrame(()=>this.passo());
  }

  /* ---------- geometria (igual à J3 aprovada, agora em caixa qualquer) ---------- */
  medir(){
    const o=this.o;
    // ⚠️ `fixo:{W,H}` desenha SEMPRE na mesma grade, e o viewBox faz o SVG escalar.
    // É o único jeito de a peça sair IDÊNTICA ao `torneiras/problema.html` numa
    // caixa menor: medindo a caixa de verdade, o braço batia no mínimo de 58px e
    // o cano saía curto e gordo — proporção errada, outro desenho.
    const W = o.fixo ? o.fixo.W : this.svg.clientWidth;
    const H = o.fixo ? o.fixo.H : this.svg.clientHeight;
    // o braço obedece à altura E à largura: em tela estreita a peça não pode
    // engolir o cano reto (foi o que esmagou o desenho no celular). O mínimo só
    // vale quando ele cabe na largura.
    // a peça inteira (volante em cima + braço + bica embaixo) ocupa ~3,4 braços de
    // altura: sem este teto ela nasce cortada em faixa baixa.
    let T, PY, chao;
    if(o.inteira){
      // a peça INTEIRA tem que caber: volante (1,59 braço acima do eixo), bica
      // (1,59 abaixo) e o lucro líquido (bonecoT braços). Nada é cortado.
      const m=o.margem, fb=o.bonecoT+(o.boneco?o.quedaT:0);
      T = Math.min(W*o.bracoLarg, o.bracoMax, (H-2*m)/(3.18+fb));
      PY = m + 1.59*T;
      chao = PY + 1.59*T + fb*T;
    }else{
      const teto = Math.min(H*o.bracoFrac, H/3.9, W*o.bracoLarg, o.bracoMax);
      T  = Math.max(teto, Math.min(o.bracoMin, W*o.bracoLarg));
      PY = H*o.pyFrac;
      chao = H*o.chaoFrac;
    }
    const s  = T/160;
    // `traco` afina ou engorda o contorno sem mexer na geometria. Linha mais fina
    // deixa a leitura do desenho mais limpa — foi o pedido.
    const e  = Math.max(8, Math.min(T*.16, 16)) * (o.traco || 1);
    const topo = PY-T/2, base = PY+T/2;
    const dy   = topo-158*s;
    const dxL  = Math.max(20, W*.03)-28*s;
    const larguraDir = (1056-780)*s;
    const dxR  = W-Math.max(20, W*.03)-larguraDir-780*s;
    const xA   = dxL+300*s, xB = dxR+780*s;
    const furos=[]; let x1=xA+T*1.5, x2=xB-T*1.0;
    // num cano curto os 5 furos se amontoam no meio: espalha por 74% do trecho reto.
    const esticado=(xB-xA)*.74;
    if(x2-x1 < esticado){ const c=(x1+x2)/2; x1=c-esticado/2; x2=c+esticado/2; }
    for(let i=0;i<5;i++) furos.push(x1+(x2-x1)*i/4);
    // furo e tampa nunca encostam no vizinho: num cano curto eles viram uma
    // barra laranja só — foi o que aconteceu no celular.
    const passoF = Math.max(1, furos[1]-furos[0]);
    const rf = Math.min(T*.30, passoF*.30);
    const lt = Math.min(T*.84, passoF*.78);
    const bocaX = dxR+930*s;
    // a pilha de lucro e o boneco não ficam embaixo da bica: ficam ao lado, com a
    // coluna de queda entre os dois. Em caixa estreita o afasto encolhe pra peça
    // não sair pela direita.
    // sem lucro líquido não há pra onde afastar: a pilha sairia pela direita.
    const afasto = !this.o.boneco ? 0
      : Math.min(T*this.o.afastoT, Math.max(0, W-this.o.margem-bocaX-T*.9));
    return {W,H,T,s,e,PY,topo,base,dy,dxL,dxR,xA,xB,chao,furos,rf,lt,
            bocaX, bocaY: dy+492*s, cofreX: bocaX+afasto};
  }

  /* ---------- desenho ---------- */
  desenhar(){
    const svg=this.svg; svg.innerHTML=''; const G=this.G=this.medir();
    svg.setAttribute('viewBox',`0 0 ${G.W} ${G.H}`);
    const {W,H,T,s:k,e,topo,base,dy,dxL,dxR,xA,xB,chao}=G;

    if(this.o.chao) el('line',{x1:0,y1:chao+8,x2:W,y2:chao+8,stroke:'#CFD3D9','stroke-width':3},svg);

    el('rect',{x:xA,y:topo,width:xB-xA,height:base-topo,fill:'#FFF'},svg);

    // traço e preenchimento vão INLINE: a peça não depende de nenhuma folha de
    // estilo da página que a hospeda (sem isso ela nasce preta).
    const esp=e/k;
    const LIN={stroke:TRACO,fill:'#FFF','stroke-linejoin':'round','stroke-linecap':'round','stroke-width':esp};
    const QL ={stroke:LARANJA,fill:'#FFF','stroke-linejoin':'round','stroke-linecap':'round','stroke-width':esp};
    const gE=el('g',{transform:`translate(${dxL} ${dy}) scale(${k})`},svg);
    el('ellipse',Object.assign({cx:86,cy:252,rx:58,ry:120},LIN),gE);
    el('path',Object.assign({d:'M86 158 H300 V346 H86 Z'},LIN),gE);
    el('path',Object.assign({d:'M214 70 H290 V166 H214 Z'},LIN),gE);
    el('rect',Object.assign({x:230,y:26,width:44,height:66,rx:20},QL),gE);
    const gv=el('g',{},gE); this.volante=gv; gv.style.transformOrigin='252px 22px';
    el('ellipse',Object.assign({cx:164,cy:22,rx:72,ry:38},QL),gv);
    el('ellipse',Object.assign({cx:340,cy:22,rx:72,ry:38},QL),gv);
    el('circle',Object.assign({cx:252,cy:20,r:30},QL),gE);

    const gD=el('g',{transform:`translate(${dxR} ${dy}) scale(${k})`},svg);
    el('path',Object.assign({d:`M780 158 H880 A180 180 0 0 1 1060 338 V392
                  A28 28 0 0 1 1032 420 H828 A28 28 0 0 1 800 392 V338
                  A20 20 0 0 0 780 318`},LIN),gD);
    el('path',Object.assign({d:'M836 414 H1024 L1056 470 A20 20 0 0 1 1036 492 H824 A20 20 0 0 1 804 470 Z'},LIN),gD);

    el('line',{x1:xA,y1:topo,x2:xB,y2:topo,stroke:TRACO,'stroke-width':e,'stroke-linecap':'butt'},svg);
    el('line',{x1:xA,y1:base,x2:xB,y2:base,stroke:TRACO,'stroke-width':e,'stroke-linecap':'butt'},svg);

    this.gHalo   = el('g',{},svg);
    this.gCham   = el('g',{},svg);
    this.gFuros  = el('g',{},svg);
    this.gTampas = el('g',{},svg);
    const cp=el('clipPath',{id:'clip-'+this.uid},svg);
    el('rect',{x:xA,y:topo,width:(G.bocaX-xA),height:(G.base-topo)},cp);
    this.gOndas  = el('g',{'clip-path':`url(#clip-${this.uid})`},svg);
    this.gPilhas = el('g',{},svg);
    this.gMoedas = el('g',{},svg);

    if(this.o.boneco){
      // caixa baixa demais: a bica cai abaixo do chão e o boneco vira negativo
      const alt=Math.max(0,(chao-G.bocaY))*this.o.bonecoEsc;
      if(alt>24) this.boneco(G.cofreX, chao-alt, alt);
      el('ellipse',{cx:G.cofreX,cy:chao+4,rx:T*1.5,ry:T*.2,fill:TRACO,opacity:.12},svg);
    }

    for(let i=0;i<5;i++) this.poeFuro(i);
    this.redesenhaPilhas();
    this.destacar(this.alvo);
  }

  /* ---------- furo: encolhe conforme o progresso; some quando tampa ---------- */
  poeFuro(i){
    const G=this.G, x=G.furos[i], y=G.base, T=G.T, p=this.prog[i];
    if(this.liso[i]) return;                 // ainda não respondido: cano inteiro
    if(p>=1){ this.poeTampa(i,false); }
    else{
      const f=1-p*.72;
      el('ellipse',{cx:x,cy:y,rx:G.rf*f,ry:G.rf*.38*f,fill:'var(--fundo)',stroke:TRACO,
        'stroke-width':G.e,'stroke-linejoin':'round'},this.gFuros);
    }
    // o nome do gargalo em cima do furo é o que faz ela ligar a RESPOSTA ao cano.
    // o limiar era 760 — e a peça estreitou pra 744, então os rótulos sumiam todos.
    if(this.o.chamadas && G.W>500){           // em tela estreita os 5 rótulos embolam
      // ⚠️ quando o SVG é desenhado numa grade FIXA e escalado por CSS, a fonte
      // escala junto: 13px no viewBox de 1060 viram 6px numa tela de 474. O
      // `fonteCham` devolve o rótulo ao tamanho que se lê.
      const fonte=Math.max(11,T*.19)*(this.o.fonteCham||1);
      const banda=(i%2? T*1.78 : T*.92);
      const yTxt=Math.max(fonte*1.1, G.topo-banda);   // nunca sai pela borda de cima
      const g=el('g',{opacity: p>=1? .22 : .75},this.gCham);
      el('path',{d:`M${x} ${G.topo-T*.26} V ${yTxt+T*.34}`,stroke:LARANJA,
        'stroke-width':Math.max(2,G.e*.26),'stroke-linecap':'round',fill:'none'},g);
      el('path',{d:`M${x-T*.11} ${yTxt+T*.52} L${x} ${yTxt+T*.32} L${x+T*.11} ${yTxt+T*.52}`,
        fill:'none',stroke:LARANJA,'stroke-width':Math.max(2,G.e*.26),
        'stroke-linecap':'round','stroke-linejoin':'round'},g);
      // ⚠️ o 1º rótulo cavalgava o VOLANTE: centralizado no furo, a metade
      // esquerda do texto caía em cima da torneira. Quando isso ia acontecer, o
      // texto ancora à esquerda, logo depois do corpo.
      const nome=this.o.nomes[i].toUpperCase();
      const larg=nome.length*fonte*.62;
      // o volante é o que avança mais à esquerda: ele vai até dxL+412*s no
      // desenho da J3. É esse o limite, não o começo do cano.
      const limite=G.dxL+412*G.s+T*.45;
      const invade=(x-larg/2) < limite;
      const t=el('text',{x: invade?limite:x, y:yTxt,
        'text-anchor': invade?'start':'middle','font-size':fonte,
        'font-weight':700,fill:LARANJA,'letter-spacing':Math.max(1,T*.016),
        'font-family':"-apple-system,'SF Pro Text',BlinkMacSystemFont,sans-serif"},g);
      t.textContent=nome;
    }
  }

  poeTampa(i,anima){
    const G=this.G, x=G.furos[i], y=G.base, T=G.T;
    const g=el('g',{},this.gTampas), L=G.lt, alt=Math.min(T*.30,L*.36);
    el('rect',{x:x-L/2,y:y-alt*.47,width:L,height:alt,rx:alt*.43,
      fill:'#FFF',stroke:LARANJA,'stroke-width':Math.min(G.e,alt*.34)},g);
    [-1,1].forEach(d=>el('circle',{cx:x+d*L*.31,cy:y+T*.01,r:Math.min(T*.055,L*.07),
      fill:LARANJA},g));
    if(anima) g.animate([{opacity:0,transform:'translateY(18px) scale(.7)'},
                         {opacity:1,transform:'none'}],
      {duration:460,easing:'cubic-bezier(.22,1,.3,1)',fill:'backwards'});
  }

  destacar(i){
    this.alvo=i; if(!this.gHalo) return; this.gHalo.innerHTML='';
    if(i==null) return;
    const G=this.G, T=G.T;
    const c=el('circle',{cx:G.furos[i],cy:G.base,r:T*.78,fill:LARANJA,opacity:.2},this.gHalo);
    c.animate([{opacity:.1,transform:'scale(.8)'},{opacity:.3,transform:'scale(1.08)'},
               {opacity:.1,transform:'scale(.8)'}],
      {duration:1800,iterations:Infinity,easing:'ease-in-out'});
    c.style.transformOrigin=`${G.furos[i]}px ${G.base}px`;
  }

  /* ---------- montes ---------- */
  redesenhaPilhas(){
    if(!this.gPilhas) return;
    this.gPilhas.innerHTML='';
    this.pilhas.forEach((n,i)=>this.poePilha(i,n));
    this.poeCofre();
  }
  poePilha(i,n){                 // o que se PERDE: moeda apagada, no chão, miúda
    if(!n) return;
    const G=this.G, x=G.furos[i], y=G.chao, r=G.T*.15;
    const camadas=[6,5,4,3,2]; let k=0;
    for(let nv=0; nv<camadas.length && k<n; nv++){
      const q=camadas[nv];
      for(let c=0;c<q && k<n;c++,k++)
        el('ellipse',{cx:x+(c-(q-1)/2)*r*1.08,cy:y-nv*r*.7,rx:r,ry:r*.6,
          fill:PERDA,stroke:PERDA2,'stroke-width':2},this.gPilhas);
    }
  }
  poeCofre(){                    // o que CHEGA: moeda dourada, maior, aos pés do lucro
    if(!this.cofre) return;
    const G=this.G, x=G.cofreX, y=G.chao, r=G.T*.155;
    const camadas=[9,8,7,6,5,4,3]; let k=0;
    for(let nv=0; nv<camadas.length && k<this.cofre; nv++){
      const q=camadas[nv];
      for(let c=0;c<q && k<this.cofre;c++,k++)
        el('ellipse',{cx:x+(c-(q-1)/2)*r*1.08,cy:y-nv*r*.7,rx:r,ry:r*.6,
          fill:OURO,stroke:OURO2,'stroke-width':2.6},this.gPilhas);
    }
  }

  /* ---------- boneco: engorda com o cofre ---------- */
  boneco(x, topoY, alt){
    const cofre=this.cofre;
    const gd=Math.min(1, cofre/70), sentado=cofre>=64;
    const k=alt/520, rC=(58+6*gd)*k, E=12*k;
    const cy=topoY+rC+(sentado?70*k:0);
    const pescoco=cy+rC+2*k, ombro=pescoco+36*k, quadril=ombro+(170-18*gd)*k,
          joelho=quadril+92*k, pe=joelho+96*k;
    const barriga=(52+76*gd)*k;
    const pernas = sentado
      ? [[x+10*k,quadril+6*k,x+136*k,quadril+30*k,32*k],
         [x+136*k,quadril+30*k,x+130*k,quadril+140*k,32*k],
         [x-10*k,quadril+6*k,x+104*k,quadril+44*k,32*k],
         [x+104*k,quadril+44*k,x+98*k,quadril+150*k,32*k]]
      : [[x-4*k,quadril-8*k,x-48*k,joelho,30*k],[x-48*k,joelho,x-44*k,pe,30*k],
         [x+4*k,quadril-8*k,x+48*k,joelho,30*k],[x+48*k,joelho,x+44*k,pe,30*k]];
    const tubos=[[x,pescoco-6*k,x,ombro,22*k],[x,ombro,x,quadril,40*k],
      [x,quadril-48*k,x,quadril-48*k,barriga],
      [x-(6+52*gd)*k,ombro+10*k,x-(112+36*gd)*k,ombro+158*k,(26+6*gd)*k],
      [x+(6+52*gd)*k,ombro+10*k,x+(112+36*gd)*k,ombro+158*k,(26+6*gd)*k],
      ...pernas];
    const bn=el('g',{},this.svg); this.bn=bn;
    const risco=(cor,mais)=>tubos.forEach(([a,b,c,d,gr])=>
      el('path',{d:`M${a} ${b} L${c} ${d}`,fill:'none',stroke:cor,
        'stroke-width':gr+mais,'stroke-linecap':'round'},bn));
    const a1=-116*Math.PI/180, a2=-64*Math.PI/180;
    const cab=`M${x} ${cy} L${x+rC*Math.cos(a1)} ${cy+rC*Math.sin(a1)}
      A ${rC} ${rC} 0 1 0 ${x+rC*Math.cos(a2)} ${cy+rC*Math.sin(a2)} Z`;
    risco(TRACO,2*E);
    el('path',{d:cab,fill:TRACO,stroke:TRACO,'stroke-width':2*E,'stroke-linejoin':'round'},bn);
    risco('#FFF',0);
    el('path',{d:cab,fill:'#FFF',stroke:'#FFF','stroke-width':1,'stroke-linejoin':'round'},bn);
    // a placa é o que explica a figura: ela precisa ser lida de longe
    const cw=(198+56*gd)*k, ch=(128+16*gd)*k, cx0=x-cw/2, cy0=ombro+14*k;
    el('rect',{x:cx0,y:cy0,width:cw,height:ch,rx:26*k,fill:'#FFF',stroke:TRACO,'stroke-width':E},bn);
    [['LUCRO',52],['LÍQUIDO',99]].forEach(([txt,dy])=>{
      const t=el('text',{x:x,y:cy0+dy*k,'text-anchor':'middle','font-size':(38+5*gd)*k,
        'font-weight':700,fill:'#17150F','font-family':"-apple-system,'SF Pro Text',sans-serif"},bn);
      t.textContent=txt;});
  }
  redesenhaBoneco(){
    if(!this.o.boneco) return;
    if(this.bn) this.bn.remove();
    const alt=Math.max(0,this.G.chao-this.G.bocaY)*this.o.bonecoEsc;
    if(alt>24) this.boneco(this.G.cofreX, this.G.chao-alt, alt);
  }
  setBonecoEsc(v){ this.o.bonecoEsc=v; this.redesenhaBoneco(); }

  /* ---------- fluxo de moedas ---------- */
  moedaEl(){
    const g=el('g',{},this.gOndas);
    el('ellipse',{rx:this.G.T*.105,ry:this.G.T*.072,fill:OURO,stroke:OURO2,'stroke-width':2.4},g);
    return g;
  }
  soltarLeva(){
    const G=this.G, n=this.o.leva, passo=G.T*.46;
    const dest=[];
    for(let i=0;i<5;i++){
      const vaza = this.liso[i] ? 0 : 1-this.prog[i];   // cano liso não vaza
      const q=Math.round(5.4*vaza);                 // o furo rouba o que falta fechar
      for(let k=0;k<q;k++) dest.push(i);
    }
    while(dest.length<n) dest.push(null);           // o resto chega no fim
    dest.length=n;
    for(let i=0;i<n;i++){
      this.moedas.push({el:this.moedaEl(), x:G.xA-G.T*.6-i*passo, y:G.PY,
                        vy:0, estado:'cano', furo:dest[i], rot:Math.random()*360});
    }
  }
  /* uma leva por clique: o dinheiro só anda quando ela responde */
  enviar(){ if(this.G.W) this.soltarLeva(); }
  passo(){
    const G=this.G;
    if(this.o.auto && this.moedas.length===0 && G.W) this.soltarLeva();
    const v=G.W*.0062; let mudou=false;
    this.moedas=this.moedas.filter(m=>{
      if(m.estado==='cano'){
        m.x+=v;
        const tapado = m.furo!=null && (this.liso[m.furo] || this.prog[m.furo]>=1);
        if(m.furo!=null && !tapado && m.x>=G.furos[m.furo]){
          m.estado='cai'; m.x=G.furos[m.furo]; m.y=G.base; m.vy=G.H*.008;
          m.el.remove(); this.gMoedas.appendChild(m.el);
        } else if(m.x>=G.bocaX){
          if(tapado) m.furo=null;
          m.estado='cai'; m.x=G.bocaX; m.y=G.bocaY; m.vy=G.H*.008; m.furo=null;
          // o arco até a pilha: resolve em quantos quadros a moeda chega no chão e
          // divide o afasto por eles. Sem isso ela cairia reta e a pilha teria que
          // ficar colada na bica — foi exatamente a reclamação.
          const g=G.H*.0019, dist=Math.max(1, G.chao-G.T*.1-G.bocaY);
          const n=(-m.vy+Math.sqrt(m.vy*m.vy+2*g*dist))/g;
          m.vx=(G.cofreX-G.bocaX)/Math.max(1,n);
          m.el.remove(); this.gMoedas.appendChild(m.el);
        }
      } else {
        m.vy+=G.H*.0019; m.y+=m.vy; if(m.vx) m.x+=m.vx;
        if(m.y>=G.chao-G.T*.1){
          if(m.furo==null){ this.cofre++; if(this.cofre%6===0) this.redesenhaBoneco(); }
          else this.pilhas[m.furo]=Math.min(this.pilhas[m.furo]+1,this.o.maxPilha);
          mudou=true; m.el.remove(); return false;
        }
      }
      m.rot+=5;
      m.el.setAttribute('transform',`translate(${m.x} ${m.y})`+
        (m.estado==='cano'?` rotate(${m.rot*.18})`:''));
      return true;
    });
    if(mudou){ this.redesenhaPilhas(); if(this.o.onMudanca) this.o.onMudanca(this.placar()); }
    requestAnimationFrame(()=>this.passo());
  }

  giraVolante(){
    if(this.volante) this.volante.animate([{transform:'rotate(0deg)'},{transform:'rotate(80deg)'}],
      {duration:620,easing:'cubic-bezier(.3,0,.2,1)'});
  }

  /* ---------- API ---------- */
  setProgresso(i,frac){
    const antes=this.prog[i]; frac=Math.max(0,Math.min(1,frac));
    if(antes===frac) return;
    this.prog[i]=frac;
    this.gFuros.innerHTML=''; this.gTampas.innerHTML=''; this.gCham.innerHTML='';
    for(let j=0;j<5;j++) this.poeFuro(j);
    if(frac>=1 && antes<1){ this.poeTampa(i,true); this.giraVolante(); }
    if(this.o.onMudanca) this.o.onMudanca(this.placar());
  }
  redesenhaFuros(){
    this.gFuros.innerHTML=''; this.gTampas.innerHTML=''; this.gCham.innerHTML='';
    for(let j=0;j<5;j++) this.poeFuro(j);
  }
  /* abre o furo: o cano estava liso e passa a vazar (é o «hoje» do salão dela) */
  abrirFuro(i,anima){
    if(!this.liso[i] && this.prog[i]===0) return;
    this.liso[i]=false; this.prog[i]=0; this.redesenhaFuros();
    if(anima!==false){
      const g=this.gFuros.lastChild;
      if(g) g.animate([{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'none'}],
        {duration:380,easing:'cubic-bezier(.22,1,.3,1)',fill:'backwards'});
    }
    if(this.o.onMudanca) this.o.onMudanca(this.placar());
  }
  /* fecha o furo com tampa (é o «depois», a solução no lugar) */
  taparFuro(i,anima){
    this.liso[i]=false; this.prog[i]=1; this.redesenhaFuros();
    if(anima!==false){ this.poeTampa(i,true); this.giraVolante(); }
    if(this.o.onMudanca) this.o.onMudanca(this.placar());
  }
  alisar(i){ this.liso[i]=true; this.prog[i]=0; this.redesenhaFuros();
    if(this.o.onMudanca) this.o.onMudanca(this.placar()); }
  /* a resposta do checklist vira tamanho de furo: quanto mais «ainda não»,
     maior o rombo. Zero falta = cano liso. */
  responder(i, faltas, total, anima){
    if(faltas<=0){ this.alisar(i); return; }
    const novoProg=Math.max(0,(1-faltas/total)*.8);
    const eraLiso=this.liso[i];
    this.liso[i]=false; this.prog[i]=novoProg; this.redesenhaFuros();
    if(anima && eraLiso){
      const g=this.gFuros.lastChild;
      if(g) g.animate([{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'none'}],
        {duration:380,easing:'cubic-bezier(.22,1,.3,1)',fill:'backwards'});
    }
    if(this.o.onMudanca) this.o.onMudanca(this.placar());
  }
  placar(){
    const fechados=this.prog.filter((p,i)=>!this.liso[i] && p>=1).length;
    const abertos=this.prog.filter((p,i)=>!this.liso[i] && p<1).length;
    return {fechados, abertos, cofre:this.cofre,
            perdido:this.pilhas.reduce((a,b)=>a+b,0),
            prog:this.prog.slice()};
  }
  zerar(){ this.pilhas=[0,0,0,0,0]; this.cofre=0; this.moedas.forEach(m=>m.el.remove());
    this.moedas=[]; this.redesenhaPilhas(); this.redesenhaBoneco(); }
}
window.Torneira=Torneira;
window.GARGALOS=[
  {nome:'Preço',   dor:'o que você cobra não cobre o que custa',
   itens:['Sei o custo de cada serviço: produto + hora de cadeira. Não é chute.',
          'A tabela de dezembro já está escrita, com a data em que sobe.',
          'Desconto de fim de ano tem teto, e só uma pessoa pode dar.']},
  {nome:'Agenda',  dor:'cadeira vazia em dezembro não volta mais',
   itens:['Dezembro já está aberto na agenda, com os horários de pico mapeados.',
          'Tenho fila de espera pra encaixar buraco de desistência no mesmo dia.',
          'Sei quantas horas de cadeira tenho pra vender no mês — e quantas já vendi.']},
  {nome:'Cliente', dor:'quem já é sua custa menos que a nova',
   itens:['Tenho a lista de quem veio nos últimos 90 dias e não voltou.',
          'Toda cliente sai do salão com o próximo horário marcado.',
          'Alguém chama de volta quem não agendou — com dia e hora pra fazer isso.']},
  {nome:'Entrada', dor:'serviço marcado sem sinal é cadeira no prejuízo',
   itens:['Química e serviço de alto valor só entram na agenda com sinal pago.',
          'A confirmação sai antes do dia, sem eu precisar lembrar.',
          'Falta sem avisar tem regra escrita, e a cliente sabe dela antes.']},
  {nome:'Sobra',   dor:'faturar não é lucrar',
   itens:['O dinheiro do salão e o meu estão em contas separadas.',
          'Sei quanto SOBROU no mês passado, não só quanto entrou.',
          'Comissão, produto e imposto saem antes de eu me pagar.']}
];

/* as 5 soluções: é o que a segunda cena promete e o que a mentoria entrega */
window.SOLUCOES=[
  {nome:'Preço',   titulo:'A tabela com o seu custo dentro',
   linha:'cada serviço com produto e hora de cadeira contados antes do preço'},
  {nome:'Agenda',  titulo:'A agenda que vende hora de cadeira',
   linha:'dezembro aberto, pico mapeado e fila de espera pra tapar buraco no dia'},
  {nome:'Cliente', titulo:'A volta da cliente marcada no dia',
   linha:'ninguém sai sem o próximo horário, e alguém chama quem não marcou'},
  {nome:'Entrada', titulo:'Sinal e confirmação ligados',
   linha:'química só entra com sinal pago e a confirmação sai sozinha'},
  {nome:'Sobra',   titulo:'O fecho que mostra o que sobrou',
   linha:'comissão, produto e imposto saem antes de você se pagar'}
];

/* o roteiro das duas cenas, igual nos quatro caminhos */
window.ROTEIRO={
  // cena 1 — «como está o seu negócio hoje»: fura onde ela respondeu «ainda não»
  // lista = [{i, faltas}]
  hoje(t, lista, cb){
    t.zerar(); for(let i=0;i<5;i++) t.alisar(i);
    if(!lista.length){ if(cb) setTimeout(cb,600); return; }
    lista.forEach((d,k)=>setTimeout(()=>{
      t.responder(d.i, d.faltas, 3, true);
      if(k===lista.length-1 && cb) setTimeout(cb,900);
    }, k*620));
  },
  // cena 2 — «como pode ficar»: tapa um por um e o lucro líquido cresce
  depois(t, lista, cb){
    t.zerar();
    const ids = (lista.length? lista.map(d=>d.i) : [0,1,2,3,4]);
    for(let i=0;i<5;i++) if(!ids.includes(i)) t.alisar(i);
    ids.forEach((i,k)=>setTimeout(()=>{
      t.taparFuro(i,true);
      if(k===ids.length-1) setTimeout(()=>{
        t.setBonecoEsc(Math.min(.95, t.oBase*1.5)); if(cb) cb();
      }, 700);
    }, k*620));
  }
};
})();
