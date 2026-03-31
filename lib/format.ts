export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
}
