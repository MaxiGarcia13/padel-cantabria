<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import type { PlayerPartnerStats } from '@padel-cantabria/shared';
import {
  formatStandingValue,
  formatWinAverage,
} from '@padel-cantabria/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildPlayerPath } from '@/routes';

const props = defineProps<{
  partners: PlayerPartnerStats[];
  teamId: number;
  category: CategoryKey;
}>();

function partnerHref(partner: PlayerPartnerStats['partner']): string {
  return buildPlayerPath(props.category, props.teamId, partner);
}

function partnerName(partner: PlayerPartnerStats['partner']): string {
  return `${partner.name} ${partner.surname}`;
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-lg font-semibold tracking-tight text-foreground">
      Parejas
    </h2>

    <p
      v-if="partners.length === 0"
      class="text-sm text-muted"
    >
      No hay parejas disponibles.
    </p>

    <Table
      v-else
      class="min-w-max"
    >
      <TableHeader>
        <TableRow>
          <TableHead class="max-w-72 min-w-56">
            Compañero
          </TableHead>
          <TableHead class="text-center whitespace-nowrap">
            Jugados
          </TableHead>
          <TableHead class="text-center whitespace-nowrap">
            Ganados
          </TableHead>
          <TableHead class="text-center whitespace-nowrap">
            Perdidos
          </TableHead>
          <TableHead class="text-center whitespace-nowrap">
            Media
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="row in partners"
          :key="`${row.partner.surname}-${row.partner.name}`"
        >
          <TableCell class="max-w-72 min-w-56 whitespace-normal">
            <a
              :href="partnerHref(row.partner)"
              class="font-medium wrap-break-word text-inherit no-underline hover:underline focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              :title="partnerName(row.partner)"
            >
              {{ partnerName(row.partner) }}
            </a>
          </TableCell>
          <TableCell class="text-center whitespace-nowrap text-muted">
            {{ formatStandingValue(row.games_played) }}
          </TableCell>
          <TableCell class="text-center whitespace-nowrap text-muted">
            {{ formatStandingValue(row.games_won) }}
          </TableCell>
          <TableCell class="text-center whitespace-nowrap text-muted">
            {{ formatStandingValue(row.games_lost) }}
          </TableCell>
          <TableCell class="text-center whitespace-nowrap text-muted">
            {{ formatWinAverage(row.average) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </section>
</template>
