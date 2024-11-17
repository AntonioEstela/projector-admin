'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, ingrese su correo electrónico.');
      return;
    }

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.message || 'Ocurrió un error. Inténtalo nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error. Inténtalo nuevamente.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetCode || resetCode.length !== 6) {
      setError('Por favor, ingrese el código de 6 dígitos válido.');
      return;
    }

    try {
      console.log(resetCode);
      const res = await fetch('/api/auth/validate-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        setError(data.message || 'Código inválido. Inténtalo nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error. Inténtalo nuevamente.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(4);
      } else {
        setError(data.message || 'Ocurrió un error. Inténtalo nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error. Inténtalo nuevamente.');
    }
  };

  return (
    <Card className='max-w-sm mx-auto mt-36'>
      <CardHeader>
        <h2 className='text-2xl font-semibold'>Restablecer contraseña</h2>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Correo electrónico</Label>
              <Input
                id='email'
                type='email'
                placeholder='Ingrese su correo electrónico registrado'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type='submit' className='w-full'>
              Solicitar código de restablecimiento
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='resetCode'>Código de restablecimiento</Label>
              <Input
                id='resetCode'
                type='text'
                placeholder='Ingrese el código de 6 dígitos'
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <Button type='submit' className='w-full'>
              Verificar código
            </Button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>Nueva contraseña</Label>
              <Input
                id='newPassword'
                type='password'
                placeholder='Ingrese su nueva contraseña'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirmar nueva contraseña</Label>
              <Input
                id='confirmPassword'
                type='password'
                placeholder='Confirme su nueva contraseña'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type='submit' className='w-full'>
              Restablecer contraseña
            </Button>
          </form>
        )}
        {step === 4 && (
          <Alert className='mb-4'>
            <AlertDescription>
              Su contraseña ha sido restablecida con éxito. Ahora puede iniciar sesión con su nueva contraseña.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Button variant='link' onClick={() => router.push('/')}>
          Volver al inicio de sesión
        </Button>
      </CardFooter>
    </Card>
  );
}
