'use client'
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Container, Link } from '@mui/material';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create user with Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Redirect to home page after successful signup
      router.push('/');
    } catch (err) {
      // Handle Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email already in use');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        default:
          setError(err.message);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Account
        </Typography>
        
        {/* Display error message if exists */}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Password must be at least 6 characters"
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </form>
        
        <Typography sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/" underline="hover">
            Log in
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}