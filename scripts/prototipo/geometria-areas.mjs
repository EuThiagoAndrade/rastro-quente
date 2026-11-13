// Validação do contorno de exibição; nunca usado para decidir pertencimento.
const iguais = (a,b) => a[0]===b[0] && a[1]===b[1];
// Sinal robusto: usa a precisão dupla quando segura e aritmética inteira exata nos casos próximos de zero.
const bits = new DataView(new ArrayBuffer(8));
function binario(x) {
  bits.setFloat64(0,x,false); const b=bits.getBigUint64(0,false), exp=Number((b>>52n)&0x7ffn), neg=b>>63n;
  let mantissa=b&((1n<<52n)-1n); if(exp!==0)mantissa|=1n<<52n;
  return [neg ? -mantissa : mantissa, exp===0 ? -1074 : exp-1075];
}
export function produto(a,b,c) {
  const p=(b[0]-a[0])*(c[1]-a[1]),q=(b[1]-a[1])*(c[0]-a[0]),v=p-q;
  if(Math.abs(v)>(Math.abs(p)+Math.abs(q))*Number.EPSILON*8)return v;
  const valores=[...a,...b,...c].map(binario),base=Math.min(...valores.map(v=>v[1]));
  const [ax,ay,bx,by,cx,cy]=valores.map(([m,e])=>m<<BigInt(e-base));
  const exato=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);return exato>0n?1:exato<0n?-1:0;
}
function noSegmento(p,a,b) {
  return produto(a,b,p)===0 && p[0]>=Math.min(a[0],b[0]) && p[0]<=Math.max(a[0],b[0]) && p[1]>=Math.min(a[1],b[1]) && p[1]<=Math.max(a[1],b[1]);
}
export function cruza(a,b,c,d) {
  const x=produto(a,b,c),y=produto(a,b,d),z=produto(c,d,a),w=produto(c,d,b);
  if (x===0 && noSegmento(c,a,b) || y===0 && noSegmento(d,a,b) || z===0 && noSegmento(a,c,d) || w===0 && noSegmento(b,c,d)) return true;
  return (x>0)!==(y>0) && (z>0)!==(w>0);
}
function dentro(p,anel) {
  let v=false;
  for(let i=1;i<anel.length;i++) {const a=anel[i-1],b=anel[i];if(noSegmento(p,a,b)) return false;if((a[1]>p[1])!==(b[1]>p[1]) && p[0]<a[0]+(p[1]-a[1])*(b[0]-a[0])/(b[1]-a[1])) v=!v;}
  return v;
}
export function arredondar(geo,casas) {
  return {type:'MultiPolygon',coordinates:geo.coordinates.map(poly=>poly.map(anel=>{
    const r=[];
    for(const p of anel){const q=p.map(x=>Number(x.toFixed(casas)));if(!r.length||!iguais(r.at(-1),q))r.push(q);}
    if(r.length>1&&!iguais(r[0],r.at(-1)))r.push([...r[0]]);
    return r;
  }))};
}

