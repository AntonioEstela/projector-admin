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
import { ChevronsUpDown, MoreHorizontal, Power, PowerOff } from 'lucide-react';
import { DropdownMenuCheckboxes } from '@/components/ui/dropdown-menu-checkboxes';
import React from 'react';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { set } from 'mongoose';

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
      return (
        <Button variant={'ghost'} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombre
          <ChevronsUpDown className='w-4 h-4 ml-2' />
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
              <DropdownMenuItem>
                <Power className='w-4 h-4 mr-2' />
                Encender
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <PowerOff className='w-4 h-4 mr-2' />
                Apagar
              </DropdownMenuItem>
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
