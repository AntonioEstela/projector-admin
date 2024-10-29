import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from './label';
import { Button } from './button';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import EditProjectorForm from './edit-projector-form';

export const DialogTableCell = ({
  isRowOpen,
  setIsRowOpen,
  selectedRow,
}: {
  isRowOpen: boolean | undefined;
  setIsRowOpen: any;
  selectedRow: any;
}) => {
  const [fromHour, setFromHour] = useState('09');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('05');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState('PM');
  const [input, setInput] = useState('HDMI');

  const handleSetTime = () => {
    toast({
      title: 'Tiempo configurado',
      description: `Proyector programado desde ${fromHour}:${fromMinute} ${fromPeriod} hasta ${toHour}:${toMinute} ${toPeriod}`,
    });
  };

  const handleSetInput = () => {
    toast({
      title: 'Entrada configurada',
      description: `Entrada del proyector configurada a ${input}`,
    });
  };

  return (
    <Dialog open={isRowOpen} onOpenChange={setIsRowOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{selectedRow.original.nombre}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
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
          <div className='flex flex-col space-y-1.5'>
            <Label htmlFor='input'>Entrada del Proyector</Label>
            <Select value={input} onValueChange={setInput}>
              <SelectTrigger id='input'>
                <SelectValue placeholder='Select input' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='HDMI'>HDMI</SelectItem>
                <SelectItem value='VGA'>VGA</SelectItem>
                <SelectItem value='DisplayPort'>DisplayPort</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSetInput}>Configurar Entrada</Button>
        </div>
        <DialogFooter>
          <EditProjectorForm projector={selectedRow.original} />
          <Button onClick={() => setIsRowOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
