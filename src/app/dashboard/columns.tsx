'use client';

import { ColumnDef } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronsUpDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { DropdownMenuCheckboxes } from '@/components/ui/dropdown-menu-checkboxes';
import React, { useState } from 'react';

export type DashboardColumn = {
  ip: string;
  nombre: string;
  modelo: string;
  referencia: string;
  horasLampara: number;
  grupos: string;
  etiquetas: Array<string>;
  ubicacion: string;
  estado: 'Encendido' | 'Apagado' | 'En mantenimiento';
};

export const columns: ColumnDef<DashboardColumn>[] = [
  {
    accessorKey: 'ip',
    header: 'IP',
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => {
      const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

      const toggleSorting = () => {
        if (sortOrder === 'asc') {
          setSortOrder('desc');
          column.toggleSorting(false);
        } else if (sortOrder === 'desc') {
          setSortOrder(null);
          column.clearSorting();
        } else {
          setSortOrder('asc');
          column.toggleSorting(true);
        }
      };

      return (
        <Button variant={'ghost'} onClick={toggleSorting}>
          <span className='mr-2'>Nombre</span>
          {sortOrder === 'asc' ? (
            <ChevronUp className='w-4 h-4' />
          ) : sortOrder === 'desc' ? (
            <ChevronDown className='w-4 h-4' />
          ) : (
            <ChevronsUpDown className='w-4 h-4' />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: 'modelo',
    header: 'Modelo',
  },
  {
    accessorKey: 'referencia',
    header: 'Referencia',
  },
  {
    accessorKey: 'horasLampara',
    header: 'Horas de lámpara',
  },
  {
    accessorKey: 'grupos',
    header: 'Grupos',
  },
  {
    accessorKey: 'etiquetas',
    header: 'Etiquetas',
  },
  {
    accessorKey: 'ubicacion',
    header: 'Ubicación',
  },
  {
    accessorKey: 'estado',
    cell: ({ row }) => {
      const projector = row.original;
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            projector.estado === 'Encendido'
              ? 'bg-green-100 text-green-800'
              : projector.estado === 'Apagado'
              ? 'bg-red-100 text-red-800'
              : projector.estado === 'En mantenimiento'
              ? 'bg-yellow-100 text-yellow-800'
              : ''
          }`}
        >
          {projector.estado}
        </span>
      );
    },
    header: ({ column }) => {
      return <DropdownMenuCheckboxes column={column} />;
    },
  },
  {
    header: 'Acciones',
    id: 'actions',
    cell: ({ row }) => {
      const { estado } = row.original;
      // logica para eliminar el proyector o editarlo

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='w-8 h-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {estado === 'Apagado' ? (
              <DropdownMenuItem>Encender</DropdownMenuItem>
            ) : estado === 'Encendido' ? (
              <DropdownMenuItem>Apagar</DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>Apagar</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem className='text-red-500 hover:!text-red-500'>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
