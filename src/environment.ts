// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB-Zm8nLbf0_x9SyMkltxU15PLnWgqdLRQ',
  authDomain: 'ace-closet-website.firebaseapp.com',
  projectId: 'ace-closet-website',
  storageBucket: 'ace-closet-website.appspot.com',
  messagingSenderId: '1053899946118',
  appId: '1:1053899946118:web:0288252318387240e0f907',
  measurementId: 'G-Q5K7BCCZF6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const perf = getPerformance(app);
