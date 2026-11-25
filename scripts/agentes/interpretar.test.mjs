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

// --- Ciclo 013 (issue #115): nova tentativa na sobrecarga, modelo reserva e prazo único ---------------------------

const PRINCIPAL = 'gemini-3.1-flash-lite';
const RESERVA = 'gemini-3.5-flash';
const COM_RESERVA = { ...CONFIG, gemini: { ...CONFIG.gemini, modeloReserva: RESERVA } };
const SOBRE = () => new ErroHttp('provedor_indisponivel', 'sobrecarga');

/**
 * Provedores roteirizados por modelo: cada item da fila é `'ok'` ou um erro a lançar. Relógio simulado: cada chamada
 * consome `msPorChamada` e a espera consome o que pedir, sem tempo real.
 */
function roteiro({ config = COM_RESERVA, principal = [], reserva = [], msPorChamada = 1_000 } = {}) {
  const r = { chamadas: [], esperas: [], logs: [] };
  let relogio = 0;
  const filas = { [PRINCIPAL]: [...principal], [RESERVA]: [...reserva] };
  const deps = {
    config,
    criarCliente: () => clienteFalso(),
    provedor: (_config, modelo) => {
      const m = modelo ?? PRINCIPAL;
      return {
        modelo: m,
        async interagir() {
          r.chamadas.push(m);
          relogio += msPorChamada;
          const passo = filas[m].shift() ?? 'ok';
          if (passo !== 'ok') throw passo();
          return { passos: [], chamadas: [], texto: JSON.stringify(BOA), uso: { entrada: 100, saida: 20, raciocinio: 0 } };
        },
      };
    },
    registrar: (e) => r.logs.push(e),
    agora: () => relogio,
    esperar: async (ms) => { r.esperas.push(ms); relogio += ms; },
  };
  return { r, deps };
}

test('503 e depois 200 no principal: a nova tentativa interpreta, depois de cerca de 2 s', async () => {
  const { r, deps } = roteiro({ principal: [SOBRE] });
  const resp = await tratarInterpretar(pedido(valido), deps);
  assert.equal(resp.status, 200);
  const corpo = await resp.json();
  assert.equal(corpo.modelo, PRINCIPAL);
  assert.equal(corpo.reserva, false);
  assert.deepEqual(r.chamadas, [PRINCIPAL, PRINCIPAL]);
  assert.deepEqual(r.esperas, [2_000]);
  assert.deepEqual(r.logs.at(-1), { ...r.logs.at(-1), etapa: 'concluida', modelo: PRINCIPAL, tentativas: 2 });
});

test('503 duas vezes no principal e 200 na reserva: a reserva interpreta e o modelo usado é informado', async () => {
  const { r, deps } = roteiro({ principal: [SOBRE, SOBRE] });
  const resp = await tratarInterpretar(pedido(valido), deps);
  assert.equal(resp.status, 200);
  const corpo = await resp.json();
  assert.deepEqual(corpo.interpretacao, BOA);
  assert.equal(corpo.modelo, RESERVA);
  assert.equal(corpo.reserva, true);
  assert.deepEqual(r.chamadas, [PRINCIPAL, PRINCIPAL, RESERVA]);
  assert.deepEqual(r.logs.at(-1), { ...r.logs.at(-1), etapa: 'concluida', codigo: '200', modelo: RESERVA, tentativas: 3 });
  assert.ok(!JSON.stringify(r.logs).includes('Município Beta em agosto'));
});

test('503 em todas: provedor_sobrecarregado', async () => {
  const { r, deps } = roteiro({ principal: [SOBRE, SOBRE], reserva: [SOBRE] });
  const resp = await tratarInterpretar(pedido(valido), deps);
  assert.equal(resp.status, 503);
  assert.equal((await resp.json()).erro, 'provedor_sobrecarregado');
  assert.deepEqual(r.chamadas, [PRINCIPAL, PRINCIPAL, RESERVA]);
});

test('reserva desligada (variável ausente): 503 duas vezes no principal responde provedor_sobrecarregado', async () => {
  const { r, deps } = roteiro({ config: CONFIG, principal: [SOBRE, SOBRE] });
  const resp = await tratarInterpretar(pedido(valido), deps);
  assert.equal(resp.status, 503);
  assert.equal((await resp.json()).erro, 'provedor_sobrecarregado');
  assert.deepEqual(r.chamadas, [PRINCIPAL, PRINCIPAL]);
});

test('429, saída inválida e outros erros não repetem nem acionam a reserva', async () => {
  const cota = roteiro({ principal: [() => new ErroHttp('cota_provedor')] });
  const r1 = await tratarInterpretar(pedido(valido), cota.deps);
  assert.equal(r1.status, 429);
  assert.deepEqual(cota.r.chamadas, [PRINCIPAL]);
  assert.deepEqual(cota.r.esperas, []);
  const outro = roteiro({ principal: [() => new ErroHttp('provedor_indisponivel')] });
  const r2 = await tratarInterpretar(pedido(valido), outro.deps);
  assert.equal((await r2.json()).erro, 'provedor_indisponivel');
  assert.deepEqual(outro.r.chamadas, [PRINCIPAL]);
  const tempo = roteiro({ principal: [() => new DOMException('tempo', 'TimeoutError')] });
  const r3 = await tratarInterpretar(pedido(valido), tempo.deps);
  assert.equal((await r3.json()).erro, 'tempo_esgotado');
  assert.deepEqual(tempo.r.chamadas, [PRINCIPAL]);
  // Reserva que devolve 429 não vira sobrecarga.
  const cotaReserva = roteiro({ principal: [SOBRE, SOBRE], reserva: [() => new ErroHttp('cota_provedor')] });
  assert.equal((await tratarInterpretar(pedido(valido), cotaReserva.deps)).status, 429);
});

test('prazo único de 20 s: sem tempo útil, nenhuma chamada nova começa', async () => {
  // Cada chamada leva 9 s: principal (9 s) + espera (2 s) + nova tentativa (9 s) = 20 s; a reserva não cabe.
  const { r, deps } = roteiro({ principal: [SOBRE, SOBRE], msPorChamada: 9_000 });
  const resp = await tratarInterpretar(pedido(valido), deps);
  assert.equal((await resp.json()).erro, 'provedor_sobrecarregado');
  assert.deepEqual(r.chamadas, [PRINCIPAL, PRINCIPAL]);
  // Principal lento (16 s): não sobra tempo para a espera e a nova tentativa, mas a reserva ainda cabe.
  const lento = roteiro({ principal: [SOBRE], msPorChamada: 16_000 });
  const r2 = await tratarInterpretar(pedido(valido), lento.deps);
  assert.equal((await r2.json()).modelo, RESERVA);
  assert.deepEqual(lento.r.esperas, []);
  assert.deepEqual(lento.r.chamadas, [PRINCIPAL, RESERVA]);
});
