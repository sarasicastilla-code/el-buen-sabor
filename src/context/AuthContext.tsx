import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { Usuario } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  usuario: Usuario | null;
  loading: boolean;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  usuario: null,
  loading: true,
  cerrarSesion: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'usuarios', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().activo !== false) {
            setUsuario(docSnap.data() as Usuario);
          } else {
            await firebaseSignOut(auth);
            setUsuario(null);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await firebaseSignOut(auth);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, usuario, loading, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};