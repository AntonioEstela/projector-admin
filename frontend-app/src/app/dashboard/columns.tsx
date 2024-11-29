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
import COMMANDS from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TimeScheduler } from '@/components/ui/time-scheduler';
import { isAdmin } from '@/lib/utils';

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
  estado: 'Encendido' | 'Apagado' | 'No Disponible';
  temperatura: number;
  turnOnAt?: string;
  turnOffAt?: string;
  diasProgramados?: Array<string>;
};

const ActionsMenu = ({ row, selectedRows }: { row?: Row<DashboardColumn>; selectedRows?: DashboardColumn[] }) => {
  const { estado, ip } = row?.original ?? { estado: '', ip: '' };
  const [scheduleOpen, setScheduleOpen] = useState(false);
  // logica para eliminar el proyector o editarlo
  const router = useRouter();
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projectors`, {
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
        router.push('/');
      } else {
        throw new Error('Failed to delete projector');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudo eliminar el proyector. ${error instanceof Error ? error.message : ''}`,
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
        setTimeout(() => router.push('/'), 1000);
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
    selectedRows.forEach((projector) => {
      if (projector.estado === 'Encendido' && command === COMMANDS.POWER_ON) return;
      if (projector.estado === 'Apagado' && command === COMMANDS.POWER_OFF) return;
      if (projector.estado === 'No Disponible') return;
      handleOnOFF(projector.ip, command);
    });
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await fetch(`/api/projectors`, {
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
        router.push('/');
      } else {
        throw new Error('Failed to delete projectors');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudieron eliminar los proyectores. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
    }
  };
  return (
    <>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setScheduleOpen(true)}>Programar Encendido</DropdownMenuItem>
            </>
          ) : estado === 'Apagado' ? (
            <DropdownMenuItem onClick={() => handleOnOFF(ip, COMMANDS.POWER_ON)}>Encender</DropdownMenuItem>
          ) : estado === 'Encendido' ? (
            <DropdownMenuItem onClick={() => handleOnOFF(ip, COMMANDS.POWER_OFF)}>Apagar</DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>Apagar</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isAdmin() && (
            <DropdownMenuItem
              className='text-red-500 hover:!text-red-500'
              onClick={selectedRows?.length ? handleMultipleDelete : handleDelete}
            >
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {scheduleOpen && (
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogContent className={'sm:max-w-[500px] overflow-y-auto max-sm:max-h-svh'}>
            <TimeScheduler selectedRows={selectedRows} />
          </DialogContent>
        </Dialog>
      )}
    </>
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
            projector.temperatura == 0
              ? 'bg-gray-100 text-gray-800'
              : projector.temperatura < 50
              ? 'bg-green-100 text-green-800'
              : projector.temperatura < 70
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {projector.temperatura == 0 ? 'N/A' : `${projector.temperatura}°C`}
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
              : projector.estado === 'No Disponible'
              ? 'bg-gray-100 text-gray-800'
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
