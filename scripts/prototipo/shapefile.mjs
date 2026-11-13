// Leitura restrita ao contrato T16. Não grava nem promove arquivos de fonte.
import { inflateRawSync, crc32 } from 'node:zlib';
import { createHash } from 'node:crypto';
import { criarTerritorio, classificarPonto } from '../prova-dados/geo.mjs';
import { classificarArea, validarGeometriaArea } from './areas.mjs';
import { produto, cruza } from './geometria-areas.mjs';

export function decodificarCampo(bytes, encoding) {
  try {
    if (encoding === 'utf-8') return new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    if (encoding !== 'iso-8859-1') throw new Error('codificação não suportada');
    if (bytes.some((b) => b >= 0x80 && b <= 0x9f)) throw new Error('controles C1');
    if (bytes.some((b) => b >= 0x80)) {
      try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); throw new Error('UTF-8 multibyte'); }
      catch (e) { if (!(e instanceof TypeError)) throw e; }
    }
    return Buffer.from(bytes).toString('latin1').trim();
  } catch (e) { throw new Error(`Erro de codificação: ${e.message}`); }
}

export function validarPrj(prj) {
  const normalizado=prj.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('_',' ').replace(/\s+/g,' ').toUpperCase();
  const datum=/DATUM\s*\[\s*"(?:D )?SIRGAS 2000"/.test(normalizado)||/DATUM\s*\[\s*"SISTEMA DE REFERENCIA GEOCENTRICO PARA LAS AMERICAS 2000"/.test(normalizado);
  const esferoide=/SPHEROID\s*\[\s*"GRS 1980"/.test(normalizado),graus=/UNIT\s*\[\s*"DEGREE"\s*,\s*0\.01745329/.test(normalizado);
  if (!/^\s*GEOGCS\s*\[/.test(normalizado) || !/SIRGAS 2000/.test(normalizado) || /PROJCS\s*\[/.test(normalizado) || !datum || !esferoide || !graus) throw new Error('Sistema de referência não é SIRGAS 2000 geográfico.');
}

// O primeiro vértice não basta: uma aresta do buraco pode cruzar o externo.
// A grade examina apenas segmentos com caixas sobrepostas e aceita contato sem cruzamento.
function indiceExterno(anel) {
  const territorio=criarTerritorio({type:'Polygon',coordinates:[anel]}),[x0,y0,x1,y1]=territorio.bbox;
  const n=128,dx=x1-x0||1,dy=y1-y0||1,cell=(v,min,d)=>Math.max(0,Math.min(n-1,Math.floor((v-min)*n/d))),grade=new Map();
  const caixas=(a,b)=>[cell(Math.min(a[0],b[0]),x0,dx),cell(Math.max(a[0],b[0]),x0,dx),cell(Math.min(a[1],b[1]),y0,dy),cell(Math.max(a[1],b[1]),y0,dy)];
  for(let i=1;i<anel.length;i++) {const [a,b]=[anel[i-1],anel[i]],[xa,xb,ya,yb]=caixas(a,b);for(let x=xa;x<=xb;x++)for(let y=ya;y<=yb;y++){const k=x*n+y,lista=grade.get(k)??[];lista.push(i);grade.set(k,lista);}}
  return {anel,territorio,grade,caixas,n};
}
function buracoContido(buraco,indice) {
  const {anel,territorio,grade,caixas,n}=indice;
  for(let i=1;i<buraco.length;i++) {
    const a=buraco[i-1],b=buraco[i],[xa,xb,ya,yb]=caixas(a,b),candidatos=new Set();
    for(let x=xa;x<=xb;x++)for(let y=ya;y<=yb;y++)for(const j of grade.get(x*n+y)??[])candidatos.add(j);
    let contato=false;
    for(const j of candidatos) {
      const c=anel[j-1],d=anel[j];if(!cruza(a,b,c,d))continue;contato=true;
      const p=produto(a,b,c),q=produto(a,b,d),r=produto(c,d,a),s=produto(c,d,b);
      if(p!==0&&q!==0&&r!==0&&s!==0&&(p>0)!==(q>0)&&(r>0)!==(s>0))return false;
    }
    if(contato && [a,b,[(a[0]+b[0])/2,(a[1]+b[1])/2]].some(p=>classificarPonto(...p,territorio)==='fora'))return false;
  }
  return true;
}

export function agruparAneis(aneis) {
  const externos = [], buracos = [];
  for (const a of aneis) {
    if (a.length < 4 || a[0][0] !== a.at(-1)[0] || a[0][1] !== a.at(-1)[1] || a.some(([x,y]) => !Number.isFinite(x) || !Number.isFinite(y))) throw new Error('Anel inválido ou aberto.');
    const [ox, oy] = a[0];
    let area = 0; for (let i = 1; i < a.length; i++) area += (a[i-1][0]-ox)*(a[i][1]-oy) - (a[i][0]-ox)*(a[i-1][1]-oy);
    if (area === 0) throw new Error('Anel com área zero.');
    (area < 0 ? externos : buracos).push(a);
  }
  const poligonos = externos.map((e) => [e]);
  const indices = new Map();
  for (const buraco of buracos) {
    const pertencem = poligonos.filter(([e]) => classificarPonto(...buraco[0], criarTerritorio({ type: 'Polygon', coordinates: [e] })) === 'dentro');
    if (pertencem.length !== 1) throw new Error('Buraco sem externo único.');
    const externo=pertencem[0][0];if(!indices.has(externo))indices.set(externo,indiceExterno(externo));
    if(!buracoContido(buraco,indices.get(externo)))throw new Error('Buraco atravessa o externo.');
    pertencem[0].push(buraco);
  }
  if (!poligonos.length) throw new Error('Sem anel externo.');
  return poligonos;
}

// Lê diretório central, recusando truncamento, nomes duplicados, criptografia e métodos não previstos.
export function extrairMembros(zip, nomes) {
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) if (zip.readUInt32LE(i) === 0x06054b50 && i + 22 + zip.readUInt16LE(i+20) === zip.length) { eocd=i; break; }
  if (eocd < 0 || zip.readUInt16LE(eocd+4) || zip.readUInt16LE(eocd+6) || zip.readUInt16LE(eocd+8) !== zip.readUInt16LE(eocd+10)) throw new Error('ZIP incompleto ou multidisco.');
  const qtd=zip.readUInt16LE(eocd+10), size=zip.readUInt32LE(eocd+12), inicio=zip.readUInt32LE(eocd+16);
  if (inicio + size !== eocd) throw new Error('Diretório ZIP inválido.');
  const vistos=new Set(), achados={}; let p=inicio;
  for (let i=0; i<qtd; i++) {
    if (p+46>eocd || zip.readUInt32LE(p)!==0x02014b50) throw new Error('Diretório ZIP truncado.');
    const flags=zip.readUInt16LE(p+8), metodo=zip.readUInt16LE(p+10), crc=zip.readUInt32LE(p+16), comp=zip.readUInt32LE(p+20), tam=zip.readUInt32LE(p+24), nl=zip.readUInt16LE(p+28), el=zip.readUInt16LE(p+30), cl=zip.readUInt16LE(p+32), local=zip.readUInt32LE(p+42);
    if (p+46+nl+el+cl>eocd) throw new Error('Diretório ZIP truncado.');
    const nome=zip.subarray(p+46,p+46+nl).toString('utf8'); if(vistos.has(nome)) throw new Error(`Nome repetido no ZIP: ${nome}`); vistos.add(nome);
    if (nomes.includes(nome)) {
      if ((flags & 1) || ![0,8].includes(metodo) || local+30>inicio || zip.readUInt32LE(local)!==0x04034b50) throw new Error(`Membro ZIP inválido: ${nome}`);
      const ln=zip.readUInt16LE(local+26), le=zip.readUInt16LE(local+28), start=local+30+ln+le;
      if (start+comp>inicio || zip.subarray(local+30,local+30+ln).toString('utf8')!==nome || zip.readUInt16LE(local+8)!==metodo) throw new Error(`Membro ZIP truncado: ${nome}`);
      const conteudo=metodo===0 ? zip.subarray(start,start+comp) : inflateRawSync(zip.subarray(start,start+comp));
      if (conteudo.length!==tam || crc32(conteudo)!==crc) throw new Error(`Integridade ZIP inválida: ${nome}`);
      achados[nome]=conteudo;
    }
    p+=46+nl+el+cl;
  }
  if (p!==eocd || nomes.some((n)=>!achados[n])) throw new Error('Membro declarado ausente ou diretório inválido.');
  return achados;
}

export function lerDbf(b, encoding, necessarios) {
  if (!Array.isArray(necessarios) || !necessarios.length || new Set(necessarios).size !== necessarios.length) throw new Error('Campos necessários inválidos.');
  if (b.length<33) throw new Error('DBF truncado.');
  const n=b.readUInt32LE(4), h=b.readUInt16LE(8), l=b.readUInt16LE(10); if (h<33 || h+n*l>b.length || l<1) throw new Error('DBF truncado.');
  let off=1; const campos=[];
  for (let p=32; p<h-1 && b[p]!==13; p+=32) {
    if (p+32>h) throw new Error('Campos DBF truncados.');
    const nome=b.subarray(p,p+11).toString('ascii').replace(/\0.*$/,''); const tamanho=b[p+16];
    if (!nome || !tamanho || off+tamanho>l || campos.some(c=>c.nome===nome)) throw new Error('Campo DBF inválido.');
    campos.push({nome,off,tamanho}); off+=tamanho;
  }
  if (b[h-1]!==13 || off!==l) throw new Error('Cabeçalho DBF inválido.');
  for (const nome of necessarios) if (!campos.some(c => c.nome === nome)) throw new Error(`Campo necessário ausente: ${nome}`);
  const selecionados = campos.filter(c => necessarios.includes(c.nome));
  return Array.from({length:n}, (_,i)=>{
    const inicio=h+i*l; if (b[inicio]!==0x20) throw new Error(`Registro DBF ${i+1} apagado ou inválido.`);
    return Object.fromEntries(selecionados.map(({nome,off,tamanho})=>{
      try { return [nome,decodificarCampo(b.subarray(inicio+off,inicio+off+tamanho),encoding)]; }
      catch(e) { throw new Error(`Registro ${i+1}, campo ${nome}: ${e.message}`); }
    }));
  });
}

export function lerShp(b) {
  if (b.length<100 || b.readInt32BE(0)!==9994 || b.readInt32BE(24)*2!==b.length || b.readInt32LE(28)!==1000 || b.readInt32LE(32)!==5) throw new Error('Cabeçalho SHP inválido ou tipo não é Polygon.');
  let p=100; const geometrias=[];
  while(p<b.length) {
    if(p+8>b.length) throw new Error('Registro SHP truncado.');
    const bytes=b.readInt32BE(p+4)*2, start=p+8, end=start+bytes;
    if (bytes<4 || end>b.length) throw new Error('Registro SHP inválido.');
    const tipo=b.readInt32LE(start);
    if (tipo===0 && bytes===4) { geometrias.push(null); p=end; continue; }
    if (tipo!==5 || bytes<44) throw new Error('Registro SHP inválido ou tipo não é Polygon.');
    const partes=b.readInt32LE(start+36), pontos=b.readInt32LE(start+40), base=start+44;
    if(partes<1 || pontos<4 || base+4*partes+16*pontos!==end) throw new Error('Partes SHP inválidas.');
    const indices=Array.from({length:partes},(_,i)=>b.readInt32LE(base+i*4)); indices.push(pontos);
    if(indices[0]!==0 || indices.some((v,i)=>v<0 || v>pontos || (i && v<=indices[i-1]))) throw new Error('Índices SHP inválidos.');
    const pontosBase=base+4*partes;
    const aneis=Array.from({length:partes},(_,i)=>Array.from({length:indices[i+1]-indices[i]},(_,j)=>[b.readDoubleLE(pontosBase+16*(indices[i]+j)),b.readDoubleLE(pontosBase+16*(indices[i]+j)+8)]));
    geometrias.push({type:'MultiPolygon',coordinates:agruparAneis(aneis)}); p=end;
  }
  return geometrias;
}

export function lerShapefile(zip, { membros, encoding, codigo, campos, fonte }) {
  const {shp,dbf,prj,codificacao}=membros, arquivos=extrairMembros(zip,[shp,dbf,prj,...(codificacao?[codificacao]:[])]);
  validarPrj(arquivos[prj].toString('utf8')); const atributos=lerDbf(arquivos[dbf],encoding,campos), geometrias=lerShp(arquivos[shp]);
  if(atributos.length!==geometrias.length) throw new Error('Contagens SHP e DBF divergentes.');
  const codigos=new Set();
  for(const a of atributos) { const valor=a[codigo]; if(!valor || codigos.has(valor)) throw new Error(`Código vazio ou repetido: ${valor ?? ''}`); codigos.add(valor); }
  let declarada=null;
  if(codificacao)try{declarada=new TextDecoder('utf-8',{fatal:true}).decode(arquivos[codificacao]).trim();}catch{declarada='(descritor inválido)';}
  const normalizar=(v)=>v?.toUpperCase().replace(/[^A-Z0-9]/g,'');
  return { registros: atributos.map((a,i)=>({atributos:a,geometria:validarGeometriaArea(geometrias[i],classificarArea(fonte,a))})), hashes:Object.fromEntries(Object.entries(arquivos).map(([k,v])=>[k,createHash('sha256').update(v).digest('hex')])), codificacao:{fixada:encoding,declarada,diverge:declarada!==null&&normalizar(declarada)!==normalizar(encoding)} };
}
