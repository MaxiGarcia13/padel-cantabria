<template>
  <div class="overflow-x-auto rounded-xl border border-border">
    <table class="w-full min-w-4xl border-collapse text-left text-sm">
      <slot name="header" />
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>
