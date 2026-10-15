import type { Gender } from '@padel-cantabria/database';

const MASCULINE_PATTERN = /masculino/i;

export function getDefaultGenderValue(genders: Gender[]): string {
  return (
    genders.find(
      (gender) =>
        MASCULINE_PATTERN.test(gender.label)
        || MASCULINE_PATTERN.test(gender.value),
    )?.value ?? ''
  );
}
