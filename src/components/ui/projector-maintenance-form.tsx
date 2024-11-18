'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export type MaintenanceRecord = {
  projectorIp: string;
  description: string;
  maintainedBy: string;
  date: string;
};

type ProjectorMaintenanceFormProps = {
  projectorIp: string;
  projectorName: string;
  onAddMaintenance: (record: MaintenanceRecord) => void;
};

export default function ProjectorMaintenanceForm({
  projectorIp,
  projectorName,
  onAddMaintenance,
}: ProjectorMaintenanceFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<MaintenanceRecord>({
    projectorIp: projectorIp,
    description: '',
    maintainedBy: '',
    date: new Date().toISOString().split('T')[0], // Set default date to today
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaintenance(formData);
    setOpen(false);
    toast({
      title: 'Mantenimiento registrado',
      description: 'El registro de mantenimiento ha sido añadido con éxito.',
    });
    // Reset form data
    setFormData({
      projectorIp: projectorIp,
      description: '',
      maintainedBy: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Registrar Mantenimiento</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Registrar Mantenimiento para {projectorName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='description'>Descripción del Mantenimiento</Label>
            <Textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              required
              className='min-h-[100px]'
              placeholder='Detalle las actividades de mantenimiento realizadas...'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='maintainedBy'>Realizado por</Label>
            <Input
              id='maintainedBy'
              name='maintainedBy'
              value={formData.maintainedBy}
              onChange={handleInputChange}
              required
              placeholder='Nombre del técnico o empresa'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='date'>Fecha de Mantenimiento</Label>
            <Input id='date' name='date' type='date' value={formData.date} onChange={handleInputChange} required />
          </div>
          <Button type='submit' className='w-full'>
            Registrar Mantenimiento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
