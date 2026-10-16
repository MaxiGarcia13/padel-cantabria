<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import {
  AutocompleteListbox,
  AutocompleteOption,
} from '@/components/autocomplete';
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
  <AutocompleteListbox>
    <AutocompleteOption
      v-for="item in items"
      :key="item.team.id"
      :label="item.team.name"
      :description="item.description"
      @select="emit('select', item.team)"
    >
      <template #leading>
        <HistoryIcon />
      </template>

      <template #trailing>
        <button
          type="button"
          class="hover:text-foreground"
          aria-label="Eliminar de recientes"
          @mousedown.prevent.stop="emit('remove', item.team.id)"
        >
          <XIcon />
        </button>
      </template>
    </AutocompleteOption>
  </AutocompleteListbox>
</template>
