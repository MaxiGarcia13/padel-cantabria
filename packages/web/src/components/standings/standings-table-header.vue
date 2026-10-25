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
      <TableHead class="max-w-72 min-w-56">
        Equipo
      </TableHead>
      <TableHead class="text-center">
        Enfrentamientos<br>disputados
      </TableHead>
      <TableHead class="text-center">
        Puntos<br>ganados
      </TableHead>
      <TableHead class="text-center">
        Partidos<br>disputados
      </TableHead>
      <TableHead class="text-center">
        Partidos<br>ganados
      </TableHead>
      <TableHead class="text-center">
        Sets<br>a favor
      </TableHead>
      <TableHead class="text-center">
        Sets<br>en contra
      </TableHead>
      <TableHead class="text-center">
        Average<br>sets
      </TableHead>
      <TableHead class="text-center">
        Juegos<br>a favor
      </TableHead>
      <TableHead class="text-center">
        Juegos<br>en contra
      </TableHead>
      <TableHead class="text-center">
        Average<br>juegos
      </TableHead>
    </TableRow>
  </TableHeader>
</template>
