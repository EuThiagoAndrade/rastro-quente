// Composição local das áreas. A classificação usa somente geometrias integrais.
import { calcularPertencimento } from './areas.mjs';
import { prepararContornoReal, prepararVisaoGeral, orientarGeoJSON } from './geometria-areas.mjs';
import { tentarRepararContorno } from './reparo-exibicao.mjs';

export function prepararAreas(registros,deteccoes) {
  const r=calcularPertencimento(registros,deteccoes),areas=[],ajustes=[];
  for(const area of r.areas) {
    try {
      let real,metodo='arredondamento';
      try { real=prepararContornoReal(area.geometria); }
      catch(e) { if(!e.message.startsWith('Contorno inválido após arredondamento'))throw e; real=tentarRepararContorno(area.geometria);metodo=real.metodo; }
      const geral=prepararVisaoGeral(area.geometria,real);
      const {geometria,...dados}=area;
      areas.push({...dados,geometria_geral:orientarGeoJSON(geral.geometria),geometria_real:orientarGeoJSON(real.geometria)});
      if(real.casas!==5||metodo!=='arredondamento'||geral.tolerancias.some(x=>x!==0.005))ajustes.push({fonte:area.fonte,codigo:area.codigo,precisao:real.casas,metodo,tolerancias:geral.tolerancias,desvios:geral.desvios});
    } catch(e) { throw new Error(`Área ${area.fonte}:${area.codigo}: ${e.message}`, {cause:e}); }
  }
  const jsonBytes=(v)=>Buffer.byteLength(JSON.stringify(v));
  const resumoGeral=areas.map(({geometria_real,...x})=>x);
  return {areas,vinculos:r.vinculos,exclusoes:r.exclusoes,ajustes,medicao:{bytesVisaoGeral:jsonBytes(resumoGeral),bytesAreas:jsonBytes(areas),bytesVinculos:jsonBytes(r.vinculos)}};
}
