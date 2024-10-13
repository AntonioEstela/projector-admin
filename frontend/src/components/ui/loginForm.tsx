'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the login logic
    console.log('Login attempted with:', { email, password });
  };

  return (
    <div className='max-w-sm mx-auto mt-10'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='Ingrese su email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>Contraseña</Label>
          <Input
            id='password'
            type='password'
            placeholder='Ingrese su contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className='flex items-center justify-between'>
          <a href='/reset-password' className='text-sm text-blue-600 hover:underline'>
            Olvidé mi contraseña
          </a>
          <Button type='submit'>Ingresa</Button>
        </div>
      </form>
      <div className='mt-6 pt-6 border-t border-gray-200 text-center'>
        <p className='text-sm text-gray-600 mb-4'>¿No tienes una cuenta?</p>
        <Button variant='outline' className='w-full' onClick={() => (window.location.href = '/register')}>
          Crea una nueva cuenta
        </Button>
      </div>
    </div>
  );
}
