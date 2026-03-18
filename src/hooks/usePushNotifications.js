// src/hooks/usePushNotifications.js
import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '../services/api';
import toast from 'react-hot-toast';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: 'matrimonyapp-e516c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = 'BKsaUu-76z5jyVCP2U2KPGe6olU1iJa0aKTGFVkNdUA_W4h4siaLjZ-x9wZFEfJKCOpdHAAJAlQM';

let firebaseApp;
let messaging;

const getFirebaseMessaging = () => {
  if (!firebaseApp) firebaseApp = initializeApp(firebaseConfig);
  if (!messaging) messaging = getMessaging(firebaseApp);
  return messaging;
};

export default function usePushNotifications(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const msg = getFirebaseMessaging();
        const token = await getToken(msg, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          await api.post('/notifications/token', { token, platform: 'web' });
          console.log('✅ FCM token registered');
        }

        // Handle foreground messages — plain toast, no JSX
        onMessage(msg, (payload) => {
          const title = payload.notification?.title || 'New notification';
          const body = payload.notification?.body || '';
          toast(`🔔 ${title}${body ? ` — ${body}` : ''}`, { duration: 5000 });
        });
      } catch (err) {
        console.error('FCM setup error:', err);
      }
    };

    setup();
  }, [isAuthenticated]);
}
