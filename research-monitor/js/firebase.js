// Firebase config & auth init for Spectrum Research Monitor

const firebaseConfig = {
    apiKey: "AIzaSyCilWbme84ANKVKc2clsO5Zl1zzd9f0OEw",
    authDomain: "ad-infinitum-2eac8.firebaseapp.com",
    projectId: "ad-infinitum-2eac8",
    storageBucket: "ad-infinitum-2eac8.firebasestorage.app",
    messagingSenderId: "1033641733165",
    appId: "1:1033641733165:web:f6b7518efaeebfa8085ca4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const OWNER_EMAIL = "chocowizx@gmail.com";

function isOwner(user) {
    return user && user.email === OWNER_EMAIL;
}
