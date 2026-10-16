<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import Button from '@/components/button.vue';
import Dialog from '@/components/dialog.vue';
import ZoomIcon from '@/components/icons/zoom-icon.vue';
import SearcherForm from './searcher-form.vue';

const props = withDefaults(
  defineProps<{
    variant?: 'hero' | 'header';
    initialLeagueId?: string;
    initialGenderValue?: string;
    initialPhaseValue?: string;
    initialCategoryValue?: string;
    class?: string;
  }>(),
  {
    variant: 'hero',
  },
);

const dialogRef = useTemplateRef<{
  showModal: () => void;
  close: () => void;
}>('dialog');

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
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="w-full min-w-0 justify-between gap-2 text-left"
      @click="openDialog"
    >
      <span class="min-w-0 flex-1 truncate text-muted">
        Buscar
      </span>
      <ZoomIcon class="size-5 shrink-0 text-muted" />
    </Button>

    <Dialog
      ref="dialog"
      variant="plain"
    >
      <SearcherForm
        closable
        :initial-league-id="initialLeagueId"
        :initial-gender-value="initialGenderValue"
        :initial-phase-value="initialPhaseValue"
        :initial-category-value="initialCategoryValue"
        @navigated="closeDialog"
        @close="closeDialog"
      />
    </Dialog>
  </template>
</template>
