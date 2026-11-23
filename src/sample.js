import { defaultSettings } from "./engine.js";

export function papelariaOpening() {
  return {
    cash: "30000.00",
    settings: defaultSettings(),
    items: [
      { id: "caderno", name: "Caderno 96 folhas", sku: "CAD-96", unit: "un", quantity: "100", unitCost: "12.00" },
      { id: "caneta", name: "Caneta esferográfica azul", sku: "CAN-AZ", unit: "un", quantity: "300", unitCost: "1.50" },
      { id: "resma", name: "Resma de papel", sku: "RES-A4", unit: "un", quantity: "80", unitCost: "20.00" },
    ],
    assets: [
      { id: "equip-loja", name: "Equipamentos da loja", kind: "imobilizado", origin: "saldo_inicial", value: "6000.00", usefulLife: "10", residual: "0" },
    ],
    suppliers: [],
    customers: [],
    accounts: [],
  };
}
