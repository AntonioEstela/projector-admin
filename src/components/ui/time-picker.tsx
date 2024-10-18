'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TimePicker() {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className='flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0'>
      <div className='flex flex-col space-y-1.5'>
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger id='hour' className='w-[100px]'>
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
      </div>
      <div className='flex flex-col space-y-1.5'>
        <Select value={minute} onValueChange={setMinute}>
          <SelectTrigger id='minute' className='w-[100px]'>
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
      </div>
      <div className='flex flex-col space-y-1.5'>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger id='period' className='w-[70px]'>
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
