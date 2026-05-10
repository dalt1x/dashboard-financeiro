import { InternalCategory } from "@prisma/client";

export const internalCategoryLabels: Record<InternalCategory, string> = {
  ALIMENTACAO: "Alimentação",
  TRANSPORTE: "Transporte",
  MORADIA: "Moradia",
  LAZER: "Lazer",
  SAUDE: "Saúde",
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
