'use client'
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
// import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
//   const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: 'primary.main', p: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" color="white">
        Stock Index Monitor
      </Typography>
      
      
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/dashboard" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/stats" passHref>
            <Button color="inherit">Stats</Button>
          </Link>
          <Link href="/" >
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
          </Link>
         
        </Box>
      
    </Box>
  );
}