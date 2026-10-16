<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import Dialog from '@/components/dialog.vue';
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5 shrink-0 text-muted"
        aria-hidden="true"
      >
        <path
          stroke="none"
          d="M0 0h24v24H0z"
          fill="none"
        />
        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
        <path d="M21 21l-6 -6" />
      </svg>
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
