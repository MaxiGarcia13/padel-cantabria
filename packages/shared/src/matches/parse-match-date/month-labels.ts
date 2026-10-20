const MONTH_BY_LABEL: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dic: 12,
};

export function parseMonth(label: string): number | null {
  const month = MONTH_BY_LABEL[label.trim().toLowerCase().slice(0, 3)];

  return month ?? null;
}
