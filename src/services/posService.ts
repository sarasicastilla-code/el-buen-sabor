import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Categoria,
  Producto,
  ItemPedido,
  Pedido,
  EstadoItemCocina,
  EstadoPedido,
} from '../types';
import { crearProducto } from './adminService';

// --- CARTA INICIAL SUGERIDA PARA LA POLLERÍA ---
export const cargarCartaInicialPolleria = async (
  categoriasActuales: Categoria[],
  productosActuales: Producto[]
) => {
  const mapaCategorias = new Map<string, string>();
  categoriasActuales.forEach((c) => mapaCategorias.set(c.nombre.toLowerCase(), c.id));

  const asegurarCategoria = async (nombre: string, orden: number) => {
    const key = nombre.toLowerCase();
    if (mapaCategorias.has(key)) return mapaCategorias.get(key)!;
    const docRef = await addDoc(collection(db, 'categorias'), {
      nombre,
      orden,
      activa: true,
      creadoEn: serverTimestamp(),
    });
    mapaCategorias.set(key, docRef.id);
    return docRef.id;
  };

  const catPollos = await asegurarCategoria('Pollos a la Brasa', 1);
  const catCombos = await asegurarCategoria('Combos y Mostritos', 2);
  const catBebidas = await asegurarCategoria('Bebidas y Refrescos', 3);
  const catExtras = await asegurarCategoria('Guarniciones y Extras', 4);

  const nombresExistentes = new Set(productosActuales.map((p) => p.nombre.toLowerCase()));

  const cartaBase: Omit<Producto, 'id'>[] = [
    {
      nombre: '1/2 Pollo a la Brasa',
      descripcion: 'Medio pollo crocante al carbón + papas fritas + ensalada + cremas',
      categoriaId: catPollos,
      precio: 25.0,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      disponible: true,
    },
    {
      nombre: '1/4 Pollo a la Brasa',
      descripcion: 'Cuarto de pollo (pecho o pierna) + papas fritas + ensalada + cremas',
      categoriaId: catPollos,
      precio: 14.0,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      disponible: true,
    },
    {
      nombre: '1 Pollo Entero a la Brasa',
      descripcion: 'Pollo entero + porción familiar de papas fritas + ensalada + cremas',
      categoriaId: catPollos,
      precio: 48.0,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      disponible: true,
    },
    {
      nombre: 'Mostrito Clásico',
      descripcion: '1/4 de pollo a la brasa + arroz chaufa + papas fritas + cremas',
      categoriaId: catCombos,
      precio: 19.0,
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
      disponible: true,
    },
    {
      nombre: 'Combo Familiar (1 Pollo + Chaufa + Gaseosa)',
      descripcion: '1 pollo entero + 1 chaufa fuente + papas + gaseosa 1.5L',
      categoriaId: catCombos,
      precio: 64.0,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      disponible: true,
    },
    {
      nombre: 'Chicha Morada Jarra 1L',
      descripcion: 'Chicha morada natural preparada en casa con piña y canela',
      categoriaId: catBebidas,
      precio: 8.0,
      imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
      disponible: true,
    },
    {
      nombre: 'Gaseosa Personal',
      descripcion: 'Bebida helada personal (Inca Kola / Coca Cola)',
      categoriaId: catBebidas,
      precio: 4.0,
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
      disponible: true,
    },
    {
      nombre: 'Porción Extra de Papas Fritas',
      descripcion: 'Papas nativas o amarillas crocantes recién fritas',
      categoriaId: catExtras,
      precio: 7.0,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
      disponible: true,
    },
  ];

  for (const item of cartaBase) {
    if (!nombresExistentes.has(item.nombre.toLowerCase())) {
      await crearProducto(item);
    }
  }
};

// --- PEDIDOS / COMANDAS ---
export const suscribirPedidosActivos = (callback: (pedidos: Pedido[]) => void) => {
  const q = query(
    collection(db, 'pedidos'),
    where('estado', 'in', ['abierto', 'en_cocina', 'servido', 'pendiente_pago'])
  );
  return onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pedido));
    lista.sort((a, b) => (a.mesaNumero ?? 0) - (b.mesaNumero ?? 0));
    callback(lista);
  });
};

export const crearOActualizarComanda = async (params: {
  pedidoExistente?: Pedido | null;
  mesaId: string;
  mesaNumero: number;
  mozoNombre: string;
  nuevosItems: ItemPedido[];
}) => {
  const { pedidoExistente, mesaId, mesaNumero, mozoNombre, nuevosItems } = params;

  if (pedidoExistente) {
    const itemsCombinados = [...pedidoExistente.items, ...nuevosItems];
    const total = itemsCombinados.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);

    await updateDoc(doc(db, 'pedidos', pedidoExistente.id), {
      items: itemsCombinados,
      total,
      estado: 'en_cocina' as EstadoPedido,
      actualizadoEn: serverTimestamp(),
    });

    await updateDoc(doc(db, 'mesas', mesaId), {
      estado: 'ocupada',
      atencionActivaId: pedidoExistente.id,
    });
    return pedidoExistente.id;
  } else {
    const total = nuevosItems.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
    const pedidoRef = await addDoc(collection(db, 'pedidos'), {
      mesaId,
      mesaNumero,
      mozoNombre,
      items: nuevosItems,
      total,
      estado: 'en_cocina' as EstadoPedido,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });

    await updateDoc(doc(db, 'mesas', mesaId), {
      estado: 'ocupada',
      atencionActivaId: pedidoRef.id,
    });
    return pedidoRef.id;
  }
};

export const actualizarEstadoItemCocina = async (
  pedido: Pedido,
  itemIndex: number,
  nuevoEstado: EstadoItemCocina
) => {
  const itemsActualizados = pedido.items.map((item, idx) =>
    idx === itemIndex ? { ...item, estadoCocina: nuevoEstado } : item
  );

  const todosListos = itemsActualizados.every((i) => i.estadoCocina === 'listo');
  const estadoPedido: EstadoPedido =
    pedido.estado === 'pendiente_pago'
      ? 'pendiente_pago'
      : todosListos
      ? 'servido'
      : 'en_cocina';

  await updateDoc(doc(db, 'pedidos', pedido.id), {
    items: itemsActualizados,
    estado: estadoPedido,
    actualizadoEn: serverTimestamp(),
  });
};

export const solicitarCuentaMesa = async (pedidoId: string, mesaId: string) => {
  await updateDoc(doc(db, 'pedidos', pedidoId), {
    estado: 'pendiente_pago' as EstadoPedido,
    actualizadoEn: serverTimestamp(),
  });
  await updateDoc(doc(db, 'mesas', mesaId), {
    estado: 'pendiente_pago',
  });
};

export const cobrarYLiberarMesa = async (
  pedidoId: string,
  mesaId: string,
  metodoPago: 'efectivo' | 'yape_plin' | 'tarjeta'
) => {
  await updateDoc(doc(db, 'pedidos', pedidoId), {
    estado: 'pagado' as EstadoPedido,
    metodoPago,
    actualizadoEn: serverTimestamp(),
  });
  await updateDoc(doc(db, 'mesas', mesaId), {
    estado: 'libre',
    atencionActivaId: null,
  });
};

export const obtenerHistorialPagadosHoy = async (): Promise<Pedido[]> => {
  const q = query(
    collection(db, 'pedidos'),
    where('estado', '==', 'pagado'),
    orderBy('actualizadoEn', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pedido));
};