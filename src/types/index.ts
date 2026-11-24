export type Rol = 'administrador' | 'mozo' | 'cocina' | 'cajero';

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  creadoEn: any;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'pendiente_pago';
  atencionActivaId: string | null;
}

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  activa: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  precio: number;
  imageUrl: string;
  disponible: boolean;
  creadoEn?: any;
}

export type EstadoItemCocina = 'pendiente' | 'preparando' | 'listo';

export interface ItemPedido {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  nota?: string;
  estadoCocina: EstadoItemCocina;
}

export type EstadoPedido = 'abierto' | 'en_cocina' | 'servido' | 'pendiente_pago' | 'pagado';

export interface Pedido {
  id: string;
  mesaId: string;
  mesaNumero: number;
  mozoNombre: string;
  items: ItemPedido[];
  total: number;
  estado: EstadoPedido;
  metodoPago?: 'efectivo' | 'yape_plin' | 'tarjeta';
  creadoEn: any;
  actualizadoEn: any;
}