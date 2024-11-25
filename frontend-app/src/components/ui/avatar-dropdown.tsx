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
import { getUser, isAdmin } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { UserManagementDialog } from './user-management-dialog';

export function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const [wasUserUpdated, setWasUserUpdated] = useState(false);
  const { firstName, lastName, role }: IUser = getUser();
  const userInitials = `${firstName[0]}${lastName[0]}`;
  const router = useRouter();
  const isUserAdmin = isAdmin();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleEdit = async (e: React.FormEvent, email: string, role: string) => {
    e.preventDefault();
    fetch(`/api/auth/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ email, role }),
    })
      .then((res) => {
        if (res.ok) {
          // update local storage and reload the page
          toast({
            title: 'Usuario actualizado',
            description:
              'El usuario ha sido actualizado con éxito. Si usted cambió su propio rol, por favor, inicie sesión de nuevo.',
          });
          setOpen(false);
          setWasUserUpdated(!wasUserUpdated);
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

  const handleUserDelete = async (email: string) => {
    fetch(`/api/auth/user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ email }),
    })
      .then((res) => {
        if (res.ok) {
          // update local storage and reload the page
          toast({
            title: 'Usuario eliminado',
            description: 'El usuario ha sido eliminado con éxito.',
          });
          setOpen(false);
          setWasUserUpdated(!wasUserUpdated);
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo eliminar el usuario. Por favor, inténtelo de nuevo.',
            variant: 'destructive',
          });
          console.error('Failed to delete user');
        }
      })
      .catch((err) => {
        console.error(err);
      });
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
          {isUserAdmin && <DropdownMenuItem onClick={() => setOpen(!open)}>Administrar usuarios</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem className='text-red-500' onClick={handleLogout}>
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isUserAdmin && (
        <UserManagementDialog
          open={open}
          setOpen={setOpen}
          handleEdit={handleEdit}
          handleUserDelete={handleUserDelete}
          wasUserUpdated={wasUserUpdated}
        />
      )}
    </>
  );
}
