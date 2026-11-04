<script setup lang="ts">
import { BookOpenIcon, FolderGit2Icon } from '@lucide/vue';

const REPO_URL = 'https://github.com/MaxiGarcia13/padel-cantabria';
const MCP_SETUP_URL
  = 'https://github.com/MaxiGarcia13/padel-cantabria/blob/main/packages/mcp/README.md';
</script>

<template>
  <nav
    class="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
    aria-label="Enlaces"
  >
    <a
      class="inline-flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
      :href="REPO_URL"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FolderGit2Icon
        class="size-4"
        aria-hidden="true"
      />
      GitHub
    </a>
    <a
      class="inline-flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
      :href="MCP_SETUP_URL"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BookOpenIcon
        class="size-4"
        aria-hidden="true"
      />
      Cómo conectar el MCP
    </a>
  </nav>
</template>
