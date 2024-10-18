'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the login logic
    // Currently using a placeholder to simulate a login attempt
    console.log('Login attempted with:', { email, password });
    router.push('/dashboard');
  };

  return (
    <div className='max-w-sm mx-auto mt-36'>
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
      <div className='pt-6 mt-6 text-center border-t border-gray-200'>
        <p className='mb-4 text-sm text-gray-600'>¿No tienes una cuenta?</p>
        <Button variant='outline' className='w-full' onClick={() => (window.location.href = '/register')}>
          Crea una nueva cuenta
        </Button>
      </div>
    </div>
  );
}
