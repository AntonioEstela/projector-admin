'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Column } from '@tanstack/react-table';
import { DashboardColumn } from '@/app/dashboard/columns';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function DropdownMenuCheckboxes({ column }: { column: Column<DashboardColumn, unknown> }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' onClick={() => setOpen((prev) => !prev)}>
          Estado
          {open ? <ChevronUp className='w-4 h-4 ml-2' /> : <ChevronDown className='w-4 h-4 ml-2' />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='start'>
        <DropdownMenuItem onClick={() => column.setFilterValue('')} className='text-gray-400'>
          Reiniciar Filtros
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => column.setFilterValue('Apagado')}>Apagado</DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.setFilterValue('Encendido')}>Encendido</DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.setFilterValue('No Disponible')}>No Disponible</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
