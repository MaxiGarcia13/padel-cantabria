<script setup lang="ts">
import type { League, SelectOption } from '@padel-cantabria/database';
import LoaderIcon from '@/components/icons/loader-icon.vue';
import Select from '@/components/select.vue';
import { Button } from '@/components/ui/button';
import LeagueSelect from './league-select.vue';
import SearcherSkeleton from './searcher-skeleton.vue';

defineProps<{
  leagues: League[] | undefined;
  showSkeleton: boolean;
  errorMessage: string | null;
  isNavigating: boolean;
  canSearch: boolean;
  leagueId: string;
  genderValue: string;
  phaseValue: string;
  genders: SelectOption[];
  phases: SelectOption[];
  categories: SelectOption[];
}>();

const emit = defineEmits<{
  'submit': [];
  'update:leagueId': [value: string];
  'update:genderValue': [value: string];
  'update:phaseValue': [value: string];
}>();

const categoryValue = defineModel<string>('categoryValue', { required: true });
</script>

<template>
  <SearcherSkeleton v-if="showSkeleton" />

  <p
    v-else-if="errorMessage"
    class="text-sm text-danger"
    role="alert"
  >
    {{ errorMessage }}
  </p>

  <p
    v-else-if="!leagues?.length"
    class="text-sm text-muted"
  >
    No hay ligas disponibles.
  </p>

  <form
    v-else
    class="flex flex-col gap-4 lg:flex-row lg:items-end"
    @submit.prevent="emit('submit')"
  >
    <div class="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <LeagueSelect
        :model-value="leagueId"
        :leagues="leagues"
        :disabled="isNavigating"
        @update:model-value="emit('update:leagueId', $event)"
      />

      <Select
        id="gender"
        :model-value="genderValue"
        label="Género"
        :options="genders"
        :disabled="!leagueId || isNavigating"
        @update:model-value="emit('update:genderValue', $event)"
      />

      <Select
        id="phase"
        :model-value="phaseValue"
        label="Fase"
        :options="phases"
        :disabled="!genderValue || isNavigating"
        @update:model-value="emit('update:phaseValue', $event)"
      />

      <Select
        id="category"
        v-model="categoryValue"
        label="Categoría"
        :options="categories"
        :disabled="!phaseValue || isNavigating"
      />
    </div>

    <Button
      type="submit"
      class="w-full gap-2 lg:w-auto"
      :disabled="!canSearch || isNavigating"
    >
      <LoaderIcon
        v-if="isNavigating"
        class="size-5 animate-spin"
      />
      Buscar
    </Button>
  </form>
</template>
