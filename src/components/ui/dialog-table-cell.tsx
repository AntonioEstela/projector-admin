import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { Label } from './label';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { convertTo24HourTime, calculateMillisecondsUntil } from '@/lib/timeHelpers';
import COMMANDS from '@/lib/constants';
import EditProjectorForm from './edit-projector-form';
import { Separator } from './separator';

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
  const [fromHour, setFromHour] = useState('09');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('05');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState('PM');
  const [input, setInput] = useState('HDMI 1');

  const handleSetTime = () => {
    const fromTime = convertTo24HourTime(fromHour, fromMinute, fromPeriod);
    const toTime = convertTo24HourTime(toHour, toMinute, toPeriod);

    // Schedule Turn On
    const onDelay = calculateMillisecondsUntil(fromTime);
    setTimeout(() => turnOnProjector(), onDelay);

    // Schedule Turn Off
    const offDelay = calculateMillisecondsUntil(toTime);
    setTimeout(() => turnOffProjector(), offDelay);

    toast({
      title: 'Tiempo configurado',
      description: `Proyector programado desde ${fromHour}:${fromMinute} ${fromPeriod} hasta ${toHour}:${toMinute} ${toPeriod}`,
    });
  };

  const turnOnProjector = async () => {
    const { ip: host } = selectedRow.original;
    console.log('Turning on projector...');
    try {
      const res = await fetch('/api/projectors/sendCommand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port: 8080, command: COMMANDS.POWER_ON }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        toast({
          title: 'Proyector encendido',
          description: 'El proyector ha sido encendido exitosamente.',
        });
        console.log(`Response from device: ${data.response}`);
      } else {
        toast({
          title: 'Error',
          description: `Error: ${data.message}`,
          variant: 'destructive',
        });
        console.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error: ${error}`,
        variant: 'destructive',
      });
      console.error(`Request failed: ${error}`);
    }
  };

  const turnOffProjector = () => {
    console.log('Turning off projector...');
    const { ip: host } = selectedRow.original;

    try {
      fetch('/api/projectors/sendCommand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port: 8080, command: COMMANDS.POWER_OFF }),
      }).then((res) => {
        if (res.ok) {
          toast({
            title: 'Proyector apagado',
            description: 'El proyector ha sido apagado exitosamente.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo apagar el proyector.',
            variant: 'destructive',
          });
        }
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo apagar el proyector.',
        variant: 'destructive',
      });
      console.error(`Request failed: ${error}`);
    }
  };

  const handleSetInput = (input: string) => {
    const { ip: host } = selectedRow.original;

    fetch('/api/projectors/sendCommand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port: 8080, command: COMMANDS.SET_INPUT(input) }),
    })
      .then((res) => {
        if (res.ok) {
          toast({
            title: 'Entrada configurada',
            description: `Entrada del proyector configurada a ${input}`,
          });
        } else {
          toast({
            title: 'Error',
            description: `No se pudo configurar la entrada del proyector.`,
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: `No se pudo configurar la entrada del proyector.`,
          variant: 'destructive',
        });
        console.error(`Request failed: ${error}`);
      });
  };

  return (
    <>
      <Dialog open={isRowOpen} onOpenChange={setIsRowOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{selectedRow.original.nombre}</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Label className='text-md font-bold'>Programar encendido</Label>
            <TimePicker
              label='Desde'
              hour={fromHour}
              minute={fromMinute}
              period={fromPeriod}
              setHour={setFromHour}
              setMinute={setFromMinute}
              setPeriod={setFromPeriod}
            />
            <TimePicker
              label='Hasta'
              hour={toHour}
              minute={toMinute}
              period={toPeriod}
              setHour={setToHour}
              setMinute={setToMinute}
              setPeriod={setToPeriod}
            />
            <Button onClick={handleSetTime}>Configurar Tiempo</Button>
            <Separator className='my-5' />
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='input'>Entrada del Proyector</Label>
              <Select value={input} onValueChange={setInput}>
                <SelectTrigger id='input'>
                  <SelectValue placeholder='Select input' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='HDMI 1'>HDMI 1</SelectItem>
                  <SelectItem value='HDMI 2'>HDMI 2</SelectItem>
                  <SelectItem value='HDMI 3'>HDMI 3</SelectItem>
                  <SelectItem value='VGA'>VGA</SelectItem>
                  <SelectItem value='DVI'>DVI</SelectItem>
                  <SelectItem value='Component'>Component</SelectItem>
                  <SelectItem value='USB-C'>USB-C</SelectItem>
                  <SelectItem value='S-Video'>S-Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSetInput(input)}>Configurar Entrada</Button>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditOpen(true)}>
              Editar Proyector
            </Button>
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

// Helper component to select time
function TimePicker({
  label,
  hour,
  minute,
  period,
  setHour,
  setMinute,
  setPeriod,
}: {
  label: string;
  hour: string;
  minute: string;
  period: string;
  setHour: any;
  setMinute: any;
  setPeriod: any;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className='flex flex-col space-y-1.5'>
      <Label>{label}</Label>
      <div className='flex space-x-2'>
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className='w-[70px]'>
            <SelectValue placeholder='Hour' />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minute} onValueChange={setMinute}>
          <SelectTrigger className='w-[70px]'>
            <SelectValue placeholder='Minute' />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className='w-[70px]'>
            <SelectValue placeholder='AM/PM' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
