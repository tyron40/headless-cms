import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ContentTypes from './pages/ContentTypes';
import ContentTypeForm from './pages/ContentTypeForm';
import Contents from './pages/Contents';
import ContentForm from './pages/ContentForm';
import Media from './pages/Media';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// Create HTTP link
const httpLink = createHttpLink({
  uri: '/graphql',
});

// Add authentication to headers
const authLink = setContext((_, { headers }) => {
  // Get token from local storage
  const token = localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/content-types" element={
                <PrivateRoute>
                  <ContentTypes />
                </PrivateRoute>
              } />
              
              <Route path="/content-types/new" element={
                <PrivateRoute>
                  <ContentTypeForm />
                </PrivateRoute>
              } />
              
              <Route path="/content-types/:id" element={
                <PrivateRoute>
                  <ContentTypeForm />
                </PrivateRoute>
              } />
              
              <Route path="/contents" element={
                <PrivateRoute>
                  <Contents />
                </PrivateRoute>
              } />
              
              <Route path="/contents/new" element={
                <PrivateRoute>
                  <ContentForm />
                </PrivateRoute>
              } />
              
              <Route path="/contents/:id" element={
                <PrivateRoute>
                  <ContentForm />
                </PrivateRoute>
              } />
              
              <Route path="/media" element={
                <PrivateRoute>
                  <Media />
                </PrivateRoute>
              } />
              
              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;