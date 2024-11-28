'use client';
import TimePicker from './time-picker';
import { Button } from './button';
import { useState } from 'react';
import { convertTo24HourTime } from '@/lib/timeHelpers';
import { toast } from '@/hooks/use-toast';
import { Label } from './label';
import { Separator } from './separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { SET_INPUT } from '@/lib/constants';

export const TimeScheduler = ({
  isProjectorDisabled,
  selectedRow,
  selectedRows,
}: {
  isProjectorDisabled?: boolean;
  selectedRow?: any;
  selectedRows?: any;
}) => {
  const [input, setInput] = useState('HDMI 1');
  const [fromHour, setFromHour] = useState('09');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('05');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState('PM');
  const [action, setAction] = useState('Encendido y apagado');

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const availableProjectors = selectedRows?.length
    ? selectedRows.filter((row: any) => row.estado !== 'No Disponible')
    : selectedRow?.original.estado !== 'No Disponible'
    ? [selectedRow?.original]
    : [];
  const ipAddresses = availableProjectors?.length ? availableProjectors?.map((row: any) => row.ip) : [];

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  const handleSetTime = () => {
    const fromTime = convertTo24HourTime(fromHour, fromMinute, fromPeriod);
    const toTime = convertTo24HourTime(toHour, toMinute, toPeriod);
    const url =
      `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/schedule` +
      (action === 'Encendido' ? '/on' : action === 'Apagado' ? '/off' : '');

    const body: any = {
      ipAddresses,
      daysOfWeek: selectedDays,
      input,
    };

    if (action === 'Encendido y apagado') {
      body['toTime'] = toTime;
      body['fromTime'] = fromTime;
    } else {
      body['time'] = fromTime;
    }
    // make a request to the backend to set the time
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(async (res) => {
        if (res.ok) {
          if (action === 'Encendido' || action === 'Apagado') {
            toast({
              title: 'Tiempo configurado',
              description: `${action} programado a las ${fromHour}:${fromMinute} ${fromPeriod} los días: ${selectedDays.join(
                ', '
              )}`,
            });
          } else {
            toast({
              title: 'Tiempo configurado',
              description: `${action} programado desde ${fromHour}:${fromMinute} ${fromPeriod} hasta ${toHour}:${toMinute} ${toPeriod} los días: ${selectedDays.join(
                ', '
              )}`,
            });
          }
        } else {
          const data = await res.json();
          toast({
            title: 'Error',
            description: `No se pudo programar ${action}. ${data.message}`,
            variant: 'destructive',
          });
        }
      });
    } catch {
      toast({
        title: 'Error',
        description: `No se pudo programar ${action}.`,
        variant: 'destructive',
      });
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSetInput = (input: string) => {
    const { ip: host } = selectedRow.original;

    fetch('/api/projectors/sendCommand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port: 8080, command: SET_INPUT(input) }),
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
      <Label className='text-md font-bold'>Programar encendido y apagado</Label>

      <div className='flex flex-col space-y-1.5 mb-5'>
        <Label htmlFor='action'>Acción</Label>
        <Select value={action} onValueChange={setAction} disabled={isProjectorDisabled}>
          <SelectTrigger id='action'>
            <SelectValue placeholder='Select action' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Encendido y apagado'>Encendido y apagado</SelectItem>
            <SelectItem value='Encendido'>Encendido</SelectItem>
            <SelectItem value='Apagado'>Apagado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-2 gap-4 max-sm:grid-cols-1'>
        <TimePicker
          label={action === 'Encendido y apagado' ? 'Desde' : 'A las'}
          hour={fromHour}
          minute={fromMinute}
          period={fromPeriod}
          setHour={setFromHour}
          setMinute={setFromMinute}
          setPeriod={setFromPeriod}
        />
        {action === 'Encendido y apagado' && (
          <TimePicker
            label='Hasta'
            hour={toHour}
            minute={toMinute}
            period={toPeriod}
            setHour={setToHour}
            setMinute={setToMinute}
            setPeriod={setToPeriod}
          />
        )}
      </div>
      <div className='space-y-2'>
        <Label className='text-md font-bold'>Días de la semana</Label>
        <div className='flex flex-wrap gap-4 items-center'>
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              variant={selectedDays.includes(day) ? 'default' : 'outline'}
              onClick={() => handleDayToggle(day)}
              className='w-[calc(33.33%-0.5rem)] sm:w-auto'
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
      {!selectedRow && (
        <div className='flex flex-col space-y-1.5 mb-5'>
          <Label htmlFor='input'>Entrada del Proyector</Label>
          <Select value={input} onValueChange={setInput} disabled={isProjectorDisabled}>
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
      )}
      <Button onClick={handleSetTime} disabled={isProjectorDisabled || selectedDays.length === 0}>
        Configurar Tiempo
      </Button>
      {!selectedRows && (
        <>
          <Separator className='my-5' />
          <div className='flex flex-col space-y-1.5'>
            <Label htmlFor='input'>Entrada del Proyector</Label>
            <Select value={input} onValueChange={setInput} disabled={isProjectorDisabled}>
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
          <Button onClick={() => handleSetInput(input)} disabled={isProjectorDisabled}>
            Configurar Entrada
          </Button>
        </>
      )}
    </>
  );
};
