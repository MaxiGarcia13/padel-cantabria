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
