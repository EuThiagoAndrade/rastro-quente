import { criarTerritorio, classificarPonto } from '../prova-dados/geo.mjs';
// Reconhecimento dos rótulos segundo T19; não decide pertencimento espacial.
const UF_NOMES = new Set(['ACRE', 'ALAGOAS', 'AMAPA', 'AMAZONAS', 'BAHIA', 'CEARA', 'DISTRITO FEDERAL', 'ESPIRITO SANTO', 'GOIAS', 'MARANHAO', 'MATO GROSSO', 'MATO GROSSO DO SUL', 'MINAS GERAIS', 'PARA', 'PARAIBA', 'PARANA', 'PERNAMBUCO', 'PIAUI', 'RIO DE JANEIRO', 'RIO GRANDE DO NORTE', 'RIO GRANDE DO SUL', 'RONDONIA', 'RORAIMA', 'SANTA CATARINA', 'SAO PAULO', 'SERGIPE', 'TOCANTINS']);
const UF_SIGLAS = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));

export function rotuloCitaMT(fonte, rotulo) {
  if (!['cnuc', 'funai'].includes(fonte) || typeof rotulo !== 'string') throw new Error('Fonte ou rótulo de UF inválido.');
  const normalizado = rotulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim().replace(/\s+/g, ' ');
  const termos = normalizado.split(fonte === 'funai' ? /[,;/\s]+/ : /\s*[,;/]\s*/);
  const conhecidos = fonte === 'funai' ? UF_SIGLAS : UF_NOMES;
  for (const termo of termos) if (!conhecidos.has(termo)) throw new Error(`Termo de UF desconhecido: ${termo}`);
  return termos.includes(fonte === 'funai' ? 'MT' : 'MATO GROSSO');
}

const CATEGORIAS_CNUC = new Set(['Área de Proteção Ambiental', 'Reserva Biológica', 'Reserva de Desenvolvimento Sustentável', 'Floresta', 'Parque', 'Estação Ecológica', 'Monumento Natural', 'Área de Relevante Interesse Ecológico', 'Reserva Particular do Patrimônio Natural', 'Refúgio de Vida Silvestre', 'Reserva Extrativista', 'Reserva de Fauna']);
const GRUPOS_CNUC = new Map([['Proteção Integral','protecao_integral'], ['Uso Sustentável','uso_sustentavel']]);
const FASES_FUNAI = new Set(['Regularizada','Encaminhada RI','Homologada','Declarada','Delimitada','Em Estudo']);

export function classificarArea(fonte, atributos) {
  const conferir = (campo, conjunto) => {
    if (!conjunto.has(atributos[campo])) throw new Error(`Valor desconhecido em ${campo}: ${atributos[campo] ?? '(ausente)'}`);
  };
  if (fonte === 'cnuc') {
    conferir('grupo', GRUPOS_CNUC); conferir('categoria', CATEGORIAS_CNUC);
    conferir('situacao', new Set(['Ativo','Extinta'])); conferir('limite', new Set(['uc','za']));
    if (atributos.categoria === 'Reserva Particular do Patrimônio Natural') return {incluida:false, motivo:'rppn'};
    if (atributos.limite !== 'uc') return {incluida:false, motivo:'zona_amortecimento'};
    if (atributos.situacao !== 'Ativo') return {incluida:false, motivo:'inativa'};
    return {incluida:true, classe:GRUPOS_CNUC.get(atributos.grupo)};
  }
  if (fonte === 'funai') {
    conferir('fase_ti', FASES_FUNAI);
    return atributos.fase_ti === 'Em Estudo' ? {incluida:false, motivo:'em_estudo'} : {incluida:true, classe:'terra_indigena'};
  }
  throw new Error('Fonte desconhecida.');
}

export function validarGeometriaArea(geometria, classificacao) {
  if (geometria === null && classificacao.incluida) throw new Error('Área elegível sem geometria Polygon.');
  return geometria;
}

// O teste usa polígonos integrais; o rótulo só controla a retenção posterior.
export function calcularPertencimento(registros, deteccoes) {
  const excluidas = {}, candidatas = [];
  const contar = (motivo) => { excluidas[motivo] = (excluidas[motivo] ?? 0) + 1; };
  for (const {fonte, atributos:a, geometria} of registros) {
    const classificacao = classificarArea(fonte, a);
    validarGeometriaArea(geometria, classificacao);
    if (!classificacao.incluida) { contar(classificacao.motivo); continue; }
    const cnuc = fonte === 'cnuc';
    const codigo = cnuc ? a.cd_cnuc : a.terrai_cod;
    if (!codigo || !geometria) throw new Error('Área sem código ou geometria.');
    const rotulo = rotuloCitaMT(fonte, cnuc ? a.uf : a.uf_sigla);
    const dados = {fonte,codigo,nome:cnuc ? a.nome_uc : a.terrai_nom,classe:classificacao.classe,
      categoria:cnuc ? a.categoria : null, fase:cnuc ? null : a.fase_ti,
      modalidade:cnuc ? null : a.modalidade, esfera:cnuc ? a.esfera : null, qualidade:cnuc ? a.quali_pol : null};
    candidatas.push({dados,geometria,territorio:criarTerritorio(geometria),rotulo,vinculada:false});
  }
  const vinculos=[];
  for(const d of deteccoes) {
    if (!d.id_tecnico || !Number.isFinite(Number(d.longitude)) || !Number.isFinite(Number(d.latitude))) throw new Error('Detecção inválida.');
    for(const area of candidatas) {
      const posicao=classificarPonto(Number(d.longitude),Number(d.latitude),area.territorio);
      if (posicao==='fora') continue;
      area.vinculada=true;
      vinculos.push({id_tecnico:d.id_tecnico,fonte:area.dados.fonte,codigo:area.dados.codigo,posicao:posicao==='borda'?'borda':'interior'});
    }
  }
  const areas=[];
  for(const a of candidatas) {
    if (!a.rotulo && !a.vinculada) { contar('fora_mt_sem_deteccao'); continue; }
    areas.push({...a.dados,origem_rotulo:a.rotulo?'rotulo':'vinculo',geometria:a.geometria});
  }
  return {areas,vinculos,exclusoes:excluidas};
}
