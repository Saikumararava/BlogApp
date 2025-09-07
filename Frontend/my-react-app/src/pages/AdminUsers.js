import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getUser } from '../utils/auth';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography } from '@mui/material';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const user = getUser();

  useEffect(() => {
    if (!user || !user.roles.includes('APP_ADMIN')) return;
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await api.get('/admin/users?page=1&limit=50');
    setUsers(res.data.data);
  }

  async function changeRole(id, role) {
    await api.patch(`/admin/users/${id}/role`, { role });
    fetchUsers();
  }

  if (!user || !user.roles.includes('APP_ADMIN')) return <div>Forbidden</div>;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>Admin - Users</Typography>
      <Table>
        <TableHead>
          <TableRow><TableCell>Email</TableCell><TableCell>Roles</TableCell><TableCell>Actions</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u._id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.roles.join(', ')}</TableCell>
              <TableCell>
                <Button onClick={() => changeRole(u._id, 'AUTHOR')}>Grant Author</Button>
                <Button onClick={() => changeRole(u._id, 'USER')}>Revoke to User</Button>
                <Button onClick={() => changeRole(u._id, 'APP_ADMIN')}>Grant Admin</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
