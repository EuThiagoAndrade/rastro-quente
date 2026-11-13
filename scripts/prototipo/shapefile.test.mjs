import test from 'node:test';
import assert from 'node:assert/strict';
import { fixtureShapefile,zipFicticio } from './shapefile.fixture.mjs';
import { createHash } from 'node:crypto';
import { decodificarCampo, agruparAneis, validarPrj, lerDbf, lerShp, extrairMembros, lerShapefile } from './shapefile.mjs';

const exterior = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]];
const buraco = [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]];

test('AP-11 e AP-12: codificação estrita por fonte', () => {
  assert.throws(() => decodificarCampo(Buffer.from([0xff]), 'utf-8'), /codifica/i);
  assert.throws(() => decodificarCampo(Buffer.from([0xc3, 0x81]), 'iso-8859-1'), /codifica/i);
  assert.equal(decodificarCampo(Buffer.from([0xc1]), 'iso-8859-1'), 'Á');
  assert.throws(() => decodificarCampo(Buffer.from([0x81]), 'iso-8859-1'), /codifica/i);
});

test('AP-13: aceita SIRGAS geográfico e recusa UTM', () => {
  assert.doesNotThrow(() => validarPrj('GEOGCS["SIRGAS 2000",DATUM["D_SIRGAS_2000",SPHEROID["GRS 1980",6378137,298.257222101]],UNIT["degree",0.0174532925199433]]'));
  assert.throws(() => validarPrj('PROJCS["SIRGAS 2000 / UTM zone 21S",GEOGCS["SIRGAS 2000"]]'), /referência/i);
  assert.throws(() => validarPrj('GEOGCS["SIRGAS 2000",DATUM["WGS 84"]]'), /referência/i);
});

test('AP-15: anéis fechados e buracos contidos', () => {
  assert.deepEqual(agruparAneis([exterior, buraco]), [[exterior, buraco]]);
  assert.throws(() => agruparAneis([exterior.slice(0, -1)]), /anel/i);
  assert.throws(() => agruparAneis([[[0,0],[0,1],[0,0]]]), /anel/i);
  assert.throws(() => agruparAneis([buraco]), /buraco/i);
});

function dbfFixture(campos, valores) {
  const h = 33 + campos.length * 32, largura = 1 + campos.length * 4;
  const b = Buffer.alloc(h + largura + 1, 0);
  b[0] = 3; b.writeUInt32LE(1, 4); b.writeUInt16LE(h, 8); b.writeUInt16LE(largura, 10);
  campos.forEach((nome, i) => { b.write(nome, 32 + i * 32, 'ascii'); b[32 + i * 32 + 11] = 67; b[32 + i * 32 + 16] = 4; });
  b[h - 1] = 13; b[h] = 32; b.fill(32, h + 1, h + largura);
  valores.forEach((v, i) => Buffer.from(v).copy(b, h + 1 + i * 4));
  b[h + largura] = 0x1a; return b;
}

test('AP-11: valida somente campos necessários e exige presença', () => {
  const dbf = dbfFixture(['nome_uc', 'outro_ato'], [Buffer.from('UC'), Buffer.from([0xff])]);
  assert.deepEqual(lerDbf(dbf, 'utf-8', ['nome_uc']), [{nome_uc: 'UC'}]);
  assert.throws(() => lerDbf(dbf, 'utf-8', ['nome_uc', 'outro_ato']), /codifica/i);
  assert.throws(() => lerDbf(dbf, 'utf-8', ['ausente']), /ausente/i);
});

test('Anel pequeno preserva orientação sem cancelamento numérico global', () => {
  const x = -59.0, y = -10.0, d = 1e-7;
  const anel = [[x,y], [x,y+d], [x+d,y+d], [x+d,y], [x,y]];
  assert.deepEqual(agruparAneis([anel]), [[anel]]);
});

test('AP-24: leitor SHP mantém posição de Null Shape para avaliação por T17', () => {
  const b = Buffer.alloc(112); b.writeInt32BE(9994,0); b.writeInt32BE(56,24); b.writeInt32LE(1000,28); b.writeInt32LE(5,32);
  b.writeInt32BE(1,100); b.writeInt32BE(2,104); b.writeInt32LE(0,108);
  assert.deepEqual(lerShp(b), [null]);
  b.writeInt32LE(3,108); assert.throws(() => lerShp(b), /Polygon/);
});

