'use client'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// apiKey: "AIzaSyBr7L2I0AyuFQ5VcTuxm0_2qbsTGiN-5JI",
// authDomain: "playbook-59a53.firebaseapp.com",
// projectId: "playbook-59a53",
// storageBucket: "playbook-59a53.appspot.com",
// messagingSenderId: "476962525328",
// appId: "1:476962525328:web:b875edd83b6482219a8815",
const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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