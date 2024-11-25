'use client';
import { Avatar, AvatarFallback } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { IUser } from '@/models/User';
import { getBaseURL, getUser, isAdmin } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { useState } from 'react';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Button } from './button';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { firstName, lastName, role }: IUser = getUser();
  const userInitials = `${firstName[0]}${lastName[0]}`;
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`${getBaseURL()}/api/auth/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ email: inputEmail, role: selectedRole }),
    })
      .then((res) => {
        if (res.ok) {
          // update local storage and reload the page
          const user = getUser();
          user.role = selectedRole;
          localStorage.setItem('user', JSON.stringify(user));
          toast({
            title: 'Usuario actualizado',
            description:
              'El usuario ha sido actualizado con éxito. Si usted cambió su propio rol, por favor, recargue la página.',
          });
          setOpen(false);
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo actualizar el usuario. Por favor, inténtelo de nuevo.',
            variant: 'destructive',
          });
          console.error('Failed to update user');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setInputEmail(value);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className='cursor-pointer'>
          <Avatar>
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{firstName + ' ' + lastName}</DropdownMenuLabel>
          <DropdownMenuLabel className='font-thin -mt-3 text-gray-400'>
            {role[0].toUpperCase() + role.slice(1)}
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpen(!open)}>Administrar usuarios</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='text-red-500' onClick={handleLogout}>
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isAdmin() && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Administra un Usuario</DialogTitle>
            </DialogHeader>
            <DialogDescription>Selecciona un usuario para seleccionar el rol a asignar.</DialogDescription>
            <form onSubmit={handleEdit}>
              <div className='flex flex-row mb-10'>
                <Input
                  type='email'
                  placeholder='Buscar usuario por correo'
                  onChange={handleInputChange}
                  className='mr-4'
                  required={true}
                />
                <Select onValueChange={setSelectedRole} required={true}>
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='Rol' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>Usuario</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type='submit' variant='default' className='w-full'>
                Actualizar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
