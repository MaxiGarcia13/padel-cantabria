<script setup lang="ts">
import ChevronDownIcon from '@/components/icons/chevron-down-icon.vue';
import XIcon from '@/components/icons/x-icon.vue';
import { Button } from '@/components/ui/button';
import SearcherFiltersForm from './searcher-filters-form.vue';
import TeamAutocomplete from './team-autocomplete.vue';
import { useSearcherForm } from './use-searcher-form';

const props = defineProps<{
  initialLeagueId?: string;
  initialGenderValue?: string;
  initialPhaseValue?: string;
  initialCategoryValue?: string;
  closable?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const {
  leagues,
  teamQuery,
  isNavigating,
  filtersExpanded,
  showFiltersSkeleton,
  errorMessage,
  leagueId,
  genderValue,
  phaseValue,
  categoryValue,
  genders,
  phases,
  categories,
  canSearch,
  onLeagueChange,
  onGenderChange,
  onPhaseChange,
  onTeamSelect,
  toggleFilters,
  onSearchFilters,
} = useSearcherForm({
  leagueId: props.initialLeagueId,
  genderValue: props.initialGenderValue,
  phaseValue: props.initialPhaseValue,
  categoryValue: props.initialCategoryValue,
});
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
    <div class="flex flex-row items-center gap-2">
      <div class="min-w-0 flex-1">
        <TeamAutocomplete
          v-model="teamQuery"
          :loading="isNavigating"
          @select="onTeamSelect"
        />
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="text-muted hover:text-foreground"
          :disabled="isNavigating"
          :aria-expanded="filtersExpanded"
          aria-label="Mostrar filtros"
          @click="toggleFilters"
        >
          <ChevronDownIcon
            class="size-6 transition-transform"
            :class="{ 'rotate-180': filtersExpanded }"
          />
        </Button>

        <Button
          v-if="closable"
          type="button"
          variant="outline"
          size="icon"
          class="text-muted hover:text-foreground"
          :disabled="isNavigating"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <XIcon class="size-5" />
        </Button>
      </div>
    </div>

    <template v-if="filtersExpanded">
      <p class="text-center text-sm text-muted">
        o
      </p>

      <SearcherFiltersForm
        v-model:category-value="categoryValue"
        :leagues="leagues"
        :show-skeleton="showFiltersSkeleton"
        :error-message="errorMessage"
        :is-navigating="isNavigating"
        :can-search="canSearch"
        :league-id="leagueId"
        :gender-value="genderValue"
        :phase-value="phaseValue"
        :genders="genders"
        :phases="phases"
        :categories="categories"
        @submit="onSearchFilters"
        @update:league-id="onLeagueChange"
        @update:gender-value="onGenderChange"
        @update:phase-value="onPhaseChange"
      />
    </template>
  </div>
</template>
