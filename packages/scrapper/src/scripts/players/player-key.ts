export function playerKey(
  teamId: number,
  surname: string,
  name: string,
): string {
  return `${teamId}\0${surname}\0${name}`;
}
