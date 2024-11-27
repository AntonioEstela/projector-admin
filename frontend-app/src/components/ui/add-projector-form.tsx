'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Projector } from '@/types/projector';
import { Plus } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';

export default function AddProjectorForm({ rows }: { rows: any }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Projector>({
    ip: '',
    nombre: '',
    modelo: '',
    referencia: '',
    horasLampara: 0,
    grupos: '',
    etiquetas: [],
    ubicacion: '',
    estado: 'Apagado',
    temperatura: 0,
  });
  const availableIpAddresses = rows.map((row: any) => row.original.ip);
  const router = useRouter();
  const onAddProjector = async (projector: Projector) => {
    const response: Response = await fetch(`/api/projectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(projector),
    });

    if (response) {
      toast({
        title: 'Proyector añadido',
        description: 'El nuevo proyector ha sido añadido con éxito.',
      });
      router.push('/');
    } else {
      console.error('Failed to add projector');
      toast({
        title: 'Error al añadir proyector',
        description: 'Ha ocurrido un error al añadir el nuevo proyector.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, estado: value as 'Encendido' | 'Apagado' | 'No Disponible' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (availableIpAddresses.includes(formData.ip)) {
      toast({
        title: 'Dirección IP duplicada',
        description: 'La dirección IP ingresada ya está en uso por otro proyector.',
        variant: 'destructive',
      });
      return;
    }
    onAddProjector(formData);
    setOpen(false);
    toast({
      title: 'Proyector añadido',
      description: 'El nuevo proyector ha sido añadido con éxito.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default'>
          <Plus className='mr-2' size={16} />
          <span>Añadir Proyector</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={'sm:max-w-[500px] overflow-y-scroll max-sm:max-h-svh'}>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Proyector</DialogTitle>
        </DialogHeader>
        <DialogDescription className='text-xs'>
          Complete el formulario para añadir un nuevo proyector a la lista.
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
              value={formData.etiquetas.join(', ')}
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
                <SelectItem value='No Disponible'>No Disponible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type='submit' className='w-full'>
            Añadir Proyector
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