export function geometriaValida(g, diagnostico = () => {}) {
  const falha = (motivo) => { diagnostico(motivo); return false; };
  if(g?.type!=='MultiPolygon'||!Array.isArray(g.coordinates)||!g.coordinates.length) return falha('estrutura');
  const segmentos=[], aneis=[];
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(let pi=0;pi<g.coordinates.length;pi++) {
    const poly=g.coordinates[pi]; if(!poly.length)return falha('sem_anel');
    for(let ri=0;ri<poly.length;ri++) {
      const r=poly[ri];if(r.length<4||!iguais(r[0],r.at(-1))||new Set(r.slice(0,-1).map(p=>p.join(','))).size<3)return falha('anel_colapsado');
      const [ox,oy]=r[0];let area=0;
      for(let i=1;i<r.length;i++) {const a=r[i-1],b=r[i];if(a.length!==2||!a.every(Number.isFinite)||iguais(a,b))return falha('vertice_invalido');area+=(a[0]-ox)*(b[1]-oy)-(b[0]-ox)*(a[1]-oy); minX=Math.min(minX,a[0],b[0]);maxX=Math.max(maxX,a[0],b[0]);minY=Math.min(minY,a[1],b[1]);maxY=Math.max(maxY,a[1],b[1]);segmentos.push({a,b,pi,ri,i:i-1,total:r.length-1});}
      if(area===0)return falha('area_zero');aneis.push({pi,ri,r});
    }
    for(let ri=1;ri<poly.length;ri++) if(!dentro(poly[ri][0],poly[0]))return falha('buraco_fora');
  }
  // Grade limita as comparações sem deixar de examinar segmentos que se interceptam.
  const celulas=new Map(),vistos=new Set(),n=128,dx=(maxX-minX)||1,dy=(maxY-minY)||1;
  const cell=(x,min,d)=>Math.max(0,Math.min(n-1,Math.floor((x-min)*n/d)));
  for(let i=0;i<segmentos.length;i++) {
    const s=segmentos[i],x0=cell(Math.min(s.a[0],s.b[0]),minX,dx),x1=cell(Math.max(s.a[0],s.b[0]),minX,dx),y0=cell(Math.min(s.a[1],s.b[1]),minY,dy),y1=cell(Math.max(s.a[1],s.b[1]),minY,dy);
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
      const k=x*n+y,ls=celulas.get(k)??[];
      for(const j of ls){const t=segmentos[j],par=`${j}:${i}`;if(vistos.has(par))continue;vistos.add(par);
        if(s.pi===t.pi&&s.ri===t.ri&&(Math.abs(s.i-t.i)===1||Math.abs(s.i-t.i)===s.total-1))continue;
        if(cruza(s.a,s.b,t.a,t.b))return falha(s.pi===t.pi && s.ri===t.ri ? 'autointersecao' : 'intersecao_aneis');
      }
      ls.push(i);celulas.set(k,ls);
    }
  }
  // Sem cruzamento, um anel contido em outro também torna buracos ou partes inválidos.
  for(let i=0;i<aneis.length;i++)for(let j=i+1;j<aneis.length;j++) {
    const a=aneis[i],b=aneis[j];
    if(a.pi===b.pi && a.ri>0 && b.ri>0 && (dentro(a.r[0],b.r)||dentro(b.r[0],a.r)))return falha('buracos_aninhados');
    if(a.pi!==b.pi && a.ri===0 && b.ri===0) {
      const emParte = (p, poly) => dentro(p,poly[0]) && !poly.slice(1).some(h=>dentro(p,h));
      if(emParte(a.r[0],g.coordinates[b.pi]) || emParte(b.r[0],g.coordinates[a.pi])) return falha('partes_aninhadas');
    }
  }
  return true;
}
export function prepararContornoReal(geo) {
  const motivos=[];
  for(const casas of [5,6]) {const geometria=arredondar(geo,casas);if(geometriaValida(geometria, (motivo)=>motivos.push(`${casas}:${motivo}`)))return {geometria,casas};}
  throw new Error(`Contorno inválido após arredondamento a cinco e seis casas (${motivos.join(", ")}).`);
}
// Douglas-Peucker por distância ao segmento, com desempate pelo menor índice.
function distanciaSegmento(p,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy;
  const t=d===0?0:Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
function simplificarCadeia(pontos,tolerancia) {
  const manter=new Set([0,pontos.length-1]), pilha=[[0,pontos.length-1]];
  while(pilha.length) {
    const [inicio,fim]=pilha.pop();let max=tolerancia,indice=-1;
    for(let i=inicio+1;i<fim;i++){const d=distanciaSegmento(pontos[i],pontos[inicio],pontos[fim]);if(d>max){max=d;indice=i;}}
    if(indice>=0){manter.add(indice);pilha.push([inicio,indice],[indice,fim]);}
  }
  return pontos.filter((_p,i)=>manter.has(i));
}
export function simplificarAnel(anel,tolerancia) {
  if(!Array.isArray(anel)||anel.length<4||!iguais(anel[0],anel.at(-1))||!Number.isFinite(tolerancia)||tolerancia<0)throw new Error('Anel ou tolerância inválidos.');
  const pontos=anel.slice(0,-1);let indice=1,max=-1;
  for(let i=1;i<pontos.length;i++){const d=(pontos[i][0]-pontos[0][0])**2+(pontos[i][1]-pontos[0][1])**2;if(d>max){max=d;indice=i;}}
  const primeira=simplificarCadeia(pontos.slice(0,indice+1),tolerancia);
  const segunda=simplificarCadeia([...pontos.slice(indice),pontos[0]],tolerancia);
  const resultado=[...primeira,...segunda.slice(1)];
  return resultado.length<4||new Set(resultado.slice(0,-1).map(p=>p.join(','))).size<3?anel.map(p=>[...p]):resultado;
}
// Confere a distância após arredondamento por uma grade de segmentos da geometria final.
export function medirDesvio(original, destino, limite) {
  const segmentos=[];let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const poly of destino.coordinates)for(const ring of poly)for(let i=1;i<ring.length;i++){
    const a=ring[i-1],b=ring[i];segmentos.push([a,b]);minX=Math.min(minX,a[0],b[0]);maxX=Math.max(maxX,a[0],b[0]);minY=Math.min(minY,a[1],b[1]);maxY=Math.max(maxY,a[1],b[1]);
  }
  if(!segmentos.length||!Number.isFinite(limite)||limite<0)return Infinity;
  const n=128,dx=maxX-minX||1,dy=maxY-minY||1,cell=(v,min,d)=>Math.max(0,Math.min(n-1,Math.floor((v-min)*n/d))),grade=new Map();
  for(let i=0;i<segmentos.length;i++){
    const [a,b]=segmentos[i],x0=cell(Math.min(a[0],b[0]),minX,dx),x1=cell(Math.max(a[0],b[0]),minX,dx),y0=cell(Math.min(a[1],b[1]),minY,dy),y1=cell(Math.max(a[1],b[1]),minY,dy);
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const k=x*n+y,l=grade.get(k)??[];l.push(i);grade.set(k,l);}
  }
  let maximo=0;
  for(const poly of original.coordinates)for(const ring of poly)for(const p of ring){
    const candidatos=new Set(),x0=cell(p[0]-limite,minX,dx),x1=cell(p[0]+limite,minX,dx),y0=cell(p[1]-limite,minY,dy),y1=cell(p[1]+limite,minY,dy);
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(const i of grade.get(x*n+y)??[])candidatos.add(i);
    let menor=Infinity;for(const i of candidatos)menor=Math.min(menor,distanciaSegmento(p,...segmentos[i]));
    if(menor>limite)return Infinity;maximo=Math.max(maximo,menor);
  }
  return maximo;
}

