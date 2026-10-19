import type { PhaseMatch } from '@padel-cantabria/database';

export function presentPhase(phase: PhaseMatch) {
  return {
    league: phase.league_name,
    gender: phase.gender_label,
    gender_code: phase.gender,
    phase: phase.phase_label,
    phase_value: phase.phase,
  };
}

export function presentPhases(phases: PhaseMatch[]) {
  return phases.map(presentPhase);
}
