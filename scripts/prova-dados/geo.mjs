// Ponto no polígono por ray casting (D2). Coordenadas [longitude, latitude].
// Ponto exatamente sobre uma borda (inclusive de um buraco) é classificado como 'borda' e contado como dentro por quem usa.

function noSegmento(px, py, [ax, ay], [bx, by]) {
  const cruzado = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  return cruzado === 0 && px >= Math.min(ax, bx) && px <= Math.max(ax, bx) && py >= Math.min(ay, by) && py <= Math.max(ay, by);
}

function dentroDoAnel(px, py, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
    const [ax, ay] = anel[j];
    const [bx, by] = anel[i];
    if (ay > py !== by > py && px < ax + ((py - ay) * (bx - ax)) / (by - ay)) dentro = !dentro;
  }
  return dentro;
}

function bordaDoAnel(px, py, anel) {
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
    if (noSegmento(px, py, anel[j], anel[i])) return true;
  }
  return false;
}

// Aceita GeoJSON Feature, FeatureCollection, Polygon ou MultiPolygon.
export function criarTerritorio(geojson) {
  const geometrias = [];
  const coletar = (g) => {
    if (g.type === 'FeatureCollection') g.features.forEach(coletar);
    else if (g.type === 'Feature') coletar(g.geometry);
    else if (g.type === 'Polygon') geometrias.push(g.coordinates);
    else if (g.type === 'MultiPolygon') geometrias.push(...g.coordinates);
    else throw new Error(`Geometria não suportada: ${g.type}`);
  };
  coletar(geojson);
  if (!geometrias.length) throw new Error('GeoJSON sem polígonos.');
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  let vertices = 0;
  for (const aneis of geometrias) {
    for (const anel of aneis) {
      for (const [x, y] of anel) {
        vertices += 1;
        bbox[0] = Math.min(bbox[0], x);
        bbox[1] = Math.min(bbox[1], y);
        bbox[2] = Math.max(bbox[2], x);
        bbox[3] = Math.max(bbox[3], y);
      }
    }
  }
  return { poligonos: geometrias, bbox, vertices };
}

// 'dentro', 'borda' ou 'fora'.
export function classificarPonto(lon, lat, territorio) {
  const [oeste, sul, leste, norte] = territorio.bbox;
  if (lon < oeste || lon > leste || lat < sul || lat > norte) return 'fora';
  for (const [externo, ...buracos] of territorio.poligonos) {
    if (bordaDoAnel(lon, lat, externo) || buracos.some((b) => bordaDoAnel(lon, lat, b))) return 'borda';
    if (dentroDoAnel(lon, lat, externo) && !buracos.some((b) => dentroDoAnel(lon, lat, b))) return 'dentro';
  }
  return 'fora';
}

// Distância aproximada (metros, equiretangular em torno do ponto) do ponto ao limite do território. Só para escolher casos; não entra em contagem.
export function distanciaAoLimiteM(lon, lat, territorio) {
  const mPorGrauLat = 110_574;
  const mPorGrauLon = 111_320 * Math.cos((lat * Math.PI) / 180);
  let menor = Infinity;
  for (const aneis of territorio.poligonos) {
    for (const anel of aneis) {
      for (let i = 0, j = anel.length - 1; i < anel.length; j = i, i += 1) {
        const ax = (anel[j][0] - lon) * mPorGrauLon;
        const ay = (anel[j][1] - lat) * mPorGrauLat;
        const bx = (anel[i][0] - lon) * mPorGrauLon;
        const by = (anel[i][1] - lat) * mPorGrauLat;
        const dx = bx - ax;
        const dy = by - ay;
        const comp = dx * dx + dy * dy;
        const t = comp === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / comp));
        menor = Math.min(menor, Math.hypot(ax + t * dx, ay + t * dy));
      }
    }
  }
  return menor;
}
