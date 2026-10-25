<script setup lang="ts">
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
</script>

<template>
  <TableHeader>
    <TableRow>
      <TableHead class="sticky left-0 z-20 w-12 bg-surface text-center">
        Pos.
      </TableHead>
      <TableHead class="w-8" />
      <TableHead>
        Jugador
      </TableHead>
      <TableHead class="text-center">
        Puntos
      </TableHead>
      <TableHead class="text-center">
        Jugados
      </TableHead>
      <TableHead class="text-center">
        Ganados
      </TableHead>
      <TableHead class="text-center">
        Perdidos
      </TableHead>
    </TableRow>
  </TableHeader>
</template>
