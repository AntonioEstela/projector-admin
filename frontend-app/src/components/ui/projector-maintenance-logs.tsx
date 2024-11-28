'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type MaintenanceLog = {
  id: string;
  projectorIp: string;
  description: string;
  maintainedBy: string;
  date: string;
};

// Mock function to simulate fetching data from a database
const fetchMaintenanceLogs = async (
  projectorIp: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ logs: MaintenanceLog[]; total: number }> => {
  // In a real application, this would be an API call

  const response = await fetch(`/api/maintenance/${projectorIp}`);
  const data = await response.json();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    logs: data.slice(start, end),
    total: data.length,
  };
};

export default function ProjectorMaintenanceLogsDialog({ projectorIp }: { projectorIp: string }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const loadLogs = async () => {
      if (!open) return;
      setLoading(true);
      try {
        const { logs, total } = await fetchMaintenanceLogs(projectorIp, page, pageSize);
        setLogs(logs);
        setTotalLogs(total);
      } catch (error) {
        console.error('Failed to fetch maintenance logs:', error);
        toast({
          title: 'Error al cargar registros',
          description: 'Ocurrió un error al cargar los registros de mantenimiento.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [projectorIp, page, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Ver Registros de Mantenimiento</Button>
      </DialogTrigger>
      <DialogContent className={'sm:max-w-[500px] overflow-y-auto max-sm:max-h-svh'}>
        <DialogHeader>
          <DialogTitle>Registros de Mantenimiento o Novedad</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Table>
            <TableCaption>Lista de mantenimientos realizados</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Realizado por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center'>
                    Cargando registros...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center'>
                    No se encontraron registros de mantenimiento.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>{log.maintainedBy}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className='flex items-center justify-between'>
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              <ChevronLeft className='h-4 w-4 mr-2' />
              Anterior
            </Button>
            <span>
              Página {page} de {Math.ceil(totalLogs / pageSize)}
            </span>
            <Button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(totalLogs / pageSize) || loading}>
              Siguiente
              <ChevronRight className='h-4 w-4 ml-2' />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
