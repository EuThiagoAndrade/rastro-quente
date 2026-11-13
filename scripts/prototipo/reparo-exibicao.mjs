// Recuperação limitada dos contornos de exibição; nunca altera o pertencimento.
import { arredondar, geometriaValida } from './geometria-areas.mjs';
const TOLERANCIA = 0.0000008;
const cruzado = (a,b) => a[0]*b[1]-a[1]*b[0];
function reduzirTriangulo(anel, distancia) {
  if (anel.length!==4) return null;
  const p=anel.slice(0,-1), e=p.map((v,i)=>[p[(i+1)%3][0]-v[0],p[(i+1)%3][1]-v[1]]);
  const area=cruzado(e[0],[-e[2][0],-e[2][1]]), sinal=area>0?1:-1;
  if (area===0 || e.some(v=>Math.hypot(...v)===0)) return null;
  const deslocados=p.map((v,i)=>{const d=e[i],n=Math.hypot(...d);return [v[0]-sinal*d[1]*distancia/n,v[1]+sinal*d[0]*distancia/n]});
  const saida=p.map((_v,i)=>{const j=(i+2)%3,det=cruzado(e[j],e[i]);if(det===0)return null;const delta=[deslocados[i][0]-deslocados[j][0],deslocados[i][1]-deslocados[j][1]],t=cruzado(delta,e[i])/det;return [deslocados[j][0]+t*e[j][0],deslocados[j][1]+t*e[j][1]]});
  return saida.some(v=>!v||v.some(x=>!Number.isFinite(x)))?null:[...saida,saida[0]];
}
function distanciaSegmento(p,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;
  const t=l===0?0:Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
function desvioVertices(original,resultado) {
  const seg=[];for(const p of resultado.coordinates)for(const r of p)for(let i=1;i<r.length;i++)seg.push([r[i-1],r[i]]);
  let maximo=0;for(const p of original.coordinates)for(const r of p)for(const v of r) {let d=Infinity;for(const [a,b] of seg)d=Math.min(d,distanciaSegmento(v,a,b));maximo=Math.max(maximo,d);if(maximo>TOLERANCIA)return maximo;}
  return maximo;
}
export function tentarRepararContorno(original) {
  function tentar(base) {
    for(const casas of [6,8,14]) {
      const geometria=arredondar(base,casas);if(!geometriaValida(geometria))continue;
      const desvio=desvioVertices(original,geometria);if(desvio<=TOLERANCIA)return {geometria,casas,desvio};
    }
    return null;
  }
  const direto=tentar(original);if(direto)return {...direto,metodo:'precisao'};
  for(let pi=0;pi<original.coordinates.length;pi++) for(let i=1;i<original.coordinates[pi].length;i++) {
    const anel=reduzirTriangulo(original.coordinates[pi][i],1e-7);if(!anel)continue;
    const ajustado=structuredClone(original);ajustado.coordinates[pi][i]=anel;
    const resultado=tentar(ajustado);if(resultado)return {...resultado,metodo:'recuo_triangular'};
  }
  throw new Error('Contorno inválido; nenhuma tentativa experimental preservou os limites.');
}
