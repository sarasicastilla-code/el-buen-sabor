import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOjExRuCEvvFpNrTRjUJYJREouJ6-c0UQ",
  authDomain: "polleria-el-buen-sabor-a0073.firebaseapp.com",
  projectId: "polleria-el-buen-sabor-a0073",
  storageBucket: "polleria-el-buen-sabor-a0073.firebasestorage.app",
  messagingSenderId: "254649347629",
  appId: "1:254649347629:web:a1cfcc6c62df95e21912a4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);