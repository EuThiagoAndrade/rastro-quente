import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararContornoReal, simplificarAnel, prepararVisaoGeral, medirDesvio, arredondar, geometriaValida, orientarGeoJSON } from './geometria-areas.mjs';
const poligono = (exterior, ...buracos) => ({type:'MultiPolygon', coordinates:[[exterior, ...buracos]]});
const quadrado = (x1,y1,x2,y2) => [[x1,y1],[x1,y2],[x2,y2],[x2,y1],[x1,y1]];
test('contorno real usa cinco casas quando válido', () => {
  const r=prepararContornoReal(poligono(quadrado(0,0,1,1)));
  assert.equal(r.casas,5);assert.equal(r.geometria.coordinates[0][0].length,5);
});
test('contorno real usa seis casas se a quinta colapsa um buraco', () => {
  const g=poligono(quadrado(0,0,1,1),quadrado(0.4,0.4,0.400004,0.400004));
  const r=prepararContornoReal(g);assert.equal(r.casas,6);assert.equal(r.geometria.coordinates[0].length,2);
});
test('parada se o contorno não puder ser preservado a seis casas', () => {
  const g=poligono(quadrado(0,0,1,1),quadrado(0.4,0.4,0.40000004,0.40000004));
  assert.throws(()=>prepararContornoReal(g),/inválid/i);
});
test('buraco que toca o exterior e anel cruzado são inválidos', () => {
  assert.throws(()=>prepararContornoReal(poligono(quadrado(0,0,1,1),quadrado(0,0.2,0.1,0.3))),/inválid/i);
  assert.throws(()=>prepararContornoReal(poligono([[0,0],[1,1],[0,1],[1,0],[0,0]])),/inválid/i);
});

test('AP-16: anel pequeno não é descartado pela simplificação', () => {
  const anel=quadrado(0,0,0.0004,0.0004);assert.deepEqual(simplificarAnel(anel,0.001),anel);
});
test('AP-18: Douglas-Peucker fechado usa a tolerância e preserva o fechamento', () => {
  const anel=[[-57,-10],[-56.96,-10.0008],[-56.94,-10.0008],[-56.9,-10],[-56.9,-9.9],[-57,-9.9],[-57,-10]];
  const a=simplificarAnel(anel,0.001), b=simplificarAnel(anel,0.0005);
  assert.equal(a.some(p=>p[0]===-56.96),false);assert.equal(b.some(p=>p[0]===-56.96),true);assert.equal(b.some(p=>p[0]===-56.94),false);
  assert.deepEqual(b[0],b.at(-1));
});

test('AP-18: visão geral recua a tolerância para manter buraco',()=>{
 const exterior=[[-57,-10],[-56.96,-10.0008],[-56.94,-10.0008],[-56.9,-10],[-56.9,-9.9],[-57,-9.9],[-57,-10]];
 const hole=quadrado(-56.952,-10.0005,-56.948,-10.0003);
 const g=poligono(exterior,hole),real=prepararContornoReal(g),r=prepararVisaoGeral(g,real);
 assert.equal(r.tolerancias[0],0.0005);assert.ok(Math.abs(r.desvios[0]-0.000267)<0.000001);assert.ok(r.desvios[0]<=0.00058);assert.equal(r.geometria.coordinates[0].length,2);
});

test('visão geral reduz tolerância quando partes simplificadas se cruzam',()=>{
 const a=[[0,0],[0,1],[1,1],[1,0.6],[0.999,0.5],[1,0.4],[1,0],[0,0]];
 const b=quadrado(0.9999,0.4999,1.0001,0.5001);
 const g={type:'MultiPolygon',coordinates:[[a],[b]]};
 const real=prepararContornoReal(g),r=prepararVisaoGeral(g,real);
 assert.notEqual(r.tolerancias[0],0.005);
});

test('AP-17: contorno degenerado usa seis casas ou para',()=>{
 const pequeno=poligono(quadrado(-58.00001,-10.00001,-57.99998,-9.99998));
 assert.equal(prepararContornoReal(pequeno).casas,5);
 const menor=poligono(quadrado(-58.000001,-10.000001,-57.999998,-9.999998));
 assert.equal(prepararContornoReal(menor).casas,6);
 const minimo=poligono(quadrado(-58.00000001,-10.00000001,-57.99999998,-9.99999998));
 assert.throws(()=>prepararContornoReal(minimo),/inválid/i);
});

test('validação rejeita arestas adjacentes sobrepostas',()=>{
 const g=poligono([[0,0],[2,0],[1,0],[1,1],[0,1],[0,0]]);
 assert.throws(()=>prepararContornoReal(g),/inválid/i);
});

test('AP-16: mil vértices quase colineares e buraco pequeno são preservados',()=>{
 const sul=Array.from({length:1000},(_,i)=>[-60+0.1*i/999,-10+0.00001*Math.sin(i/30)]);
 const ext=[...sul,[-59.9,-9.9],[-60,-9.9],sul[0]],buraco=quadrado(-59.9602,-9.9502,-59.9598,-9.9498);
 const fonte=poligono(ext,buraco),anel=simplificarAnel(ext,0.001),h=simplificarAnel(buraco,0.001);
 const visao=arredondar(poligono(anel,h),4);
 assert.ok(anel.length<ext.length);assert.equal(h.length,buraco.length);assert.equal(geometriaValida(visao),true);
 assert.ok(medirDesvio(fonte,visao,0.00108)<=0.00108);assert.equal(prepararContornoReal(fonte).geometria.coordinates[0].length,2);
});

test('GeoJSON orienta exterior e buraco em sentidos opostos sem mudar pontos',()=>{
 const exterior=quadrado(0,0,2,2),buraco=quadrado(0.5,0.5,1.5,1.5),g=orientarGeoJSON(poligono(exterior,buraco));
 const area=a=>a.slice(1).reduce((v,p,i)=>v+a[i][0]*p[1]-p[0]*a[i][1],0);
 assert.ok(area(g.coordinates[0][0])>0);assert.ok(area(g.coordinates[0][1])<0);
 assert.deepEqual(new Set(g.coordinates[0][0].map(x=>x.join(','))),new Set(exterior.map(x=>x.join(','))));
});
