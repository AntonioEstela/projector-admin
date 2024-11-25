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

    // make a request to the backend to set the time
    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddresses,
          fromTime,
          toTime,
          daysOfWeek: selectedDays,
          input,
        }),
      }).then(async (res) => {
        if (res.ok) {
          toast({
            title: 'Tiempo configurado',
            description: `Encendido programado desde ${fromHour}:${fromMinute} ${fromPeriod} hasta ${toHour}:${toMinute} ${toPeriod} los días: ${selectedDays.join(
              ', '
            )}`,
          });
        } else {
          const data = await res.json();
          toast({
            title: 'Error',
            description: `No se pudo programar encendido. ${data.message}`,
            variant: 'destructive',
          });
        }
      });
    } catch {
      toast({
        title: 'Error',
        description: `No se pudo programar encendido.`,
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
      <div className='space-y-2'>
        <Label className='text-md font-bold'>Días de la semana</Label>
        <div className='flex flex-wrap gap-2'>
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
