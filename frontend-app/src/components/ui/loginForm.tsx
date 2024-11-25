'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from './card';
import { isTokenExpired } from '@/lib/jwt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBaseURL } from '@/lib/utils';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if the user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');

    // If token exists and is valid, redirect to the dashboard
    if (token && !isTokenExpired(token)) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const res = await fetch(`${getBaseURL()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store the JWT token in localStorage
        localStorage.setItem('token', data.token);

        // store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data));
        // Redirect to the dashboard
        router.push('/dashboard');
      } else if (res.status === 401) {
        setError('La combinación de correo electrónico y contraseña es incorrecta.');
      } else {
        setError(data.message || 'Ocurrió un error. Inténtalo nuevamente.');
      }
    } catch {
      setError('Ocurrió un error. Inténtalo nuevamente.');
    }
  };

  return (
    <Card className='max-w-sm mx-auto mt-36'>
      <CardHeader>
        <h2 className='text-2xl font-semibold'>Iniciar sesión</h2>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Correo electrónico</Label>
            <Input
              id='email'
              type='email'
              placeholder='Ingrese su correo electrónico'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete='email'
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
              autoComplete='current-password'
              required
            />
          </div>
          <div className='flex items-center justify-between'>
            <a href='/reset-password' className='text-sm text-blue-600 hover:underline'>
              Olvidé mi contraseña
            </a>
            <Button type='submit'>Ingresar</Button>
          </div>
        </form>
        <div className='pt-6 mt-6 text-center border-t border-gray-200'>
          <p className='mb-4 text-sm text-gray-600'>¿No tienes una cuenta?</p>
          <Button variant='outline' className='w-full' onClick={() => router.push('/register')}>
            Crear una nueva cuenta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
