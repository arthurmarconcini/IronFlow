import { initializeApp } from 'firebase/app'

// @ts-expect-error - Firebase SDK has a mismatch between its TypeScript definitions and its package structure.
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDsrHhPaPSnL1qVzNezUBbevAhbxOd3ViU',
  authDomain: 'iron-flow-82ad8.firebaseapp.com',
  projectId: 'iron-flow-82ad8',
  storageBucket: 'iron-flow-82ad8.firebasestorage.app',
  messagingSenderId: '804529765039',
  appId: '1:804529765039:web:e33e4f123420b646c0f25a',
  measurementId: 'G-9R9KFEJ0D0',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})
