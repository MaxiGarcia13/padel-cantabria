<script setup lang="ts">
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
</script>

<template>
  <TableHeader>
    <TableRow>
      <TableHead class="w-48 max-w-48">
        Pareja
      </TableHead>
      <TableHead class="text-center whitespace-nowrap">
        Jugados
      </TableHead>
      <TableHead class="text-center whitespace-nowrap">
        Ganados
      </TableHead>
      <TableHead class="text-center whitespace-nowrap">
        Perdidos
      </TableHead>
      <TableHead class="text-center whitespace-nowrap">
        Media
      </TableHead>
    </TableRow>
  </TableHeader>
</template>
