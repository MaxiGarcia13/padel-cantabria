<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import AutocompleteOption from '@/components/autocomplete-option.vue';
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
    <AutocompleteOption
      v-for="item in items"
      :key="item.team.id"
      :label="item.team.name"
      :description="item.description"
      @select="emit('select', item.team)"
    >
      <template #leading>
        <HistoryIcon class="size-2" />
      </template>

      <template #trailing>
        <button
          type="button"
          class="hover:text-foreground"
          aria-label="Eliminar de recientes"
          @mousedown.prevent.stop="emit('remove', item.team.id)"
        >
          <XIcon class="size-2" />
        </button>
      </template>
    </AutocompleteOption>
  </ul>
</template>
