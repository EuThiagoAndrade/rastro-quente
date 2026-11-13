import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureShapefile } from './shapefile.fixture.mjs';
import { lerShapefile } from './shapefile.mjs';
import { rotuloCitaMT, classificarArea, validarGeometriaArea, calcularPertencimento } from './areas.mjs';

test('AP-19: reconhecimento exato de rótulos de UF', () => {
  for (const rotulo of ['MATO GROSSO', 'Mato  Grosso', 'PARÁ, MATO GROSSO']) assert.equal(rotuloCitaMT('cnuc', rotulo), true);
  assert.equal(rotuloCitaMT('cnuc', 'MATO GROSSO DO SUL'), false);
  assert.throws(() => rotuloCitaMT('cnuc', 'MATO GROSSO; XX'), /XX/);
  for (const rotulo of ['MT', 'MT,PA', 'MT/RO']) assert.equal(rotuloCitaMT('funai', rotulo), true);
  for (const rotulo of ['MS', 'PA RO']) assert.equal(rotuloCitaMT('funai', rotulo), false);
});

const uc = {grupo:'Uso Sustentável', categoria:'Reserva Particular do Patrimônio Natural', situacao:'Ativo', limite:'uc'};
test('AP-24: geometria nula em RPPN é contada como exclusão', () => {
  const resultado = classificarArea('cnuc', uc);
  assert.deepEqual(resultado, {incluida:false, motivo:'rppn'});
  assert.equal(validarGeometriaArea(null, resultado), null);
});
test('AP-25: geometria nula em área elegível para o processamento', () => {
  const resultado = classificarArea('cnuc', {...uc,categoria:'Parque',grupo:'Proteção Integral'});
  assert.throws(() => validarGeometriaArea(null, resultado), /geometria/i);
  assert.throws(() => classificarArea('cnuc', {...uc,categoria:undefined}), /categoria/i);
});

