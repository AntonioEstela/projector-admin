'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }
  return errors;
};
export default function NewUserRegistration() {
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const errors = validatePassword(password);
    setPasswordErrors(errors);

    if (errors.length > 0) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordErrors(['Las contraseñas no coinciden']);
    } else {
      setPasswordErrors([]);
      // Aquí iría la lógica para enviar los datos del formulario

      const { email, password, nombre, apellido } = Object.fromEntries(formData);
      const registrationResponse = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName: nombre, lastName: apellido, role: 'user' }),
      });
      const response = await registrationResponse;
      if (response.ok) {
        router.push('/');
      }
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    const errors = validatePassword(password);
    setPasswordErrors(errors);
    setPasswordStrength(5 - errors.length);
  };

  return (
    <Card className='w-full max-w-md mx-auto mt-20'>
      <CardHeader>
        <CardTitle>Registro de Usuario</CardTitle>
        <CardDescription>Por favor, completa todos los campos para crear tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Correo electrónico</Label>
            <Input id='email' name='email' type='email' placeholder='tu@ejemplo.com' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='nombre'>Nombre</Label>
            <Input id='nombre' name='nombre' placeholder='Juan' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='apellido'>Apellido</Label>
            <Input id='apellido' name='apellido' placeholder='Pérez' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              id='password'
              name='password'
              type='password'
              placeholder='••••••••'
              required
              onChange={handlePasswordChange}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirmar contraseña</Label>
            <Input id='confirmPassword' name='confirmPassword' type='password' placeholder='••••••••' required />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <div className='text-sm font-medium'>Fortaleza de la contraseña:</div>
              <div className='flex space-x-1'>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-5 h-2 rounded ${level <= passwordStrength ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            {passwordErrors.length > 0 && (
              <Alert variant='destructive'>
                <AlertCircle className='w-4 h-4' />
                <AlertDescription>
                  <ul className='list-disc list-inside'>
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {passwordErrors.length === 0 && passwordStrength > 0 && (
              <Alert variant='default' className='text-green-700 border-green-200 bg-green-50'>
                <CheckCircle2 className='w-4 h-4' />
                <AlertDescription>La contraseña cumple con todos los requisitos</AlertDescription>
              </Alert>
            )}
          </div>
          <Button type='submit' className='w-full'>
            Registrarse
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
