import { InternalCategory } from "@prisma/client";

const categoryMap: Array<{
  match: RegExp;
  value: InternalCategory;
}> = [
  { match: /(grocer|food|restaurant|coffee|meal|dining)/i, value: "ALIMENTACAO" },
  { match: /(transport|gas|fuel|uber|lyft|taxi|transit|parking)/i, value: "TRANSPORTE" },
  { match: /(rent|mortgage|housing|home|utilities|internet|phone)/i, value: "MORADIA" },
  { match: /(cinema|movie|entertainment|stream|game|travel|hotel)/i, value: "LAZER" },
  { match: /(pharmacy|doctor|medical|health|dental|fitness)/i, value: "SAUDE" },
  { match: /(shopping|clothing|retail|electronics|amazon)/i, value: "COMPRAS" },
  { match: /(payroll|salary|income|deposit|bonus)/i, value: "SALARIO" },
  { match: /(transfer|payment|wire|credit card|bank fee)/i, value: "TRANSFERENCIAS" },
];

export function mapPlaidCategoryToInternalCategory(input?: {
  primary?: string | null;
  detailed?: string | null;
  name?: string | null;
}) {
  const searchable = [input?.primary, input?.detailed, input?.name]
    .filter(Boolean)
    .join(" ");

  const match = categoryMap.find((item) => item.match.test(searchable));

  return match?.value ?? InternalCategory.OUTROS;
}
