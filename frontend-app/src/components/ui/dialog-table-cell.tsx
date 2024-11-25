import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import EditProjectorForm from './edit-projector-form';
import { Separator } from '@/components/ui/separator';
import ProjectorMaintenanceForm, { MaintenanceRecord } from './projector-maintenance-form';
import ProjectorMaintenanceLogsDialog from './projector-maintenance-logs';
import { TimeScheduler } from './time-scheduler';
import { isAdmin } from '@/lib/utils';

export const DialogTableCell = ({
  isRowOpen,
  setIsRowOpen,
  selectedRow,
}: {
  isRowOpen: boolean | undefined;
  setIsRowOpen: any;
  selectedRow: any;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const isProjectorDisabled = selectedRow.original.estado === 'No Disponible';

  const onAddMaintenance = async ({ projectorIp, maintainedBy, description, date }: MaintenanceRecord) => {
    const response = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectorIp, maintainedBy, description, date }),
    });

    if (response.ok) {
      toast({ title: 'Mantenimiento registrado correctamente' });
    } else {
      toast({ title: 'Error al registrar mantenimiento', variant: 'destructive' });
    }
  };

  return (
    <>
      <Dialog open={isRowOpen} onOpenChange={setIsRowOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{selectedRow.original.nombre}</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <TimeScheduler isProjectorDisabled={isProjectorDisabled} selectedRow={selectedRow} />
            <Separator className='my-5' />
            <div>
              <Label className='text-md font-bold'>Mantenimiento</Label>
              <div className='grid grid-cols-2 gap-2 mt-5'>
                <ProjectorMaintenanceForm projectorIp={selectedRow.original.ip} onAddMaintenance={onAddMaintenance} />
                <ProjectorMaintenanceLogsDialog projectorIp={selectedRow.original.ip} />
              </div>
            </div>
          </div>
          <DialogFooter>
            {isAdmin() && (
              <Button variant='outline' onClick={() => setEditOpen(true)}>
                Editar Proyector
              </Button>
            )}
            <Button onClick={() => setIsRowOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {editOpen && (
        <EditProjectorForm projector={selectedRow.original} open={editOpen} setOpen={setEditOpen} rows={[]} />
      )}
    </>
  );
};
