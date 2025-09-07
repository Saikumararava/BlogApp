import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Switch, FormControlLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { getUser } from '../utils/auth';

export default function PostEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    const res = await api.get(`/posts/${id}`);
    setTitle(res.data.post.title);
    setContent(res.data.post.content);
    setPublished(res.data.post.status === 'PUBLISHED');
  }

  async function handleSave() {
    try {
      if (id) {
        await api.patch(`/posts/${id}`, { title, content, status: published ? 'PUBLISHED' : 'DRAFT' });
      } else {
        const res = await api.post('/posts', { title, content });
        if (published) {
          await api.patch(`/posts/${res.data._id}`, { status: 'PUBLISHED' });
        }
      }
      nav('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving');
    }
  }

  const user = getUser();
  if (!user) return <div>Please sign in</div>;

  if (!user.roles.includes('AUTHOR') && !user.roles.includes('APP_ADMIN')) {
    return <div>Forbidden: only authors/admin can write posts</div>;
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <TextField label="Title" fullWidth sx={{ mb: 2 }} value={title} onChange={e => setTitle(e.target.value)} />
      <TextField label="Content" fullWidth multiline minRows={8} sx={{ mb: 2 }} value={content} onChange={e => setContent(e.target.value)} />
      <FormControlLabel control={<Switch checked={published} onChange={(e) => setPublished(e.target.checked)} />} label="Publish now" />
      <Button variant="contained" sx={{ ml: 2 }} onClick={handleSave}>Save</Button>
    </Box>
  );
}
