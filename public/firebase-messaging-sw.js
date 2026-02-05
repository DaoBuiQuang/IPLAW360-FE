// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/11.7.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.7.3/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyDhlu763Buze3CR8PhhZXnDqi0u0zWDEno",
  authDomain: "fir-notification-sample-1cfeb.firebaseapp.com",
  projectId: "fir-notification-sample-1cfeb",
  storageBucket: "fir-notification-sample-1cfeb.firebasestorage.app",
  messagingSenderId: "696843593060",
  appId: "1:696843593060:web:fb70303bb7c02098d14671",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
