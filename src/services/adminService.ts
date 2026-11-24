import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Mesa, Producto } from '../types';

// --- GESTIÓN DE MESAS ---
export const suscribirMesas = (callback: (mesas: Mesa[]) => void) => {
  const q = query(collection(db, 'mesas'), orderBy('numero', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Mesa));
    callback(lista);
  });
};

export const crearMesa = async (numero: number, capacidad: number) => {
  await addDoc(collection(db, 'mesas'), {
    numero,
    capacidad,
    estado: 'libre',
    atencionActivaId: null,
  });
};

// --- GESTIÓN DE CATEGORÍAS ---
export const suscribirCategorias = (callback: (cats: any[]) => void) => {
  const q = query(collection(db, 'categorias'), orderBy('orden', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(lista);
  });
};

export const crearCategoria = async (nombre: string, orden: number) => {
  await addDoc(collection(db, 'categorias'), {
    nombre,
    orden,
    activa: true,
  });
};

// --- GESTIÓN DE PRODUCTOS (CARTA DIGITAL) ---
export const suscribirProductos = (callback: (prods: Producto[]) => void) => {
  const q = query(collection(db, 'productos'), orderBy('nombre', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Producto));
    callback(lista);
  });
};

export const crearProducto = async (producto: Omit<Producto, 'id' | 'creadoEn'>) => {
  await addDoc(collection(db, 'productos'), {
    ...producto,
    creadoEn: serverTimestamp(),
  });
};

export const alternarDisponibilidadProducto = async (id: string, disponibleActual: boolean) => {
  const ref = doc(db, 'productos', id);
  await updateDoc(ref, { disponible: !disponibleActual });
};

export const actualizarPrecioProducto = async (id: string, nuevoPrecio: number) => {
  const ref = doc(db, 'productos', id);
  await updateDoc(ref, { precio: nuevoPrecio });
};