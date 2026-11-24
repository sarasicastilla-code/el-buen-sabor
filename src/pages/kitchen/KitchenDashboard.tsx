import { useEffect, useState } from 'react';
import { Flame, CheckCircle2, Clock } from 'lucide-react';
import { suscribirPedidosActivos, actualizarEstadoItemCocina } from '../../services/posService';
import type { Pedido } from '../../types';

export default function KitchenDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const unsub = suscribirPedidosActivos(setPedidos);
    return () => unsub();
  }, []);

  const comandasCocina = pedidos.filter((p) =>
    p.items.some((item) => item.estadoCocina !== 'listo')
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="text-amber-600" /> Cocina — Comandas en Tiempo Real
        </h2>
        <p className="text-sm text-gray-500">
          Marca cada plato como preparando o listo conforme salga de parrilla o freidora.
        </p>
      </div>

      {comandasCocina.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No hay comandas pendientes en cocina por el momento.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {comandasCocina.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-3 mb-3 border-b">
                  <span className="text-lg font-bold text-gray-800">
                    Mesa {String(pedido.mesaNumero).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                    Mozo: {pedido.mozoNombre}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {pedido.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                        item.estadoCocina === 'listo'
                          ? 'bg-green-50/60 border-green-200 opacity-75'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.cantidad} x {item.nombre}
                        </p>
                        {item.nota && (
                          <p className="text-xs text-amber-700 font-medium">Nota: {item.nota}</p>
                        )}
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        {item.estadoCocina === 'pendiente' && (
                          <button
                            type="button"
                            onClick={() => actualizarEstadoItemCocina(pedido, idx, 'preparando')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Clock size={13} /> Preparar
                          </button>
                        )}
                        {item.estadoCocina !== 'listo' && (
                          <button
                            type="button"
                            onClick={() => actualizarEstadoItemCocina(pedido, idx, 'listo')}
                            className="px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={13} /> Listo
                          </button>
                        )}
                        {item.estadoCocina === 'listo' && (
                          <span className="text-xs font-bold text-green-700 px-2 py-1">Listo</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}