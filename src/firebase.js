import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, push, update, remove, onDisconnect } from 'firebase/database'

// Ganti dengan config dari Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { db, ref, set, onValue, push, update, remove, onDisconnect }