import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, push, update, remove, onDisconnect } from 'firebase/database'

// Ganti dengan config dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBDnWkgTeEg7w3AJan62FTaj-9H7pnV5xU",
  authDomain: "ularmanjatdinding.firebaseapp.com",
  databaseURL: "https://ularmanjatdinding-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ularmanjatdinding",
  storageBucket: "ularmanjatdinding.firebasestorage.app",
  messagingSenderId: "67279210491",
  appId: "1:67279210491:web:d3498b290ab4a0bff0ad5e",
  measurementId: "G-VRYKCCTG8K"
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { db, ref, set, onValue, push, update, remove, onDisconnect }