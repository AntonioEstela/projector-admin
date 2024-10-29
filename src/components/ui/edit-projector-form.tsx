'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Projector } from '@/types/projector';
import { DialogDescription } from '@radix-ui/react-dialog';
import { getBaseURL } from '@/lib/utils';

export default function EditProjectorForm({ projector }: { projector: Projector }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Projector>(projector);

  const onEditProjector = async (projector: Projector) => {
    const response: Response = await fetch(`${getBaseURL()}/api/projectors`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(projector),
    });

    if (response) {
      const data = await response.json();
      console.log('Projector edited: ', data);
    } else {
      console.error('Failed to edit projector');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, estado: value as 'Encendido' | 'Apagado' | 'En mantenimiento' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the IP is unique
    onEditProjector(formData);
    setOpen(false);
    toast({
      title: 'Proyector editado',
      description: 'El nuevo proyector ha sido editado con éxito.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <span>Editar Proyector</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Editar Proyector Existente</DialogTitle>
        </DialogHeader>
        <DialogDescription className='text-xs'>
          Complete el formulario para editar el proyector seleccionado.
        </DialogDescription>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ip'>IP</Label>
            <Input id='ip' name='ip' value={formData.ip} onChange={handleInputChange} required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='nombre'>Nombre</Label>
            <Input id='nombre' name='nombre' value={formData.nombre} onChange={handleInputChange} required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='modelo'>Modelo</Label>
            <Input id='modelo' name='modelo' value={formData.modelo} onChange={handleInputChange} required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='referencia'>Referencia</Label>
            <Input
              id='referencia'
              name='referencia'
              value={formData.referencia}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='horasLampara'>Horas de Lámpara</Label>
            <Input
              id='horasLampara'
              name='horasLampara'
              type='number'
              value={formData.horasLampara}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='grupos'>Grupos</Label>
            <Input id='grupos' name='grupos' value={formData.grupos} onChange={handleInputChange} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='etiquetas'>Etiquetas (separadas por comas)</Label>
            <Input
              id='etiquetas'
              name='etiquetas'
              value={formData?.etiquetas?.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, etiquetas: e.target.value.split(',').map((tag) => tag.trim()) }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='ubicacion'>Ubicación</Label>
            <Input id='ubicacion' name='ubicacion' value={formData.ubicacion} onChange={handleInputChange} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='estado'>Estado</Label>
            <Select name='estado' value={formData.estado} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder='Seleccione el estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Encendido'>Encendido</SelectItem>
                <SelectItem value='Apagado'>Apagado</SelectItem>
                <SelectItem value='En mantenimiento'>En mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type='submit' className='w-full'>
            Editar Proyector
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