const caixa = (x1,y1,x2,y2) => [[x1,y1],[x1,y2],[x2,y2],[x2,y1],[x1,y1]];
const pol = (...aneis) => ({type:'MultiPolygon',coordinates:[aneis]});
const u = (id, geom, extra={}) => ({fonte:'cnuc',atributos:{cd_cnuc:id,nome_uc:id,quali_pol:'memorial',esfera:'Estadual',uf:'MATO GROSSO',grupo:'Proteção Integral',categoria:'Parque',situacao:'Ativo',limite:'uc',...extra},geometria:geom});
const ti = (id, geom, extra={}) => ({fonte:'funai',atributos:{terrai_cod:id,terrai_nom:id,uf_sigla:'MT',fase_ti:'Regularizada',modalidade:'Tradicionalmente ocupada',...extra},geometria:geom});
test('AP-1 a AP-10: pertencimento, exclusões e rótulos', () => {
 const areas=[
  u('A1',pol(caixa(-60,-10,-59.9,-9.9),caixa(-59.97,-9.97,-59.93,-9.93))),
  u('A2',pol(caixa(-59.92,-10,-59.8,-9.9)),{grupo:'Uso Sustentável',categoria:'Área de Proteção Ambiental'}),
  ti('A3',{type:'MultiPolygon',coordinates:[[caixa(-60,-9.9,-59.95,-9.85)],[caixa(-59.85,-9.9,-59.8,-9.85)]]}),
  ti('A4',pol(caixa(-59.95,-9.9,-59.9,-9.85)),{fase_ti:'Em Estudo'}),
  u('A5',pol(caixa(-59.8,-10,-59.75,-9.95)),{grupo:'Uso Sustentável',categoria:'Reserva Particular do Patrimônio Natural'}),
  u('A6',pol(caixa(-59.75,-10,-59.7,-9.95)),{limite:'za'}),
  u('A7',pol(caixa(-59.7,-10,-59.65,-9.95)),{grupo:'Uso Sustentável',categoria:'Área de Proteção Ambiental',uf:'PARÁ'}),
  ti('A8',pol(caixa(-59.6,-10,-59.55,-9.95)),{uf_sigla:'PA'}),
  ti('A9',pol(caixa(-59.5,-10,-59.45,-9.95)),{uf_sigla:'RO'}),
  u('A10',pol(caixa(-59.4,-10,-59.35,-9.95)),{uf:'MATO GROSSO DO SUL'})];
 const pts=[[-59.99,-9.99],[-59.95,-9.95],[-59.97,-9.95],[-59.9,-9.95],[-59.91,-9.95],[-59.97,-9.87],[-59.82,-9.87],[-59.92,-9.87],[-59.77,-9.97],[-59.72,-9.97],[-59.67,-9.97],[-59.5,-9.5],[-59.47,-9.97]].map(([longitude,latitude],i)=>({id_tecnico:`d${i+1}`,longitude,latitude}));
 const camposUc=['cd_cnuc','nome_uc','quali_pol','esfera','uf','grupo','categoria','situacao','limite'],camposTi=['terrai_cod','terrai_nom','uf_sigla','fase_ti','modalidade'];
 const porFonte={};for(const [fonte,campos,encoding,codigo] of [['cnuc',camposUc,'utf-8','cd_cnuc'],['funai',camposTi,'iso-8859-1','terrai_cod']]) {
  const linhas=areas.filter(a=>a.fonte===fonte),zip=fixtureShapefile('x',linhas,campos,fonte==='cnuc'?'utf8':'latin1');
  porFonte[fonte]=lerShapefile(zip,{fonte,campos,encoding,codigo,membros:{shp:'x.shp',dbf:'x.dbf',prj:'x.prj'}}).registros.map(r=>({...r,fonte}));
 }
 const lidas=areas.map(a=>porFonte[a.fonte].shift());
 const r=calcularPertencimento(lidas,pts);
 assert.deepEqual(r.vinculos.map(({id_tecnico,codigo,posicao})=>[id_tecnico,codigo,posicao]),[['d1','A1','interior'],['d3','A1','borda'],['d4','A1','borda'],['d4','A2','interior'],['d5','A1','interior'],['d5','A2','interior'],['d6','A3','interior'],['d7','A3','interior'],['d11','A7','interior'],['d13','A9','interior']]);
 assert.deepEqual(r.areas.map(a=>a.codigo),['A1','A2','A3','A7','A9']);
 assert.equal(r.exclusoes.rppn,1);assert.equal(r.exclusoes.em_estudo,1);assert.equal(r.exclusoes.zona_amortecimento,1);assert.equal(r.exclusoes.fora_mt_sem_deteccao,2);
});

test('saídas de áreas preservam pertencimento e limitam atributos',async()=>{
 const {prepararAreas}=await import('./processar-areas.mjs');
 const dados=[u('A1',pol(caixa(0,0,1,1)))];
 const r=prepararAreas(dados,[{id_tecnico:'d1',longitude:0.5,latitude:0.5}]);
 assert.deepEqual(r.vinculos,[{id_tecnico:'d1',fonte:'cnuc',codigo:'A1',posicao:'interior'}]);
 assert.equal(r.areas.length,1);assert.equal(r.areas[0].geometria_geral.type,'MultiPolygon');
 assert.equal(r.areas[0].geometria_real.type,'MultiPolygon');assert.equal('geometria' in r.areas[0],false);
 for(const nome of ['geometria_geral','geometria_real']) {const anel=r.areas[0][nome].coordinates[0][0];const soma=anel.slice(1).reduce((v,p,i)=>v+anel[i][0]*p[1]-p[0]*anel[i][1],0);assert.ok(soma>0,'anel externo GeoJSON deve ser anti-horário');}

});

test('AP-18: simplificação de exibição não altera vínculos no polígono integral',()=>{
 const exterior=[[-57,-10],[-56.96,-10.0008],[-56.94,-10.0008],[-56.9,-10],[-56.9,-9.9],[-57,-9.9],[-57,-10]];
 const g=pol(exterior,caixa(-56.952,-10.0005,-56.948,-10.0003));
 const r=calcularPertencimento([u('A12',g)],[{id_tecnico:'d14',longitude:-56.95,latitude:-10.0004},{id_tecnico:'d15',longitude:-56.95,latitude:-10.0007}]);
 assert.deepEqual(r.vinculos.map(x=>[x.id_tecnico,x.codigo,x.posicao]),[['d15','A12','interior']]);
});
