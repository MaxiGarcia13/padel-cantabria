<script setup lang="ts">
import { ref } from 'vue';
import ZoomIcon from '@/components/icons/zoom-icon.vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
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

const isOpen = ref(false);

const isHeader = props.variant === 'header';

function openDialog(): void {
  isOpen.value = true;
}

function closeDialog(): void {
  isOpen.value = false;
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

    <Dialog v-model:open="isOpen">
      <DialogContent
        :show-close-button="false"
        class="max-w-3xl border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
      >
        <DialogTitle class="sr-only">
          Buscar
        </DialogTitle>
        <SearcherForm
          closable
          :initial-league-id="initialLeagueId"
          :initial-gender-value="initialGenderValue"
          :initial-phase-value="initialPhaseValue"
          :initial-category-value="initialCategoryValue"
          @close="closeDialog"
        />
      </DialogContent>
    </Dialog>
  </template>
</template>
