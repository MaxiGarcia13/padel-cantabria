<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import HistoryIcon from '@/components/icons/history-icon.vue';
import XIcon from '@/components/icons/x-icon.vue';

export interface TeamSearchHistoryItem {
  team: Team;
  description?: string;
}

defineProps<{
  items: TeamSearchHistoryItem[];
}>();

const emit = defineEmits<{
  select: [team: Team];
  remove: [teamId: number];
}>();
</script>

<template>
  <ul
    role="listbox"
    class="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface py-2"
  >
    <li
      v-for="item in items"
      :key="item.team.id"
      role="option"
      class="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-border/60"
      @mousedown.prevent="emit('select', item.team)"
    >
      <HistoryIcon class="size-4 shrink-0 text-muted" />

      <span class="flex min-w-0 flex-1 flex-col gap-2">
        <span class="truncate text-foreground">{{ item.team.name }}</span>
        <span
          v-if="item.description"
          class="truncate text-xs text-muted"
        >
          {{ item.description }}
        </span>
      </span>

      <button
        type="button"
        class="shrink-0 rounded-xl p-2 text-muted hover:text-foreground"
        aria-label="Eliminar de recientes"
        @mousedown.prevent="emit('remove', item.team.id)"
      >
        <XIcon class="size-4" />
      </button>
    </li>
  </ul>
</template>
