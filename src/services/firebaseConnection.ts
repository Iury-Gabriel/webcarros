import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyACCXRbYsx-wJ9Mh5L2E8S7SbtZT3DhS30",
  authDomain: "webcarros-e4ca9.firebaseapp.com",
  projectId: "webcarros-e4ca9",
  storageBucket: "webcarros-e4ca9.appspot.com",
  messagingSenderId: "700470705210",
  appId: "1:700470705210:web:7bf02f0657966c06930903"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };