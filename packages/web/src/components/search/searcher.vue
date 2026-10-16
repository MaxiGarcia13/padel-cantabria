<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import Dialog from '@/components/dialog.vue';
import ZoomIcon from '@/components/icons/zoom-icon.vue';
import { useLeagues } from '@/composables/use-leagues';
import { useSearchFilters } from '@/composables/use-search-filters';
import SearcherForm from './searcher-form.vue';

const props = withDefaults(
  defineProps<{
    variant?: 'hero' | 'header';
    initialLeagueId?: string;
    initialGenderValue?: string;
    initialPhaseValue?: string;
    initialCategoryValue?: string;
    resumeLabel?: string;
  }>(),
  {
    variant: 'hero',
  },
);

const dialogRef = useTemplateRef<{
  showModal: () => void;
  close: () => void;
}>('dialog');

const { data: leagues } = useLeagues();
const { locationSummary } = useSearchFilters(leagues, {
  leagueId: props.initialLeagueId,
  genderValue: props.initialGenderValue,
  phaseValue: props.initialPhaseValue,
  categoryValue: props.initialCategoryValue,
});

const summaryLabel = computed(
  () => props.resumeLabel || locationSummary.value || 'Buscar',
);

const isHeader = computed(() => props.variant === 'header');

function openDialog(): void {
  dialogRef.value?.showModal();
}

function closeDialog(): void {
  dialogRef.value?.close();
}
</script>

<template>
  <SearcherForm
    v-if="!isHeader"
    :initial-league-id="initialLeagueId"
    :initial-gender-value="initialGenderValue"
    :initial-phase-value="initialPhaseValue"
    :initial-category-value="initialCategoryValue"
  />

  <template v-else>
    <button
      type="button"
      class="flex w-full min-w-0 items-center gap-2 rounded-xl border border-border px-4 py-2 text-left transition-colors hover:bg-surface"
      @click="openDialog"
    >
      <span class="min-w-0 flex-1 truncate text-sm text-foreground">
        {{ summaryLabel }}
      </span>
      <ZoomIcon class="size-5 shrink-0 text-muted" />
    </button>

    <Dialog ref="dialog">
      <template #header>
        Buscar
      </template>

      <SearcherForm
        :initial-league-id="initialLeagueId"
        :initial-gender-value="initialGenderValue"
        :initial-phase-value="initialPhaseValue"
        :initial-category-value="initialCategoryValue"
        @navigated="closeDialog"
      />
    </Dialog>
  </template>
</template>
