'use client';

import { Column, ColumnDef, Row } from '@tanstack/react-table';

import {
  DropdownMenu,
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
import { getBaseURL } from '@/lib/utils';
import COMMANDS from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

export type DashboardColumn = {
  select: boolean;
  id: string;
  ip: string;
  nombre: string;
  modelo: string;
  referencia: string;
  horasLampara: number;
  grupos: string;
  etiquetas: Array<string>;
  ubicacion: string;
  estado: 'Encendido' | 'Apagado' | 'En mantenimiento';
  temperatura: number;
};

const ActionsMenu = ({ row, selectedRows }: { row?: Row<DashboardColumn>; selectedRows?: DashboardColumn[] }) => {
  const { estado, ip } = row?.original ?? { estado: '', ip: '' };
  // logica para eliminar el proyector o editarlo

  const handleDelete = async () => {
    try {
      const response = await fetch(`${getBaseURL()}/api/projectors`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(row?.original.id),
      });

      if (response.ok) {
        toast({
          title: 'Proyector eliminado',
          description: 'El proyector ha sido eliminado exitosamente.',
        });
      } else {
        throw new Error('Failed to delete projector');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el proyector.',
        variant: 'destructive',
      });
    }
  };

  const handleOnOFF = async (host: string, command: string, port = '8080') => {
    toast({
      title: 'Enviando comando',
      description: 'Enviando comando al proyector...',
    });

    try {
      const res = await fetch('/api/projectors/sendCommand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, command }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        toast({
          title: 'Comando enviado',
          description: `Respuesta del dispositivo: ${data.response}`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al enviar el comando',
        variant: 'destructive',
      });
    }
  };
  const handleMultipleOnOFF = async (command: string, selectedRows: DashboardColumn[]) => {
    const selectedIps = selectedRows.map((row) => row.ip);
    selectedIps.forEach((ip) => {
      handleOnOFF(ip, command);
    });
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await fetch(`${getBaseURL()}/api/projectors`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(selectedRows?.map((row) => row.id)),
      });

      if (response.ok) {
        toast({
          title: 'Proyectores eliminados',
          description: 'Los proyectores han sido eliminados exitosamente.',
        });
      } else {
        throw new Error('Failed to delete projectors');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron eliminar los proyectores.',
        variant: 'destructive',
      });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='w-8 h-8 p-0'>
          <MoreHorizontal className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {selectedRows?.length ? (
          <>
            <DropdownMenuItem onClick={() => handleMultipleOnOFF(COMMANDS.POWER_ON, selectedRows)}>
              Encender
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMultipleOnOFF(COMMANDS.POWER_OFF, selectedRows)}>
              Apagar
            </DropdownMenuItem>
          </>
        ) : estado === 'Apagado' ? (
          <DropdownMenuItem onClick={() => handleOnOFF(ip, COMMANDS.POWER_ON)}>Encender</DropdownMenuItem>
        ) : estado === 'Encendido' ? (
          <DropdownMenuItem onClick={() => handleOnOFF(ip, COMMANDS.POWER_OFF)}>Apagar</DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>Apagar</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-red-500 hover:!text-red-500'
          onClick={selectedRows?.length ? handleMultipleDelete : handleDelete}
        >
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SortableHeader = ({ column }: { column: Column<DashboardColumn, unknown> }) => {
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
};

export const columns: ColumnDef<DashboardColumn>[] = [
  {
    accessorKey: 'select',
    header: ({ table }) => {
      return (
        <Checkbox
          checked={table.getRowModel().rows.every((row) => row.getIsSelected())}
          onCheckedChange={() => table.toggleAllRowsSelected()}
        />
      );
    },
    cell: ({ row }) => {
      return <Checkbox checked={row.getIsSelected()} onCheckedChange={() => row.toggleSelected()} />;
    },
  },
  {
    accessorKey: 'ip',
    header: 'IP',
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => <SortableHeader column={column} />,
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
    accessorKey: 'temperatura',
    header: 'Temperatura',
    cell: ({ row }) => {
      const projector = row.original;
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            projector.temperatura < 50
              ? 'bg-green-100 text-green-800'
              : projector.temperatura < 70
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {projector.temperatura}°C
        </span>
      );
    },
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
    header: ({ table }) => {
      const selectedRows = table
        .getRowModel()
        .rows.filter((row) => row.getIsSelected())
        .map((row) => row.original);

      if (selectedRows.length) {
        return <ActionsMenu selectedRows={selectedRows} />;
      }
      return 'Acciones';
    },
    id: 'actions',
    cell: ({ row }) => <ActionsMenu row={row} />,
  },
];
