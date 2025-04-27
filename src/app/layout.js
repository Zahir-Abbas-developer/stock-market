'use client'

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from './components/navbar';
import { AuthProvider, useAuth } from './context/AuthContext'; // Ensure correct path
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  const [email ,setEmail]=useState('')
  // const {user}=useAuth()
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setEmail(user?.email)
      });
  
      return () => unsubscribe();
    }, []);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* Make sure AuthProvider wraps the entire tree */}
      {email&& <Navbar/>}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
