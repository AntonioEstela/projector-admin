'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from './card';
import { isTokenExpired } from '@/lib/jwt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

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
      const res = await fetch(`/api/auth/login`, {
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
    <div className='relative min-h-screen flex items-center justify-center'>
      <Image src='/login-background.png' alt='Login' layout='fill' className='absolute inset-0 z-0 object-cover' />
      <div className='relative z-10 w-5/6 max-w-sm mx-auto'>
        <Card className='drop-shadow-lg backdrop-blur-md bg-white/60 border-white/10'>
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
                  className='backdrop-blur-sm bg-white/5 border-white/10'
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
                  className='backdrop-blur-sm bg-white/5 border-white/10'
                />
              </div>
              <div className='flex items-center justify-between'>
                <a href='/reset-password' className='text-sm text-blue-600 hover:underline'>
                  Olvidé mi contraseña
                </a>
                <Button type='submit'>Ingresar</Button>
              </div>
            </form>
            <div className='pt-6 mt-6 text-center border-t border-gray-300'>
              <p className='mb-4 text-sm text-gray-600'>¿No tienes una cuenta?</p>
              <Button
                variant='outline'
                className='w-full backdrop-blur-sm bg-white-10 border-none hover:bg-white/40'
                onClick={() => router.push('/register')}
              >
                Crear una nueva cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
