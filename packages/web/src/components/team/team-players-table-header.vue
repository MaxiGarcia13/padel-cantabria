<script setup lang="ts">
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
</script>

<template>
  <TableHeader>
    <TableRow>
      <TableHead>
        Pos.
      </TableHead>
      <TableHead />
      <TableHead>
        Apellidos
      </TableHead>
      <TableHead>
        Nombre
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
