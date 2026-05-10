import { InternalCategory } from "@prisma/client";

export const internalCategoryLabels: Record<InternalCategory, string> = {
  ALIMENTACAO: "Alimentacao",
  TRANSPORTE: "Transporte",
  MORADIA: "Moradia",
  LAZER: "Lazer",
  SAUDE: "Saude",
  COMPRAS: "Compras",
  SALARIO: "Salario",
  TRANSFERENCIAS: "Transferencias",
  OUTROS: "Outros",
};

export const categoryOptions = Object.entries(internalCategoryLabels).map(
  ([value, label]) => ({
    value: value as InternalCategory,
    label,
  }),
);
