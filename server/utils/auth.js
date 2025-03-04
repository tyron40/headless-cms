import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Generate JWT token
export const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Verify and get user from token
export const getUser = async (token) => {
  if (!token || !token.startsWith('Bearer ')) {
    return null;
  }

  try {
    const tokenValue = token.split(' ')[1];
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user;
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (user) => {
  if (!user) throw new Error('Authentication required');
  return true;
};

// Check if user has required role
export const hasRole = (user, roles) => {
  if (!user) throw new Error('Authentication required');
  
  if (Array.isArray(roles)) {
    if (!roles.includes(user.role)) {
      throw new Error(`Required role: ${roles.join(' or ')}`);
    }
  } else if (user.role !== roles) {
    throw new Error(`Required role: ${roles}`);
  }
  
  return true;
};