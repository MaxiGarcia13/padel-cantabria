import type { Gender } from '@padel-cantabria/database';
import { normalizeGender } from '@padel-cantabria/shared';

export function getDefaultGenderValue(genders: Gender[]): string {
  return (
    genders.find(
      (gender) =>
        normalizeGender(gender.label) === 'M'
        || normalizeGender(gender.value) === 'M',
    )?.value ?? ''
  );
}
