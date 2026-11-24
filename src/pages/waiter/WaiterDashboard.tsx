
import { useEffect, useState } from 'react';
import { Utensils, Plus, Minus, Send, Receipt } from 'lucide-react';
import { suscribirMesas, suscribirCategorias, suscribirProductos } from '../../services/adminService';
import {
  suscribirPedidosActivos,
  crearOActualizarComanda,
  solicitarCuentaMesa,
} from '../../services/posService';
import { useAuth } from '../../context/AuthContext';
import type { Mesa, Categoria, Producto, Pedido, ItemPedido } from '../../types';

interface EntradaCarrito {
  producto: Producto;
  cantidad: number;
  nota: string;
}

export default function WaiterDashboard() {
  const { usuario } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidosActivos, setPedidosActivos] = useState<Pedido[]>([]);

  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
  const [carrito, setCarrito] = useState<Record<string, EntradaCarrito>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const u1 = suscribirMesas(setMesas);
    const u2 = suscribirCategorias(setCategorias);
    const u3 = suscribirProductos(setProductos);
    const u4 = suscribirPedidosActivos(setPedidosActivos);

    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, []);

  const pedidoDeMesa = mesaSeleccionada
    ? pedidosActivos.find((p) => p.mesaId === mesaSeleccionada.id) || null
    : null;

  const productosFiltrados = productos.filter(
    (p) => p.disponible &&
      (categoriaActiva === 'todas' || p.categoriaId === categoriaActiva)
  );

  const cambiarCantidad = (prod: Producto, delta: number) => {
    setCarrito((prev) => {
      const itemActual = prev[prod.id];
      const cantidadActual = itemActual ? itemActual.cantidad : 0;
      const siguienteCantidad = Math.max(0, cantidadActual + delta);

      if (siguienteCantidad === 0) {
        const copia = { ...prev };
        delete copia[prod.id];
        return copia;
      }

      return {
        ...prev,
        [prod.id]: {
          producto: prod,
          cantidad: siguienteCantidad,
          nota: itemActual ? itemActual.nota : '',
        },
      };
    });
  };

  const cambiarNota = (prodId: string, nota: string) => {
    setCarrito((prev) => {
      const itemActual = prev[prodId];
      if (!itemActual) return prev;

      return {
        ...prev,
        [prodId]: {
          ...itemActual,
          nota,
        },
      };
    });
  };

  const itemsPorEnviar = Object.values(carrito);

  const subtotalPorEnviar = itemsPorEnviar.reduce(
    (acc, entrada) => acc + entrada.producto.precio * entrada.cantidad,
    0
  );

  // ===== DIAGNÓSTICO TEMPORAL =====
  console.log('CARRITO:', carrito);
  console.log('ITEMS POR ENVIAR:', itemsPorEnviar);
  console.log('SUBTOTAL:', subtotalPorEnviar);
  // ===== FIN DEL DIAGNÓSTICO =====

  const enviarComanda = async () => {
    if (!mesaSeleccionada || itemsPorEnviar.length === 0) return;

    setEnviando(true);

    try {
      const nuevosItems: ItemPedido[] = itemsPorEnviar.map(
        ({ producto, cantidad, nota }) => ({
          productoId: producto.id,
          nombre: producto.nombre,
          precioUnitario: producto.precio,
          cantidad,
          nota: nota.trim(),
          estadoCocina: 'pendiente',
        })
      );

      await crearOActualizarComanda({
        pedidoExistente: pedidoDeMesa,
        mesaId: mesaSeleccionada.id,
        mesaNumero: mesaSeleccionada.numero,
        mozoNombre: usuario?.nombre || 'Mozo',
        nuevosItems,
      });

      setCarrito({});
    } finally {
      setEnviando(false);
    }
  };

  const badgeEstadoMesa = (estado: Mesa['estado']) => {
    if (estado === 'libre') return 'bg-green-100 text-green-800 border-green-300';
    if (estado === 'ocupada') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Utensils className="text-amber-600" /> Salón y Comandas (Mozo)
          </h2>
          <p className="text-sm text-gray-500">
            Selecciona una mesa para elegir cantidades, agregar notas y enviar a cocina.
          </p>
        </div>
      </div>

      {/* Grilla de Mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
        {mesas.map((mesa) => {
          const activa = mesaSeleccionada?.id === mesa.id;
          const ped = pedidosActivos.find((p) => p.mesaId === mesa.id);

          return (
            <button
              type="button"
              key={mesa.id}
              onClick={() => {
                setMesaSeleccionada(mesa);
                setCarrito({});
              }}
              className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                activa
                  ? 'border-amber-600 bg-amber-50/60 shadow-md'
                  : 'bg-white border-gray-200 hover:border-amber-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg text-gray-800">
                  Mesa {String(mesa.numero).padStart(2, '0')}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase ${badgeEstadoMesa(
                    mesa.estado
                  )}`}
                >
                  {mesa.estado.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Cap: {mesa.capacidad} pers.
              </p>

              {ped && (
                <p className="text-xs font-bold text-amber-700 mt-1.5">
                  Total: S/ {ped.total.toFixed(2)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {mesaSeleccionada && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Carta disponible */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b">
              <button
                type="button"
                onClick={() => setCategoriaActiva('todas')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                  categoriaActiva === 'todas'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Todo
              </button>

              {categorias.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                    categoriaActiva === cat.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {productosFiltrados.map((prod) => {
                const cant = carrito[prod.id]?.cantidad || 0;

                return (
                  <div
                    key={prod.id}
                    className="border rounded-xl p-3.5 flex flex-col justify-between bg-gray-50/40"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-gray-800">
                          {prod.nombre}
                        </h4>

                        <span className="font-bold text-amber-700 whitespace-nowrap">
                          S/ {prod.precio.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {prod.descripcion}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t flex items-center justify-between">
                      {cant === 0 ? (
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(prod, 1)}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus size={16} /> Agregar
                        </button>
                      ) : (
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between bg-white border rounded-lg px-2 py-1">
                            <button
                              type="button"
                              onClick={() => cambiarCantidad(prod, -1)}
                              className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
                              aria-label="Restar unidad"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="font-bold text-gray-800 text-base">
                              {cant}
                            </span>

                            <button
                              type="button"
                              onClick={() => cambiarCantidad(prod, 1)}
                              className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                              aria-label="Sumar unidad"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={carrito[prod.id]?.nota || ''}
                            onChange={(e) =>
                              cambiarNota(prod.id, e.target.value)
                            }
                            placeholder="Nota (ej. sin ají, pecho)..."
                            className="w-full text-xs border rounded-lg px-2.5 py-1.5 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen de Comanda */}
          <div className="bg-white p-5 rounded-xl border shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">
              Mesa {String(mesaSeleccionada.numero).padStart(2, '0')} — Comanda
            </h3>

            {pedidoDeMesa && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Ya enviado a cocina:
                </p>

                {pedidoDeMesa.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold">
                        {item.cantidad} x {item.nombre}
                      </span>

                      {item.nota && (
                        <p className="text-xs text-amber-700">
                          Nota: {item.nota}
                        </p>
                      )}

                      <span className="text-[11px] text-gray-500">
                        Estado: {item.estadoCocina}
                      </span>
                    </div>

                    <span className="font-semibold">
                      S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {itemsPorEnviar.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-amber-700">
                  Por enviar:
                </p>

                {itemsPorEnviar.map(({ producto, cantidad, nota }) => (
                  <div
                    key={producto.id}
                    className="flex justify-between items-center text-sm bg-amber-50 p-2.5 rounded-lg border border-amber-200"
                  >
                    <div>
                      <span className="font-bold text-gray-900">
                        {cantidad} x {producto.nombre}
                      </span>

                      {nota && (
                        <p className="text-xs text-gray-600">
                          Nota: {nota}
                        </p>
                      )}
                    </div>

                    <span className="font-bold text-amber-900">
                      S/ {(producto.precio * cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between text-sm font-semibold text-gray-700 pt-1">
                  <span>Subtotal a enviar</span>
                  <span>S/ {subtotalPorEnviar.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  disabled={enviando}
                  onClick={enviarComanda}
                  className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send size={16} />
                  {enviando ? 'Enviando...' : 'Enviar a Cocina'}
                </button>
              </div>
            )}

            {pedidoDeMesa && (
              <div className="pt-3 border-t space-y-3">
                <div className="flex justify-between text-base font-bold text-gray-800">
                  <span>Total Actual</span>
                  <span>S/ {pedidoDeMesa.total.toFixed(2)}</span>
                </div>

                {mesaSeleccionada.estado !== 'pendiente_pago' && (
                  <button
                    type="button"
                    onClick={() =>
                      solicitarCuentaMesa(
                        pedidoDeMesa.id,
                        mesaSeleccionada.id
                      )
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Receipt size={16} />
                    Pedir Cuenta (Enviar a Caja)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