test('AP-20: ZIP misto lê somente membros declarados e recusa ausente ou duplicado',()=>{
 const records=[{atributos:{id:'X'},geometria:{type:'MultiPolygon',coordinates:[[[[0,0],[0,1],[1,1],[1,0],[0,0]]]]}}];
 const zip=fixtureShapefile('x',records,['id'],'utf8',[['x_pontos.shp',Buffer.from('ignorar')]]);
 const lidos=extrairMembros(zip,['x.shp','x.dbf','x.prj']);assert.deepEqual(Object.keys(lidos).sort(),['x.dbf','x.prj','x.shp']);
 assert.equal(createHash('sha256').update(lidos['x.shp']).digest('hex').length,64);
 const sem=zipFicticio([['x.shp',Buffer.from('a')],['x.dbf',Buffer.from('b')]]);
 assert.throws(()=>extrairMembros(sem,['x.shp','x.dbf','x.prj']),/ausente/i);
 const dup=zipFicticio([['x.shp',Buffer.from('a')],['x.dbf',Buffer.from('b')],['x.dbf',Buffer.from('c')],['x.prj',Buffer.from('d')]]);
 assert.throws(()=>extrairMembros(dup,['x.shp','x.dbf','x.prj']),/repetido/i);
});

test('AP-22: código duplicado interrompe leitura completa',()=>{
 const campos=['cd_cnuc','nome_uc','quali_pol','esfera','uf','grupo','categoria','situacao','limite'];
 const atributos={cd_cnuc:'DUP',nome_uc:'Exemplo',quali_pol:'memorial',esfera:'Estadual',uf:'MATO GROSSO',grupo:'Proteção Integral',categoria:'Parque',situacao:'Ativo',limite:'uc'};
 const geometria={type:'MultiPolygon',coordinates:[[[[0,0],[0,1],[1,1],[1,0],[0,0]]]]};
 const zip=fixtureShapefile('x',[{atributos,geometria},{atributos,geometria}],campos);
 assert.throws(()=>lerShapefile(zip,{fonte:'cnuc',encoding:'utf-8',codigo:'cd_cnuc',campos,membros:{shp:'x.shp',dbf:'x.dbf',prj:'x.prj'}}),/repetido/);
});

test('AP-24/AP-25: Null Shape só é aceito em registro excluído',()=>{
 const campos=['cd_cnuc','nome_uc','quali_pol','esfera','uf','grupo','categoria','situacao','limite'];
 const attrs={cd_cnuc:'A',nome_uc:'Fictícia',quali_pol:'memorial',esfera:'Estadual',uf:'MATO GROSSO',grupo:'Uso Sustentável',categoria:'Reserva Particular do Patrimônio Natural',situacao:'Ativo',limite:'uc'};
 const op={fonte:'cnuc',encoding:'utf-8',codigo:'cd_cnuc',campos,membros:{shp:'x.shp',dbf:'x.dbf',prj:'x.prj'}};
 assert.equal(lerShapefile(fixtureShapefile('x',[{atributos:attrs,geometria:null}],campos),op).registros[0].geometria,null);
 const elegivel={...attrs,grupo:'Proteção Integral',categoria:'Parque'};
 assert.throws(()=>lerShapefile(fixtureShapefile('x',[{atributos:elegivel,geometria:null}],campos),op),/sem geometria/i);
});

test('AP-15: buraco que começa dentro e atravessa exterior é recusado',()=>{
 const buracoCruzado=[[5,5],[15,5],[15,6],[5,6],[5,5]];
 assert.throws(()=>agruparAneis([exterior,buracoCruzado]),/buraco/i);
});

test('AP-12: descritor declarado é relatado mas não troca a codificação fixada',()=>{
 const campos=['cd_cnuc','nome_uc','quali_pol','esfera','uf','grupo','categoria','situacao','limite'];
 const atributos={cd_cnuc:'A',nome_uc:'Fictícia',quali_pol:'memorial',esfera:'Estadual',uf:'MATO GROSSO',grupo:'Proteção Integral',categoria:'Parque',situacao:'Ativo',limite:'uc'};
 const geometria={type:'MultiPolygon',coordinates:[[[[0,0],[0,1],[1,1],[1,0],[0,0]]]]};
 const zip=fixtureShapefile('x',[{atributos,geometria}],campos,'utf8',[['x.cpg',Buffer.from('ISO-8859-1')]]);
 const op={fonte:'cnuc',encoding:'utf-8',codigo:'cd_cnuc',campos,membros:{shp:'x.shp',dbf:'x.dbf',prj:'x.prj',codificacao:'x.cpg'}};
 const r=lerShapefile(zip,op);assert.equal(r.registros[0].atributos.nome_uc,'Fictícia');
 assert.equal(r.codificacao.declarada,'ISO-8859-1');assert.equal(r.codificacao.diverge,true);assert.equal(r.hashes['x.cpg'].length,64);
 const invalido=fixtureShapefile('x',[{atributos,geometria}],campos,'utf8',[['x.cpg',Buffer.from([0xff])]]);
 const diagnostico=lerShapefile(invalido,op);assert.equal(diagnostico.codificacao.diverge,true);assert.equal(diagnostico.registros[0].atributos.nome_uc,'Fictícia');
});
