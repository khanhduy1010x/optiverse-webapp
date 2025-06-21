// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDPeBw2VCazWEZCaxysjfd57QDz8WrItJM',
  authDomain: 'optiverse-459dc.firebaseapp.com',
  databaseURL:
    'https://optiverse-459dc-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'optiverse-459dc',
  storageBucket: 'optiverse-459dc.firebasestorage.app',
  messagingSenderId: '114877392066',
  appId: '1:114877392066:web:769ea3805dae4457b1075b',
  measurementId: 'G-NNXHP0CN23',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getDatabase(app);

export default app;
