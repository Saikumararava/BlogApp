import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent, TextField, Button, List, ListItem, ListItemText, Pagination } from '@mui/material';
import { getUser, getToken } from '../utils/auth';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [totalComments, setTotalComments] = useState(0);
  const limit = 5;

  useEffect(() => { fetch(); }, [id, commentPage]);

  async function fetch() {
    const res = await api.get(`/posts/${id}?page=${commentPage}&limit=${limit}`);
    setPost(res.data.post);
    setComments(res.data.comments.data);
    setTotalComments(res.data.comments.total);
  }

  async function submitComment() {
    if (!getToken()) { alert('Please sign in to comment'); return; }
    await api.post(`/posts/${id}/comments`, { message });
    setMessage('');
    setCommentPage(1);
    fetch();
  }

  if (!post) return <div>Loading...</div>;

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h4">{post.title}</Typography>
          <Typography variant="subtitle1">By {post.author?.name}</Typography>
          <Typography sx={{ mt: 2 }}>{post.content}</Typography>
        </CardContent>
      </Card>

      <Typography variant="h6">Comments</Typography>
      <List>
        {comments.map(c => (
          <ListItem key={c._id}>
            <ListItemText primary={c.message} secondary={`${c.author?.name || c.author?.email} — ${new Date(c.createdAt).toLocaleString()}`} />
          </ListItem>
        ))}
      </List>
      <Pagination count={Math.ceil(totalComments / limit)} page={commentPage} onChange={(e, v) => setCommentPage(v)} />

      <div style={{ marginTop: 16 }}>
        <TextField label="Add comment" fullWidth multiline minRows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button variant="contained" sx={{ mt: 1 }} onClick={submitComment}>Submit</Button>
      </div>
    </>
  );
}
