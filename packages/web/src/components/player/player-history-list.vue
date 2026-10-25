<script setup lang="ts">
import type { PlayerCourtAppearanceWithOpponent } from '@/types/team-player-page';
import { buildMatchPath } from '@/routes';

defineProps<{
  courts: PlayerCourtAppearanceWithOpponent[];
}>();

function matchHref(court: PlayerCourtAppearanceWithOpponent): string {
  return buildMatchPath(
    {
      league_id: court.league_id,
      gender: court.gender,
      phase: court.phase,
      category: court.category,
    },
    court.match_id,
  );
}

function outcomeLabel(outcome: PlayerCourtAppearanceWithOpponent['outcome']): string {
  if (outcome === 'won') {
    return 'Ganado';
  }

  if (outcome === 'lost') {
    return 'Perdido';
  }

  return '—';
}

function setsLabel(court: PlayerCourtAppearanceWithOpponent): string {
  if (court.sets_for == null || court.sets_against == null) {
    return '—';
  }

  return `${court.sets_for}-${court.sets_against}`;
}

function venueLabel(isHome: boolean): string {
  return isHome ? 'Local' : 'Visitante';
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-lg font-semibold tracking-tight text-foreground">
      Historial
    </h2>

    <p
      v-if="courts.length === 0"
      class="text-sm text-muted"
    >
      No hay partidos disponibles.
    </p>

    <ul
      v-else
      class="flex flex-col gap-2"
    >
      <li
        v-for="court in courts"
        :key="`${court.match_id}-${court.game_number}`"
      >
        <a
          :href="matchHref(court)"
          class="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-col gap-2">
            <span class="font-medium text-foreground">
              {{ court.opponent_team_name ?? 'Rival' }}
            </span>
            <span class="text-sm text-muted">
              {{ court.date ?? 'Sin fecha' }}
              · {{ venueLabel(court.is_home) }}
              <template v-if="court.partner">
                · con {{ court.partner.name }} {{ court.partner.surname }}
              </template>
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="font-medium text-foreground">
              {{ outcomeLabel(court.outcome) }}
            </span>
            <span class="text-muted">
              {{ setsLabel(court) }}
            </span>
          </div>
        </a>
      </li>
    </ul>
  </section>
</template>
