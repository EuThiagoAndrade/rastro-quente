// Ciclo 012 (issue #113) — rota `/api/interpretar` com provedor falso e cliente Supabase falso (sem rede): desligada,
// método, origem, sessão, eco da carga, limites do pedido, saída fora do esquema e o que vai ao modelo e ao log.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tratarInterpretar } from '../../servidor/interpretar.ts';
import { ErroHttp } from '../../servidor/resposta.ts';

const IDENTIDADE = 'a'.repeat(64);
const CARGA = {
  id: 7, identidade: IDENTIDADE, satelite: 'AQUA_M-T', janela_inicio: '2026-08-01T00:00:00Z', janela_fim: '2026-11-01T00:00:00Z',
  envelope_inicio: null, envelope_fim: null, fuso_sensibilidade: 'America/Cuiaba', metodo: {}, total_principal: 0, total_envelope: 0,
  total_municipios: 2, total_disponibilidade: 0, publicada_em: '2026-11-01T00:00:00Z',
};
const MUNICIPIOS = [{ codigo: 11, nome: 'Município Alfa' }, { codigo: 22, nome: 'Município Beta' }];
const CONFIG = { habilitada: true, supabaseUrl: 'http://127.0.0.1:54321', chavePublica: 'publica', gemini: { chave: 'ficticia', modelo: 'gemini-3.1-flash-lite' }, origens: [] };
const BOA = {
  tipo: 'consulta', inicio: '2026-08-01', fim: '2026-08-31', municipio_codigo: 22, lente: 'nenhuma', classe_area: 'nenhuma',
  animar: true, comparar_modo: 'nenhuma', b_inicio: '', b_fim: '', municipio_b: 0, motivo: 'Evolução pedida.',
};

/** Cliente com a mesma superfície usada pela rota: auth.getUser e consultas encadeadas a tabelas. */
function clienteFalso({ usuario = { role: 'authenticated' } } = {}) {
  const tabelas = { publicacao_vigente: [{ carga_id: CARGA.id }], cargas: [CARGA], municipios: MUNICIPIOS };
  const consulta = (dados) => {
    const q = { select: () => q, eq: () => q, order: () => q, then: (ok, erro) => Promise.resolve({ data: dados, error: null, status: 200 }).then(ok, erro) };
    return q;
  };
  return {
    auth: { getUser: async () => (usuario ? { data: { user: usuario }, error: null } : { data: { user: null }, error: { message: 'jwt' } }) },
    from: (t) => consulta(tabelas[t]),
  };
}

function cenario({ config = CONFIG, usuario, saida = JSON.stringify(BOA), falha = null } = {}) {
  const r = { chamadas: [], logs: [] };
  const deps = {
    config,
    criarCliente: () => clienteFalso(usuario === undefined ? {} : { usuario }),
    provedor: () => ({
      modelo: 'gemini-3.1-flash-lite',
      async interagir(i) {
        r.chamadas.push(i);
        if (falha) throw falha;
        return { passos: [], chamadas: [], texto: saida, uso: { entrada: 100, saida: 20, raciocinio: 0 } };
      },
    }),
    registrar: (e) => r.logs.push(e),
  };
  return { r, deps };
}

const pedido = (corpo, { metodo = 'POST', origem = null, token = 'jwt.de.teste' } = {}) => new Request('https://rastro.exemplo/api/interpretar', {
  method: metodo,
  headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(origem ? { origin: origem } : {}) },
  ...(metodo === 'POST' ? { body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo) } : {}),
});
const valido = { pergunta: 'Como as detecções evoluíram no Município Beta em agosto?', carga: { id: 7, identidade: IDENTIDADE } };

test('desligada: 503 em qualquer método, sem ler corpo nem chamar o provedor', async () => {
  const { r, deps } = cenario({ config: { habilitada: false } });
  for (const metodo of ['GET', 'POST']) {
    const resp = await tratarInterpretar(pedido(valido, { metodo }), deps);
    assert.equal(resp.status, 503);
    assert.equal((await resp.json()).erro, 'ia_desabilitada');
  }
  assert.equal(r.chamadas.length, 0);
});

test('método, origem e sessão negados antes do provedor', async () => {
  const { r, deps } = cenario();
  assert.equal((await tratarInterpretar(pedido(valido, { metodo: 'GET' }), deps)).status, 405);
  assert.equal((await tratarInterpretar(pedido(valido, { origem: 'https://outra.exemplo' }), deps)).status, 403);
  assert.equal((await tratarInterpretar(pedido(valido, { token: null }), deps)).status, 401);
  const semUsuario = cenario({ usuario: null });
  assert.equal((await tratarInterpretar(pedido(valido), semUsuario.deps)).status, 401);
  const anonimo = cenario({ usuario: { role: 'anon' } });
  assert.equal((await tratarInterpretar(pedido(valido), anonimo.deps)).status, 401);
  assert.equal(r.chamadas.length + semUsuario.r.chamadas.length + anonimo.r.chamadas.length, 0);
});

test('pedido fechado: pergunta longa, campos extras e carga de outra versão', async () => {
  const { r, deps } = cenario();
  for (const corpo of [
    { ...valido, pergunta: 'x'.repeat(301) }, { ...valido, pergunta: '   ' }, { ...valido, extra: 1 },
    { ...valido, carga: { ...valido.carga, total: 3 } }, { ...valido, carga: { id: 7, identidade: 'z' } }, 'não é json',
  ]) {
    const resp = await tratarInterpretar(pedido(corpo), deps);
    assert.equal(resp.status, 400, JSON.stringify(corpo));
  }
  const outra = await tratarInterpretar(pedido({ ...valido, carga: { id: 8, identidade: IDENTIDADE } }), deps);
  assert.equal(outra.status, 409);
  assert.equal((await outra.json()).erro, 'versao_substituida');
  assert.equal(r.chamadas.length, 0);
});

test('interpretação válida: uma chamada, só pergunta, janela e municípios ao modelo; log sem a pergunta', async () => {
  const { r, deps } = cenario();
  const resp = await tratarInterpretar(pedido(valido), deps);
  assert.equal(resp.status, 200);
  const corpo = await resp.json();
  assert.deepEqual(corpo.interpretacao, BOA);
  assert.equal(r.chamadas.length, 1);
  const [i] = r.chamadas;
  assert.match(i.sistema, /2026-08-01 a 2026-10-31/);
  assert.match(i.sistema, /22: Município Beta/);
  assert.deepEqual(i.entrada, [{ type: 'user_input', content: [{ type: 'text', text: valido.pergunta }] }]);
  assert.equal(i.ferramentas, undefined);
  assert.equal(i.esquema.additionalProperties, false);
  assert.ok(!JSON.stringify(r.logs).includes('Município Beta em agosto'));
  assert.deepEqual(r.logs.at(-1), { ...r.logs.at(-1), etapa: 'concluida', codigo: '200', tokens: 120 });
});

test('saída fora do esquema e falha do provedor não chegam à tela', async () => {
  const texto = cenario({ saida: 'isto não é JSON' });
  const r1 = await tratarInterpretar(pedido(valido), texto.deps);
  assert.equal(r1.status, 502);
  assert.equal((await r1.json()).erro, 'saida_invalida');
  const lista = cenario({ saida: '[1,2]' });
  assert.equal((await tratarInterpretar(pedido(valido), lista.deps)).status, 502);
  const cota = cenario({ falha: new ErroHttp('cota_provedor') });
  const r3 = await tratarInterpretar(pedido(valido), cota.deps);
  assert.equal(r3.status, 429);
  assert.equal((await r3.json()).erro, 'cota_provedor');
});
