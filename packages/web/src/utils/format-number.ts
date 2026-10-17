const NUMBER_FORMATTER = new Intl.NumberFormat('es-ES', {
  useGrouping: true,
});

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}
