<script setup lang="ts">
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
</script>

<template>
  <TableHeader>
    <TableRow>
      <TableHead class="w-12 text-center">
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
