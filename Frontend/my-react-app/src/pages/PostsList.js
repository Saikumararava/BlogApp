import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardContent, Typography, Grid, Button, Pagination } from '@mui/material';
import { Link } from 'react-router-dom';

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetch();
  }, [page]);

  async function fetch() {
    const res = await api.get(`/posts?status=PUBLISHED&page=${page}&limit=${limit}`);
    setPosts(res.data.data);
    setTotal(res.data.total);
  }

  return (
    <>
      <Grid container spacing={2}>
        {posts.map(p => (
          <Grid item xs={12} key={p._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.title}</Typography>
                <Typography variant="subtitle2">By {p.author?.name || p.author?.email} — {p.published_at ? new Date(p.published_at).toLocaleString() : ''}</Typography>
                <Button component={Link} to={`/posts/${p._id}`}>Read</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(total / limit)}
        page={page}
        onChange={(e, v) => setPage(v)}
        sx={{ mt: 2 }}
      />
    </>
  );
}
