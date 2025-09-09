// src/App.js
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PostsList from './pages/PostsList';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PostEditor from './pages/PostEditor';
import AdminUsers from './pages/AdminUsers';
import PrivateRoute from './components/PrivateRoute';

// Optional: if you want to lazy-load pages in future, example:
// const PostsList = React.lazy(() => import('./pages/PostsList'));

export default function App() {
  // If your app is served from a subpath (e.g. /blog), set REACT_APP_BASENAME=/blog in Render env.
  const basename = process.env.REACT_APP_BASENAME || '/';

  return (
    <BrowserRouter basename={basename}>
      {/* Suspense is lightweight here so future lazy() imports will show a fallback */}
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
    </BrowserRouter>
  );
}
