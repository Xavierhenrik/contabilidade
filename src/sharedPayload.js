// Formato da linha única no Supabase. schema continua 1.
// settings é opcional: arquivos gravados antes desta chave ainda carregam.

export function payloadFor(data, cash, entries, settings) {
  const payload = { schema: 1, exercise: 2026, data, cash: String(cash), entries };
  if (settings && typeof settings === "object" && !Array.isArray(settings)) payload.settings = settings;
  return payload;
}

export function apply(row, { setData, setCash, setEntries, setSettings }) {
  const dados = row.dados;
  setData(dados.data);
  setCash(String(dados.cash));
  setEntries(dados.entries);
  if (setSettings && dados.settings && typeof dados.settings === "object" && !Array.isArray(dados.settings)) {
    setSettings((current) => ({ ...current, ...dados.settings }));
  }
  return Number(row.versao);
}
