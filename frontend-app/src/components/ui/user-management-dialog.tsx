'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export function UserManagementDialog({
  open,
  setOpen,
  handleEdit,
  handleUserDelete,
  wasUserUpdated,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleEdit: (e: React.FormEvent, email: string, role: string) => void;
  handleUserDelete: (email: string) => void;
  wasUserUpdated: boolean;
}) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function getUsers() {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      return data;
    }

    getUsers().then((data) => setUsers(data));
  }, [wasUserUpdated]);
  const [selectedRole, setSelectedRole] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Usuarios</DialogTitle>
          <DialogDescription>Aquí puedes ver y editar los usuarios de la aplicación.</DialogDescription>
        </DialogHeader>
        <div className='overflow-y-auto max-h-[60vh]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName + ' ' + user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select onValueChange={setSelectedRole} required={true}>
                      <SelectTrigger className='w-[150px]'>
                        <SelectValue placeholder={user.role === 'admin' ? 'Admin' : 'Usuario'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='admin'>Admin</SelectItem>
                        <SelectItem value='user'>Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className='flex space-x-2'>
                      <Button onClick={(e) => handleEdit(e, user.email, selectedRole)} size='sm'>
                        Actualizar
                      </Button>
                      <Button onClick={() => handleUserDelete(user.email)} variant='destructive' size='sm'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
