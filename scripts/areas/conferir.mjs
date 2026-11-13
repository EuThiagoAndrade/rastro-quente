// Conferência independente: número de voltas sobre anéis crus, sem geo.mjs nem agrupamento T16.
export function celulaDecimal(texto) {
  const m=/^([+-]?)(\d+)(?:\.(\d+))?$/.exec(String(texto));if(!m)throw new Error('Coordenada decimal inválida.');
  const frac=m[3]??'',den=10n**BigInt(frac.length),num=BigInt(m[2]+frac)*(m[1]==='-'?-1n:1n)*20n;
  let q=num/den;if(num<0n&&num%den!==0n)q-=1n;return q.toString();
}
export function numeroDeVoltas([px,py],aneis) {
  let voltas=0;
  for(const anel of aneis)for(let i=1;i<anel.length;i++){
    const [ax,ay]=anel[i-1],[bx,by]=anel[i],cross=(bx-ax)*(py-ay)-(by-ay)*(px-ax);
    if(cross===0 && px>=Math.min(ax,bx) && px<=Math.max(ax,bx) && py>=Math.min(ay,by) && py<=Math.max(ay,by))return 'borda';
    if(ay<=py&&by>py&&cross>0)voltas++;else if(ay>py&&by<=py&&cross<0)voltas--;
  }
  return voltas===0?'fora':'dentro';
}
// Rotação mínima preserva o sentido do anel, mas independe do primeiro vértice.
export function hashGeometria(geometria) {
  if(!geometria)return createHash('sha256').update('null').digest('hex');
  const aneis=geometria.aneis.map(anel=>{
    const pontos=anel.slice(0,-1),n=pontos.length;if(!n)throw Error('Anel vazio.');
    const comparar=(a,b)=>a[0]===b[0]?(a[1]===b[1]?0:a[1]<b[1]?-1:1):a[0]<b[0]?-1:1;
    let i=0,j=1,k=0;
    while(i<n&&j<n&&k<n){const c=comparar(pontos[(i+k)%n],pontos[(j+k)%n]);if(c===0){k++;continue;}if(c>0){i+=k+1;if(i<=j)i=j+1;}else{j+=k+1;if(j<=i)j=i+1;}k=0;}
    const inicio=Math.min(i,j);return JSON.stringify(Array.from({length:n},(_,x)=>pontos[(inicio+x)%n]));
  }).sort();
  return createHash('sha256').update(JSON.stringify(aneis)).digest('hex');
}
export function decompor({antigos,novos,antigo,novo,celulas}) {
  const chave=(v)=>JSON.stringify(v);let atual=new Set(antigo.map(chave));const esperado=new Set(novo.map(chave));
  const conta=(set)=>{const ids=new Set([...set].map(x=>JSON.parse(x)[0]));return {deteccoes:ids.size,celulas:new Set([...ids].map(id=>{if(!Object.hasOwn(celulas,id))throw Error('Célula ausente.');return celulas[id]})).size};};
  const parcelas=[];
  function etapa(nome,operacao){const antes=conta(atual);operacao();const depois=conta(atual);parcelas.push({nome,deteccoes:depois.deteccoes-antes.deteccoes,celulas:depois.celulas-antes.celulas});}
  etapa('em_estudo',()=>{atual=new Set([...atual].filter(x=>antigos[JSON.parse(x)[1]]?.fase!=='Em Estudo'));});
  etapa('ausentes',()=>{atual=new Set([...atual].filter(x=>Object.hasOwn(novos,JSON.parse(x)[1])));});
  etapa('alteradas',()=>{const alterados=new Set(Object.keys(antigos).filter(k=>Object.hasOwn(novos,k)&&antigos[k].hash!==novos[k].hash));atual=new Set([...atual].filter(x=>!alterados.has(JSON.parse(x)[1])));for(const x of esperado)if(alterados.has(JSON.parse(x)[1]))atual.add(x);});
  etapa('novas',()=>{for(const x of esperado)if(!Object.hasOwn(antigos,JSON.parse(x)[1]))atual.add(x);});
  return {parcelas,igual:atual.size===esperado.size&&[...atual].every(x=>esperado.has(x))};
}
// Leitura independente da etapa exploratória: diretório ZIP, DBF e anéis crus.
// Não usa geo.mjs, agrupamento de anéis T16, nem módulos de lentes.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { lerCsv } from '../banco/manifesto.mjs';
import { sha256Arquivo } from '../prova-dados/obter.mjs';

