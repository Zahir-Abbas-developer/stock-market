'use client'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAavg2O0NTeezjsI9_SQAH4abMFIhgwIek",
  authDomain: "stock-market-3edbb.firebaseapp.com",
  projectId: "stock-market-3edbb",
  storageBucket: "stock-market-3edbb.firebasestorage.app",
  messagingSenderId: "961441114045",
  appId: "1:961441114045:web:30013c8eda7c5c5018d4d4",
  measurementId: "G-6XX64JW83Y"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { auth };