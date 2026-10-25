<script setup lang="ts">
import type { BreadcrumbItem } from '@/utils/breadcrumb-items';
import HomeIcon from '@/components/icons/home-icon.vue';

defineProps<{
  items: BreadcrumbItem[];
}>();

function isHomeItem(item: BreadcrumbItem, index: number): boolean {
  return index === 0 && item.href === '/';
}
</script>

<template>
  <nav aria-label="Miga de pan" class="w-full min-w-0 self-start">
    <ol class="flex w-full flex-nowrap items-center gap-2 overflow-x-auto text-sm">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="min-w-0 shrink-0 items-center gap-2"
        :class="
          index === items.length - 1
            ? 'hidden max-w-[70%] sm:flex sm:max-w-none'
            : isHomeItem(item, index)
              ? 'flex'
              : 'flex max-w-[40%] sm:max-w-48'
        "
      >
        <a
          v-if="item.href"
          :href="item.href"
          :aria-label="isHomeItem(item, index) ? item.label : undefined"
          :title="item.label"
          class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          :class="isHomeItem(item, index) ? 'inline-flex' : 'truncate'"
        >
          <HomeIcon
            v-if="isHomeItem(item, index)"
            class="size-4"
          />
          <template v-else>
            {{ item.label }}
          </template>
        </a>
        <span
          v-else
          :title="item.label"
          class="truncate text-foreground"
          aria-current="page"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="shrink-0 text-muted-foreground"
          :class="index === items.length - 2 ? 'hidden sm:inline' : undefined"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>
