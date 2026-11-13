import test from 'node:test';
import assert from 'node:assert/strict';
import { celulaDecimal, numeroDeVoltas, decompor, hashGeometria } from './conferir.mjs';

test('células por divisão decimal exata inclusive em negativos',()=>{
 assert.equal(celulaDecimal('-60.000000'),'-1200');
 assert.equal(celulaDecimal('-60.000001'),'-1201');
 assert.equal(celulaDecimal('0.049999'),'0');
 assert.equal(celulaDecimal('0.050000'),'1');
});
test('número de voltas: interior, exterior e borda',()=>{
 const a=[[0,0],[0,2],[2,2],[2,0],[0,0]];
 assert.equal(numeroDeVoltas([1,1],[a]),'dentro');
 assert.equal(numeroDeVoltas([3,1],[a]),'fora');
 assert.equal(numeroDeVoltas([0,1],[a]),'borda');
});
test('AP-23: decomposição sequencial atribui perda ao último vínculo',()=>{
 const antigos={TE:{fase:'Em Estudo',hash:'e'},TG:{fase:'Regularizada',hash:'g'},TM:{fase:'Regularizada',hash:'m1'},TK:{fase:'Regularizada',hash:'k'}};
 const novos={TM:{fase:'Regularizada',hash:'m2'},TK:{fase:'Regularizada',hash:'k'},TN:{fase:'Regularizada',hash:'n'}};
 const antigo=[['x','TE'],['x','TG'],['y','TM'],['w','TK'],['w','TE']];
 const novo=[['z','TN'],['w','TK']];
 const resultado=decompor({antigos,novos,antigo,novo,celulas:{x:'Cx',y:'Cy',z:'Cz',w:'Cw'}});
 assert.deepEqual(resultado.parcelas.map(({deteccoes,celulas})=>[deteccoes,celulas]),[[0,0],[-1,-1],[-1,-1],[1,1]]);
 assert.equal(resultado.igual,true);
});

test('decomposição compara também a posição de cada vínculo',()=>{
 const base={antigos:{A:{fase:'Regularizada',hash:'old'}},novos:{A:{fase:'Regularizada',hash:'new'}},antigo:[['x','A','borda']],novo:[['x','A','interior']],celulas:{x:'C'}};
 assert.equal(decompor(base).igual,true);
 assert.equal(decompor({...base,novos:{A:{fase:'Regularizada',hash:'old'}}}).igual,false);
});

test('hash normalizado ignora início e ordem de anéis, mas preserva orientação',()=>{
 const a=[[0,0],[0,2],[2,2],[2,0],[0,0]],b=[[3,3],[3,4],[4,4],[4,3],[3,3]];
 const girado=[[2,2],[2,0],[0,0],[0,2],[2,2]];
 assert.equal(hashGeometria({aneis:[a,b]}),hashGeometria({aneis:[b,girado]}));
 assert.notEqual(hashGeometria({aneis:[a,b]}),hashGeometria({aneis:[[...a].reverse(),b]}));
});
