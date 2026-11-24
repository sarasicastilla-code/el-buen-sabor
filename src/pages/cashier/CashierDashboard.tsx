import { useEffect, useState } from 'react';
import { Wallet, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { suscribirPedidosActivos, cobrarYLiberarMesa } from '../../services/posService';
import type { Pedido } from '../../types';

export default function CashierDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cobrarId, setCobrarId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = suscribirPedidosActivos(setPedidos);
    return () => unsub();
  }, []);

  const confirmarPago = async (
    pedido: Pedido,
    metodo: 'efectivo' | 'yape_plin' | 'tarjeta'
  ) => {
    setCobrarId(pedido.id);
    try {
      await cobrarYLiberarMesa(pedido.id, pedido.mesaId, metodo);
    } finally {
      setCobrarId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-amber-600" /> Caja y Cobros
        </h2>
        <p className="text-sm text-gray-500">
          Revisa los consumos por mesa, registra el método de pago y libera la mesa.
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No hay cuentas abiertas ni pendientes de pago en este momento.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-center pb-3 mb-3 border-b">
                  <span className="text-lg font-bold text-gray-800">
                    Mesa {String(pedido.mesaNumero).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      pedido.estado === 'pendiente_pago'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pedido.estado.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  {pedido.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-700">
                      <span>
                        {item.cantidad} x {item.nombre}
                      </span>
                      <span className="font-medium">
                        S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t space-y-3">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total a Cobrar</span>
                  <span>S/ {pedido.total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={cobrarId === pedido.id}
                    onClick={() => confirmarPago(pedido, 'efectivo')}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Banknote size={15} /> Efectivo
                  </button>
                  <button
                    type="button"
                    disabled={cobrarId === pedido.id}
                    onClick={() => confirmarPago(pedido, 'yape_plin')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Smartphone size={15} /> Yape / Plin
                  </button>
                  <button
                    type="button"
                    disabled={cobrarId === pedido.id}
                    onClick={() => confirmarPago(pedido, 'tarjeta')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CreditCard size={15} /> Tarjeta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}