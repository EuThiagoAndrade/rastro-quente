import test from 'node:test';
import assert from 'node:assert/strict';
import { tentarRepararContorno } from './reparo-exibicao.mjs';
const caixa = (x1,y1,x2,y2) => [[x1,y1],[x1,y2],[x2,y2],[x2,y1],[x1,y1]];
const multi=(...partes)=>({type:'MultiPolygon',coordinates:partes});
test('reparo experimental afasta buraco triangular que toca exterior',()=>{
 const g=multi([caixa(0,0,1,1),[[0.3,0],[0.6,0.2],[0.2,0.2],[0.3,0]]]);
 const r=tentarRepararContorno(g);assert.ok([6,8,14].includes(r.casas));assert.equal(r.geometria.coordinates[0].length,2);assert.ok(r.desvio<=0.0000008);
});
test('reparo experimental aumenta precisão se partes quase se tocam',()=>{
 const r=tentarRepararContorno(multi([caixa(0,0,1,1)],[caixa(1.00000004,0,2,1)]));assert.equal(r.casas,8);assert.ok(r.desvio<=0.0000008);
});
test('reparo experimental para diante de interseção que não é recuperável',()=>{
 assert.throws(()=>tentarRepararContorno(multi([caixa(0,0,1,1)],[caixa(0.5,0,2,1)])),/inválido/i);
});

test('AP-17: precisão extra preserva quadrado e parada ocorre ao esgotar alternativas',()=>{
 const pequeno=multi([caixa(0,0,0.00000001,0.00000001)]);
 assert.equal(tentarRepararContorno(pequeno).casas,8);
 const minimo=multi([caixa(0,0,0.0000000000000001,0.0000000000000001)]);
 assert.throws(()=>tentarRepararContorno(minimo),/inválido/i);
});
