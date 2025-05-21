'use client';

import { userService } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Secret key for JWT - in a real app, this would be an environment variable
const JWT_SECRET = 'midwifery-app-secret-key';

// User roles
export const ROLES = {
  MIDWIFE: 'midwife',
  CLIENT: 'client',
};

// Authentication service
export const authService = {
  // Register a new user
  async register(userData) {
    try {
      // Check if user with this email already exists
      const existingUser = await userService.getByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user object
      const user = {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role || ROLES.CLIENT, // Default to client role
        createdAt: new Date().toISOString(),
      };
      
      // Save user to database
      const userId = await userService.add(user);
      
      // Get the created user
      const createdUser = await userService.getById(userId);
      
      // Create JWT token
      const token = this.generateToken(createdUser);
      
      // Return user info (excluding password) and token
      const { password, ...userWithoutPassword } = createdUser;
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login a user
  async login(email, password) {
    try {
      // Find user by email
      const user = await userService.getByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      // Return user info (excluding password) and token
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );
  },
  
  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  },
  
  // Get current user from token
  getCurrentUser() {
    try {
      // Get token from local storage
      const token = localStorage.getItem('midwifery_token');
      if (!token) return null;
      
      // Verify token
      const decoded = this.verifyToken(token);
      if (!decoded) {
        localStorage.removeItem('midwifery_token');
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('midwifery_token');
  },
  
  // Check if user is a midwife
  isMidwife() {
    const user = this.getCurrentUser();
    return user && user.role === ROLES.MIDWIFE;
  },
  
  // Check if user is a client
  isClient() {
    const user = this.getCurrentUser();
    return user && user.role === ROLES.CLIENT;
  },
};
