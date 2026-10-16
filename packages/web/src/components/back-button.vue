<script setup lang="ts">
function goBack(): void {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.assign('/');
}
</script>

<template>
  <button
    type="button"
    class="inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-foreground"
    aria-label="Volver"
    @click="goBack"
  >
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
      class="size-6"
      aria-hidden="true"
    >
      <path
        stroke="none"
        d="M0 0h24v24H0z"
        fill="none"
      />
      <path d="M15 6l-6 6l6 6" />
    </svg>
  </button>
</template>