export function prepararVisaoGeral(original, real) {
  const valores=[0.005,0.001,0.0005,0.00025,0.000125,0,null], partes=[];
  function obter(pi,inicio) {
    const fonte={type:'MultiPolygon',coordinates:[original.coordinates[pi]]};
    for(let indice=inicio;indice<valores.length;indice++) {
      const t=valores[indice];let g,limite;
      if(t===null){g={type:'MultiPolygon',coordinates:[real.geometria.coordinates[pi]]};limite=real.casas===5?0.000008:0.0000008;}
      else {g=arredondar({type:'MultiPolygon',coordinates:[fonte.coordinates[0].map(a=>t?simplificarAnel(a,t):a)]},4);limite=t+0.00008;}
      if(!geometriaValida(g))continue;
      const desvio=medirDesvio(fonte,g,limite);if(Number.isFinite(desvio))return {pi,g,t,indice,desvio};
    }
    return null;
  }
  for(let pi=0;pi<original.coordinates.length;pi++) {const v=obter(pi,0);if(!v)throw new Error('Contorno geral sem alternativa válida.');partes.push(v);}
  let geometria=()=>({type:'MultiPolygon',coordinates:partes.map(x=>x.g.coordinates[0])});
  while(!geometriaValida(geometria())) {
    let conflito=null;
    for(let i=0;i<partes.length&&!conflito;i++)for(let j=i+1;j<partes.length;j++) {
      const par={type:'MultiPolygon',coordinates:[partes[i].g.coordinates[0],partes[j].g.coordinates[0]]};
      if(!geometriaValida(par)){conflito=[i,j];break;}
    }
    if(!conflito)throw new Error('Partes da visão geral se interceptam.');
    let proximo=null;
    for(const i of conflito){const alternativa=obter(i,partes[i].indice+1);if(alternativa){proximo={i,alternativa};break;}}
    if(!proximo)throw new Error('Partes da visão geral se interceptam em todas as tolerâncias.');
    partes[proximo.i]=proximo.alternativa;
  }
  return {geometria:geometria(),tolerancias:partes.map(x=>x.t),desvios:partes.map(x=>x.desvio)};
}

// RFC 7946: exterior anti-horário e buracos horários. A classificação não usa esta cópia.
export function orientarGeoJSON(geo) {
  return {type:'MultiPolygon',coordinates:geo.coordinates.map(poly=>poly.map((anel,i)=>{
    const [ox,oy]=anel[0];let area=0;for(let j=1;j<anel.length;j++)area+=(anel[j-1][0]-ox)*(anel[j][1]-oy)-(anel[j][0]-ox)*(anel[j-1][1]-oy);
    return (i===0?area>0:area<0)?anel.map(p=>[...p]):[...anel].reverse().map(p=>[...p]);
  }))};
}
