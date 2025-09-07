// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PostsList from './pages/PostsList';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PostEditor from './pages/PostEditor';
import AdminUsers from './pages/AdminUsers';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <>
      <Header />

      <div style={{ paddingTop: 24 }}>
        <Routes>
          <Route path="/" element={<PostsList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Any authenticated user can write/edit (authors/admins should be checked in PostEditor too) */}
          <Route
            path="/write"
            element={
              <PrivateRoute>
                <PostEditor />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <PostEditor />
              </PrivateRoute>
            }
          />

          {/* Admin-only route */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRoles={['APP_ADMIN']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}
