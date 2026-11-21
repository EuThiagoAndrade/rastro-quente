/** Distribuição descritiva GMT sobre todos os registros já conferidos do recorte. */
export function distribuicaoTemporal(registros: readonly { data_hora_gmt: string }[]) {
  const dias = new Map<string, number>();
  const meses = new Map<string, number>();
  for (const registro of registros) {
    const dia = registro.data_hora_gmt.slice(0, 10);
    const mes = dia.slice(0, 7);
    dias.set(dia, (dias.get(dia) ?? 0) + 1);
    meses.set(mes, (meses.get(mes) ?? 0) + 1);
  }
  const resumir = (contagens: Map<string, number>) => {
    const totais = [...contagens].sort(([a], [b]) => a.localeCompare(b)).map(([periodo, total]) => ({ periodo, total }));
    const maximo = totais.reduce((maior, item) => Math.max(maior, item.total), 0);
    return { totais, maximo, periodos_maximos: totais.filter((item) => item.total === maximo).map((item) => item.periodo) };
  };
  return { total: registros.length, dias_com_deteccao: dias.size, dias: resumir(dias), meses: resumir(meses) };
}
