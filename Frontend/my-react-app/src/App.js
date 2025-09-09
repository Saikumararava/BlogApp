// src/App.js
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PostsList from './pages/PostsList';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PostEditor from './pages/PostEditor';
import AdminUsers from './pages/AdminUsers';
import PrivateRoute from './components/PrivateRoute';

// If you need basename support (e.g. app served under /blog), pass it from index.js
// Example in index.js: <BrowserRouter basename={process.env.REACT_APP_BASENAME || '/'}>

export default function App() {
  return (
    // Suspense is lightweight here so future lazy() imports will show a fallback
    <Suspense fallback={<div>Loading…</div>}>
      <Header />

      <div style={{ paddingTop: 24 }}>
        <Routes>
          <Route path="/" element={<PostsList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Any authenticated user can write/edit (additional role checks inside PostEditor) */}
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

          {/* Catch-all: redirect unknown routes to home (prevents browser 404s on refresh) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Suspense>
  );
}
