import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { apply, payloadFor } from "../src/sharedPayload.js";

const NEW_KINDS = ["devolucao", "pagamento_emprestimo", "pagamento_encargo", "dividendos", "reserva", "integralizacao", "reducao_capital", "aquisicao"];

test("payload compartilhado inclui settings e os tipos novos, e dados antigos carregam", () => {
  const settings = {
    companyName: "Papelaria",
    warrantyRatePercent: "2",
    inventoryMethod: "peps",
    depreciationMethod: "linear",
    exhaustion: "nao_se_aplica",
  };
  const data = { items: [], suppliers: [], customers: [], assets: [], accounts: [] };
  const entries = NEW_KINDS.map((kind, index) => ({ id: `novo-${index}`, kind, date: "2026-03-01", totalCents: 100 }));
  const payload = payloadFor(data, "30000", entries, settings);

  assert.equal(payload.schema, 1);
  assert.equal(payload.exercise, 2026);
  assert.equal(payload.cash, "30000");
  assert.deepEqual(payload.settings, settings);
  assert.deepEqual(payload.entries.map((entry) => entry.kind), NEW_KINDS);

  const sql = readFileSync("supabase/migrations/20261122_shared_accounting_settings_and_events.sql", "utf8");
  for (const kind of NEW_KINDS) assert.ok(sql.includes(`'${kind}'`), kind);
  assert.match(sql, /p_dados->'settings'/);

  const loaded = {};
  let settingsCalls = 0;
  apply({
    versao: 4,
    dados: { schema: 1, exercise: 2026, cash: 1500, data: { items: [{ id: "i" }] }, entries: [{ id: "v", kind: "venda" }] },
  }, {
    setData: (value) => { loaded.data = value; },
    setCash: (value) => { loaded.cash = value; },
    setEntries: (value) => { loaded.entries = value; },
    setSettings: () => { settingsCalls += 1; },
  });
  assert.equal(settingsCalls, 0);
  assert.equal(loaded.cash, "1500");
  assert.deepEqual(loaded.data, { items: [{ id: "i" }] });
  assert.deepEqual(loaded.entries, [{ id: "v", kind: "venda" }]);

  apply({ versao: 5, dados: { ...payload, settings } }, {
    setData: () => {},
    setCash: () => {},
    setEntries: () => {},
    setSettings: (updater) => { loaded.merged = updater({ companyName: "Papelaria", warrantyRatePercent: "2" }); },
  });
  assert.equal(loaded.merged.inventoryMethod, "peps");
  assert.equal(loaded.merged.companyName, "Papelaria");
  assert.equal(loaded.merged.warrantyRatePercent, "2");
});
