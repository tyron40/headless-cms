import React, { createContext, useState, useEffect, useContext } from 'react';
import { useApolloClient, gql } from '@apollo/client';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const client = useApolloClient();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await client.query({
            query: ME_QUERY,
            fetchPolicy: 'network-only',
          });
          
          if (data.me) {
            setUser(data.me);
            setIsAuthenticated(true);
          } else {
            // Token is invalid
            logout();
          }
        } catch (error) {
          // Token is invalid
          logout();
        }
      }
    };

    fetchUser();
  }, [token, client]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    client.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);