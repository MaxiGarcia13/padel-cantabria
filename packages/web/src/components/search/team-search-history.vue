<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import type { AutocompleteItem } from '@/components/autocomplete';
import HistoryIcon from '@/components/icons/history-icon.vue';
import XIcon from '@/components/icons/x-icon.vue';
import { ComboboxItem } from '@/components/ui/combobox';

export interface TeamSearchHistoryItem {
  team: Team;
  description?: string;
}

defineProps<{
  items: TeamSearchHistoryItem[];
}>();

const emit = defineEmits<{
  remove: [teamId: number];
}>();

function toAutocompleteItem(item: TeamSearchHistoryItem): AutocompleteItem {
  return {
    value: String(item.team.id),
    label: item.team.name,
    description: item.description,
  };
}
</script>

<template>
  <ComboboxItem
    v-for="item in items"
    :key="item.team.id"
    :value="toAutocompleteItem(item)"
  >
    <HistoryIcon class="size-4 shrink-0 text-muted" />

    <span class="flex min-w-0 flex-1 flex-col gap-2">
      <span class="truncate text-foreground">
        {{ item.team.name }}
      </span>
      <span
        v-if="item.description"
        class="truncate text-xs text-muted"
      >
        {{ item.description }}
      </span>
    </span>

    <button
      type="button"
      class="shrink-0 text-muted hover:text-foreground [&_svg]:size-4"
      aria-label="Eliminar de recientes"
      @mousedown.prevent.stop="emit('remove', item.team.id)"
    >
      <XIcon />
    </button>
  </ComboboxItem>
</template>
