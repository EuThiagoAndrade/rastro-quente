// Shapefiles fictícios em memória para testes, sem arquivos geográficos versionados.
import { crc32 } from 'node:zlib';

export function dbfFicticio(registros,campos,encoding='utf8') {
  const h=33+32*campos.length,l=1+254*campos.length,b=Buffer.alloc(h+l*registros.length+1);
  b[0]=3;b.writeUInt32LE(registros.length,4);b.writeUInt16LE(h,8);b.writeUInt16LE(l,10);
  campos.forEach((nome,i)=>{if(Buffer.byteLength(nome)>10)throw Error('Nome DBF longo.');b.write(nome,32+i*32,'ascii');b[32+i*32+11]=67;b[32+i*32+16]=254});b[h-1]=13;
  for(let i=0;i<registros.length;i++) {const inicio=h+i*l;b[inicio]=32;b.fill(32,inicio+1,inicio+l);campos.forEach((nome,j)=>{const valor=registros[i][nome]??'',v=Buffer.isBuffer(valor)?valor:Buffer.from(String(valor),encoding);if(v.length>254)throw Error('Valor fictício longo.');v.copy(b,inicio+1+j*254)})}
  b[h+l*registros.length]=0x1a;return b;
}
export function shpFicticio(geometrias) {
  const records=[];
  for(const [idx,geo] of geometrias.entries()) {
    let conteudo;
    if(geo===null){conteudo=Buffer.alloc(4);conteudo.writeInt32LE(0,0)}
    else {
      const rings=geo.coordinates.flatMap(poly=>poly.map((r,i)=>{
        let a=0;for(let j=1;j<r.length;j++)a+=r[j-1][0]*r[j][1]-r[j][0]*r[j-1][1];
        return (i===0 ? a<0 : a>0)?r:[...r].reverse();
      })), pontos=rings.flat();conteudo=Buffer.alloc(44+4*rings.length+16*pontos.length);conteudo.writeInt32LE(5,0);
      const xs=pontos.map(p=>p[0]),ys=pontos.map(p=>p[1]);[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)].forEach((v,i)=>conteudo.writeDoubleLE(v,4+8*i));
      conteudo.writeInt32LE(rings.length,36);conteudo.writeInt32LE(pontos.length,40);let pos=0;
      for(let i=0;i<rings.length;i++){conteudo.writeInt32LE(pos,44+i*4);pos+=rings[i].length}
      const inicio=44+4*rings.length;pontos.forEach(([x,y],i)=>{conteudo.writeDoubleLE(x,inicio+i*16);conteudo.writeDoubleLE(y,inicio+i*16+8)});
    }
    const cab=Buffer.alloc(8);cab.writeInt32BE(idx+1,0);cab.writeInt32BE(conteudo.length/2,4);records.push(cab,conteudo);
  }
  const h=Buffer.alloc(100),tamanho=100+records.reduce((n,b)=>n+b.length,0);h.writeInt32BE(9994,0);h.writeInt32BE(tamanho/2,24);h.writeInt32LE(1000,28);h.writeInt32LE(5,32);return Buffer.concat([h,...records]);
}
export function zipFicticio(membros) {
  const locais=[],centrais=[];let off=0;
  for(const [nome,bytes] of membros) {
    const nomeB=Buffer.from(nome),crc=crc32(bytes),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt32LE(crc,14);h.writeUInt32LE(bytes.length,18);h.writeUInt32LE(bytes.length,22);h.writeUInt16LE(nomeB.length,26);
    locais.push(h,nomeB,bytes);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(bytes.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(nomeB.length,28);c.writeUInt32LE(off,42);centrais.push(c,nomeB);off+=h.length+nomeB.length+bytes.length;
  }
  const central=Buffer.concat(centrais),fim=Buffer.alloc(22);fim.writeUInt32LE(0x06054b50,0);fim.writeUInt16LE(membros.length,8);fim.writeUInt16LE(membros.length,10);fim.writeUInt32LE(central.length,12);fim.writeUInt32LE(off,16);return Buffer.concat([...locais,central,fim]);
}
export function fixtureShapefile(base,registros,campos,encoding='utf8',adicionais=[]) {
  return zipFicticio([[`${base}.shp`,shpFicticio(registros.map(r=>r.geometria))],[`${base}.dbf`,dbfFicticio(registros.map(r=>r.atributos),campos,encoding)],[`${base}.prj`,Buffer.from('GEOGCS["SIRGAS 2000",DATUM["D_SIRGAS_2000",SPHEROID["GRS 1980",6378137,298.257222101]],UNIT["degree",0.0174532925199433]]')],...adicionais]);
}
