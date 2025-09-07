import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function PostCard({ post }) {
  const publishedDate = post.published_at || post.createdAt;
  const dateStr = publishedDate ? new Date(publishedDate).toLocaleString() : '';

  return (
    <Card sx={{ textAlign: 'center' }}>
      <CardContent>
        <Typography variant="h6" align="center">
          {post.title}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1 }} align="center">
          By {post.author?.name || post.author?.email} — {dateStr}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} align="center">
          {post.content
            ? post.content.length > 200
              ? post.content.slice(0, 200) + '…'
              : post.content
            : ''}
        </Typography>
      </CardContent>
      <CardActions>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button
            size="small"
            component={RouterLink}
            to={`/posts/${post._id}`}
          >
            Read
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
