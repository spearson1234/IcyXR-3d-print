// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlcI_JtmeNMcJxvjvUER5W1ROCH0uOfn4", // This is a public key
  authDomain: "test-83d1d.firebaseapp.com",
  databaseURL: "https://test-83d1d-default-rtdb.firebaseio.com",
  projectId: "test-83d1d",
  storageBucket: "test-83d1d.appspot.com",
  messagingSenderId: "1060438880379",
  appId: "1:1060438880379:web:a22b03441ea97c16b3b2de"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Make auth and db globally available for the main app
window.db = firebase.database();
window.auth = firebase.auth();