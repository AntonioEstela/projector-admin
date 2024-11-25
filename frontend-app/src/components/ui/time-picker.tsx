import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export default function TimePicker({
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