function membrosZip(b, solicitados) {
  let fim=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50&&i+22+b.readUInt16LE(i+20)===b.length){fim=i;break;}
  if(fim<0)throw Error('ZIP incompleto.');const n=b.readUInt16LE(fim+10),offset=b.readUInt32LE(fim+16),saida={};let p=offset;
  for(let i=0;i<n;i++){
    if(p+46>fim||b.readUInt32LE(p)!==0x02014b50)throw Error('ZIP inválido.');
    const metodo=b.readUInt16LE(p+10),tam=b.readUInt32LE(p+20),nl=b.readUInt16LE(p+28),el=b.readUInt16LE(p+30),cl=b.readUInt16LE(p+32),lo=b.readUInt32LE(p+42),nome=b.subarray(p+46,p+46+nl).toString('utf8');
    if(solicitados.includes(nome)){
      if(saida[nome])throw Error('Membro repetido.');if(![0,8].includes(metodo)||lo+30>offset||b.readUInt32LE(lo)!==0x04034b50)throw Error('Membro ZIP inválido.');
      const start=lo+30+b.readUInt16LE(lo+26)+b.readUInt16LE(lo+28);if(start+tam>offset)throw Error('Membro ZIP incompleto.');
      const bytes=b.subarray(start,start+tam);saida[nome]=metodo===0?bytes:inflateRawSync(bytes);
    }
    p+=46+nl+el+cl;
  }
  if(solicitados.some(n=>!saida[n]))throw Error('Membro ausente.');return saida;
}
function atributosDbf(b,encoding,campos) {
  const n=b.readUInt32LE(4),h=b.readUInt16LE(8),l=b.readUInt16LE(10);if(h+n*l>b.length)throw Error('DBF truncado.');
  const fs=[];let off=1;
  for(let p=32;p<h-1&&b[p]!==13;p+=32){const nome=b.subarray(p,p+11).toString('ascii').replace(/\0.*$/,''),t=b[p+16];if(campos.includes(nome))fs.push({nome,off,t});off+=t;}
  if(fs.length!==campos.length||off!==l||b[h-1]!==13)throw Error('Campos DBF incompatíveis.');
  return Array.from({length:n},(_,i)=>Object.fromEntries(fs.map(({nome,off,t})=>{
    const v=b.subarray(h+i*l+off,h+i*l+off+t);return [nome,encoding==='utf-8'?new TextDecoder('utf-8',{fatal:true}).decode(v).trim():v.toString('latin1').trim()];
  })));
}
function aneisShp(b) {
  if(b.length<100||b.readInt32BE(0)!==9994||b.readInt32BE(24)*2!==b.length||b.readInt32LE(32)!==5)throw Error('SHP inválido.');
  const resultado=[];let p=100;
  while(p<b.length){
    const ini=p+8,end=ini+b.readInt32BE(p+4)*2;if(end>b.length||ini+4>end)throw Error('Registro SHP incompleto.');const tipo=b.readInt32LE(ini);
    if(tipo===0){if(end!==ini+4)throw Error('Null Shape inválido.');resultado.push(null);p=end;continue;}
    if(tipo!==5||ini+44>end)throw Error('Tipo SHP inesperado.');const n=b.readInt32LE(ini+36),v=b.readInt32LE(ini+40),iniP=ini+44+n*4;
    if(n<1||v<4||iniP+16*v!==end)throw Error('Partes SHP inválidas.');
    const idx=Array.from({length:n},(_,i)=>b.readInt32LE(ini+44+i*4));idx.push(v);
    const aneis=Array.from({length:n},(_,i)=>Array.from({length:idx[i+1]-idx[i]},(_,j)=>[b.readDoubleLE(iniP+16*(idx[i]+j)),b.readDoubleLE(iniP+16*(idx[i]+j)+8)]));
    resultado.push({bbox:[b.readDoubleLE(ini+4),b.readDoubleLE(ini+12),b.readDoubleLE(ini+20),b.readDoubleLE(ini+28)],aneis});p=end;
  }
  return resultado;
}
async function fonteExploratoria(arquivo,base,encoding,campos,hash) {
  const b=await readFile(arquivo),obtido=createHash('sha256').update(b).digest('hex');if(obtido!==hash)throw Error(`Hash divergente para ${base}.`);
  const shp=`${base}.shp`,dbf=`${base}.dbf`,m=membrosZip(b,[shp,dbf]);const a=atributosDbf(m[dbf],encoding,campos),g=aneisShp(m[shp]);
  if(a.length!==g.length)throw Error('Contagem SHP/DBF divergente.');return a.map((atributos,i)=>({atributos,geometria:g[i]}));
}
function testarAreas(deteccoes,areas,fonte) {
  const links=[];
  for(const d of deteccoes)for(const a of areas){
    if(!a.geometria)continue;const [x0,y0,x1,y1]=a.geometria.bbox;if(d.lon<x0||d.lon>x1||d.lat<y0||d.lat>y1)continue;
    const pos=numeroDeVoltas([d.lon,d.lat],a.geometria.aneis);if(pos==='fora')continue;
    const codigo=fonte==='cnuc'?a.atributos.cd_cnuc:a.atributos.terrai_cod;
    const classe=fonte==='cnuc'?a.atributos.grupo:'terra_indigena';links.push({id:d.id,celula:d.celula,codigo,classe,pos,attrs:a.atributos});
  }
  return links;
}
const unicos=(links,campo)=>new Set(links.map(x=>x[campo]));
function resumo(links){return {deteccoes:unicos(links,'id').size,celulas:unicos(links,'celula').size};}
function cruzamento(a,b,campo){const x=unicos(a,campo),y=unicos(b,campo);return [...x].filter(k=>y.has(k)).length;}
function multiplos(a){const por=new Map();for(const x of a){const s=por.get(x.id)??new Set();s.add(x.codigo);por.set(x.id,s)}return [...por.values()].filter(s=>s.size>1).length;}
export async function etapaExploratoria() {
  const [ucs,tis,csv]=await Promise.all([
    fonteExploratoria('local/areas-protegidas/brutos/shp_cnuc_2025_08.zip','cnuc_2025_08','utf-8',['cd_cnuc','grupo','categoria','quali_pol','uf'],'97d754c1e01881d5f94e2f9e465fa95fe37b58c24a3df46989c7b30a9bb93fc6'),
    fonteExploratoria('local/areas-protegidas/brutos/funai_tis_poligonais_mt.zip','tis_poligonais','latin1',['terrai_cod','fase_ti'],'6dd8003f92c4bc966895aececded40ca21021d43a1a193e1c6150459bb313f08'),
    readFile('local/dados-prototipo/saidas/deteccoes.csv','utf8'),
  ]);
  const deteccoes=lerCsv(csv).linhas.filter(r=>r.escopo==='principal').map(r=>({id:r.id_tecnico,lon:Number(r.lon),lat:Number(r.lat),celula:`${celulaDecimal(r.lon)}:${celulaDecimal(r.lat)}`}));
  const u=testarAreas(deteccoes,ucs,'cnuc'),t=testarAreas(deteccoes,tis,'funai'),pi=u.filter(x=>x.classe==='Proteção Integral'),us=u.filter(x=>x.classe==='Uso Sustentável');
  const uniao=[...u,...t],res={deteccoesAnalisadas:deteccoes.length,uc:resumo(u),protecaoIntegral:resumo(pi),usoSustentavel:resumo(us),terraIndigena:resumo(t),ambas:{deteccoes:cruzamento(u,t,'id'),celulas:cruzamento(u,t,'celula')},uniao:resumo(uniao),multiplaUc:multiplos(u),multiplaTi:multiplos(t),bordas:uniao.filter(x=>x.pos==='borda').length,rppn:unicos(u.filter(x=>x.attrs.categoria==='Reserva Particular do Patrimônio Natural'),'id').size,estimativa:unicos(u.filter(x=>x.attrs.quali_pol.includes('estimativa')),'id').size};
  const citaMT=x=>x.attrs.uf.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().split(/[,;/]/).map(s=>s.trim().replace(/\s+/g,' ')).includes('MATO GROSSO');
  const foraUf=u.filter(x=>!citaMT(x)),dentroUf=u.filter(citaMT),piRotulada=pi.filter(citaMT);
  res.diagnosticoRotulo={ucSemRotuloMT:resumo(foraUf),protecaoIntegralRotulada:resumo(piRotulada),multiplaUcRotulada:multiplos(dentroUf),exclusivosProtecaoFora:resumo(pi.filter(x=>!unicos(piRotulada,'id').has(x.id)))};
  const esperado={deteccoesAnalisadas:10640,uc:[323,108],protecaoIntegral:[78,39],usoSustentavel:[254,74],terraIndigena:[2500,750],ambas:[4,3],uniao:[2819,855],multiplaUc:11,multiplaTi:2,bordas:0,rppn:0,estimativa:1};
  const divergencias=[];
  for(const [k,v] of Object.entries(esperado)){const obtido=res[k];if(Array.isArray(v)){if(obtido.deteccoes!==v[0]||obtido.celulas!==v[1])divergencias.push(k);}else if(obtido!==v)divergencias.push(k);}
  if(res.diagnosticoRotulo.ucSemRotuloMT.deteccoes!==2||res.diagnosticoRotulo.ucSemRotuloMT.celulas!==2||res.diagnosticoRotulo.protecaoIntegralRotulada.deteccoes!==76||res.diagnosticoRotulo.protecaoIntegralRotulada.celulas!==37||res.diagnosticoRotulo.multiplaUcRotulada!==9)divergencias.push('referencias_rotulo_mt');
  if(divergencias.length)throw Error(`Conferência exploratória divergiu: ${divergencias.join(', ')}. Parado.`);
  return res;
}
// Etapa 2 compara os vínculos da carga e a decomposição sem importar o classificador.
export async function etapaCarga(caminhoPipeline='local/dados-prototipo/saidas/deteccoes_areas.csv') {
  const fontes=JSON.parse(await readFile('scripts/prototipo/fontes.json','utf8'));
  const funai=fontes.itens.find(x=>x.papel==='areas'&&x.fonte==='funai');
  const cnuc=fontes.itens.find(x=>x.papel==='areas'&&x.fonte==='cnuc');
  if(!funai?.sha256 || !cnuc?.sha256)throw Error('Fontes da carga ausentes.');
  const camposUc=['cd_cnuc','grupo','categoria','situacao','limite'];
  const camposTi=['terrai_cod','terrai_nom','uf_sigla','fase_ti','modalidade'];
  const [ucs,antigas,nacionais,csv,pipelineTexto,relatorio]=await Promise.all([
    fonteExploratoria(path.join('local/dados-prototipo/brutos',cnuc.destino),'cnuc_2025_08','utf-8',camposUc,cnuc.sha256),
    fonteExploratoria('local/areas-protegidas/brutos/funai_tis_poligonais_mt.zip','tis_poligonais','latin1',camposTi,'6dd8003f92c4bc966895aececded40ca21021d43a1a193e1c6150459bb313f08'),
    fonteExploratoria(path.join('local/dados-prototipo/brutos',funai.destino),'tis_poligonais','latin1',camposTi,funai.sha256),
    readFile('local/dados-prototipo/saidas/deteccoes.csv','utf8'),readFile(caminhoPipeline,'utf8'),readFile('local/dados-prototipo/relatorio.json','utf8').then(JSON.parse),
  ]);
  const hash=texto=>createHash('sha256').update(texto).digest('hex');
  for(const [nome,texto] of [['deteccoes.csv',csv],['deteccoes_areas.csv',pipelineTexto]]) {
    if(relatorio.saidas?.find(x=>x.arquivo===nome)?.sha256!==hash(texto))throw Error(`Saída ${nome} diverge do relatório. Parado.`);
  }
  for(const item of [cnuc,funai])if(relatorio.insumos?.find(x=>x.id===item.id)?.sha256!==item.sha256)throw Error('Fonte diverge do relatório. Parado.');
  if(relatorio.situacao!=='Pronto')throw Error('Relatório de processamento não está pronto.');
  const pipeline=lerCsv(pipelineTexto).linhas;
  const ds=lerCsv(csv).linhas.filter(r=>r.escopo==='principal').map(r=>({id:r.id_tecnico,lon:Number(r.lon),lat:Number(r.lat),celula:`${celulaDecimal(r.lon)}:${celulaDecimal(r.lat)}`}));
  const ucElegivel=ucs.filter(a=>a.atributos.categoria!=='Reserva Particular do Patrimônio Natural'&&a.atributos.situacao==='Ativo'&&a.atributos.limite==='uc');
  const tiElegivel=nacionais.filter(a=>a.atributos.fase_ti!=='Em Estudo');
  const uc=testarAreas(ds,ucElegivel,'cnuc'),ti=testarAreas(ds,tiElegivel,'funai');
  const transformar=(x,fonte)=>JSON.stringify([x.id,fonte,x.codigo,x.pos==='borda'?'borda':'interior']);
  const esperado=new Set([...uc.map(x=>transformar(x,'cnuc')),...ti.map(x=>transformar(x,'funai'))]);
  const recebido=new Set(pipeline.map(x=>JSON.stringify([x.id_tecnico,x.fonte,x.codigo,x.posicao])));
  const ausentes=[...esperado].filter(x=>!recebido.has(x)).length,extras=[...recebido].filter(x=>!esperado.has(x)).length;
  if(esperado.size!==uc.length+ti.length||recebido.size!==pipeline.length||ausentes||extras)throw Error(`Conferência por vínculo divergiu: ausentes ${ausentes}, extras ${extras}, duplicações ${pipeline.length-recebido.size}. Parado.`);
  const porCodigo=(areas)=>Object.fromEntries(areas.map(a=>[a.atributos.terrai_cod,{fase:a.atributos.fase_ti,hash:createHash('sha256').update(JSON.stringify([Object.keys(a.atributos).sort().map(k=>[k,a.atributos[k]]),hashGeometria(a.geometria)])).digest('hex')}]));
  const antigo=testarAreas(ds,antigas,'funai').map(x=>[x.id,x.codigo,x.pos==='borda'?'borda':'interior']),novo=ti.map(x=>[x.id,x.codigo,x.pos==='borda'?'borda':'interior']);
  const celulas=Object.fromEntries(ds.map(d=>[d.id,d.celula]));
  const partes=decompor({antigos:porCodigo(antigas),novos:porCodigo(nacionais),antigo,novo,celulas});
  if(!partes.igual)throw Error('Decomposição TI não coincide vínculo a vínculo com etapa 2. Parado.');
  return {deteccoesAnalisadas:ds.length,vinculos:esperado.size,uc:resumo(uc),protecaoIntegral:resumo(uc.filter(x=>x.classe==='Proteção Integral')),usoSustentavel:resumo(uc.filter(x=>x.classe==='Uso Sustentável')),terraIndigena:resumo(ti),parcelas:partes.parcelas,igual:true,identidade:{cnuc:cnuc.sha256,funai:funai.sha256,deteccoes:hash(csv),vinculos:hash(pipelineTexto)}};
}

export async function conferirTudo() {
  const arquivoFontes='scripts/prototipo/fontes.json',fontes=JSON.parse(await readFile(arquivoFontes,'utf8'));
  const areas=fontes.itens.filter(x=>x.papel==='areas');if(areas.length!==2)throw Error('Fontes da carga incompletas.');
  const arquivos=[arquivoFontes,'local/dados-prototipo/relatorio.json','local/dados-prototipo/saidas/deteccoes.csv','local/dados-prototipo/saidas/deteccoes_areas.csv','local/areas-protegidas/brutos/shp_cnuc_2025_08.zip','local/areas-protegidas/brutos/funai_tis_poligonais_mt.zip',...areas.map(i=>path.join('local/dados-prototipo/brutos',i.destino))];
  const antes=await Promise.all(arquivos.map(sha256Arquivo));
  const etapa1=await etapaExploratoria(),etapa2=await etapaCarga();
  const depois=await Promise.all(arquivos.map(sha256Arquivo));
  if(antes.some((x,i)=>x!==depois[i]))throw Error('Insumo ou saída mudou durante a conferência. Parado.');
  return {etapa1,etapa2};
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  console.log(JSON.stringify(await conferirTudo(),null,2));
}
