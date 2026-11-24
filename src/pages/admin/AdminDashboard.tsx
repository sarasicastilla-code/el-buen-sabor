import React, { useEffect, useState } from 'react';
import { Plus, Utensils, Grid, Tag, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import {
  suscribirMesas,
  crearMesa,
  suscribirCategorias,
  crearCategoria,
  suscribirProductos,
  crearProducto,
  alternarDisponibilidadProducto,
} from '../../services/adminService';
import { cargarCartaInicialPolleria } from '../../services/posService';
import type { Mesa, Producto, Categoria } from '../../types';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'mesas' | 'categorias' | 'productos'>('mesas');

  // Estados de listas en tiempo real
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoCarta, setCargandoCarta] = useState(false);

  // Formularios
  const [numMesa, setNumMesa] = useState('');
  const [capMesa, setCapMesa] = useState('4');
  const [nomCat, setNomCat] = useState('');
  const [ordenCat, setOrdenCat] = useState('1');

  const [prodNombre, setProdNombre] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrecio, setProdPrecio] = useState('');

  useEffect(() => {
    const unsubMesas = suscribirMesas(setMesas);
    const unsubCats = suscribirCategorias(setCategorias);
    const unsubProds = suscribirProductos(setProductos);
    return () => {
      unsubMesas();
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleCargarCartaBase = async () => {
    setCargandoCarta(true);
    try {
      await cargarCartaInicialPolleria(categorias, productos);
    } finally {
      setCargandoCarta(false);
    }
  };

  const handleCrearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numMesa) return;
    await crearMesa(Number(numMesa), Number(capMesa));
    setNumMesa('');
  };

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCat) return;
    await crearCategoria(nomCat, Number(ordenCat));
    setNomCat('');
    setOrdenCat(String(categorias.length + 2));
  };

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre || !prodCat || !prodPrecio) return;
    await crearProducto({
      nombre: prodNombre,
      descripcion: prodDesc,
      categoriaId: prodCat,
      precio: Number(prodPrecio),
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      disponible: true,
    });
    setProdNombre('');
    setProdDesc('');
    setProdPrecio('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navegación por pestañas + Botón de Carta Base */}
      <div className="flex flex-wrap items-center gap-3 mb-6 border-b pb-3">
        <button
          type="button"
          onClick={() => setTab('mesas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer ${
            tab === 'mesas' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Grid size={18} /> Mesas ({mesas.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('categorias')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer ${
            tab === 'categorias' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Tag size={18} /> Categorías ({categorias.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('productos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer ${
            tab === 'productos' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Utensils size={18} /> Carta de Productos ({productos.length})
        </button>

        <button
          type="button"
          disabled={cargandoCarta}
          onClick={handleCargarCartaBase}
          className="ml-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 transition cursor-pointer disabled:opacity-60"
        >
          <Sparkles size={16} />
          {cargandoCarta ? 'Cargando carta...' : 'Cargar Carta Base (1/2 Pollo S/ 25...)'}
        </button>
      </div>

      {/* MÓDULO 2: ADMINISTRACIÓN DE MESAS */}
      {tab === 'mesas' && (
        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleCrearMesa} className="bg-white p-5 rounded-xl shadow-sm border h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Registrar Nueva Mesa</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Mesa</label>
                <input
                  type="number"
                  required
                  value={numMesa}
                  onChange={(e) => setNumMesa(e.target.value)}
                  placeholder="Ej. 1"
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacidad (personas)</label>
                <input
                  type="number"
                  required
                  value={capMesa}
                  onChange={(e) => setCapMesa(e.target.value)}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} /> Agregar Mesa
              </button>
            </div>
          </form>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mesas.map((mesa) => (
              <div key={mesa.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">
                    Mesa {String(mesa.numero).padStart(2, '0')}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 uppercase">
                    {mesa.estado.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Capacidad: {mesa.capacidad} comensales</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MÓDULO 3A: CATEGORÍAS */}
      {tab === 'categorias' && (
        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleCrearCategoria} className="bg-white p-5 rounded-xl shadow-sm border h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Nueva Categoría</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={nomCat}
                  onChange={(e) => setNomCat(e.target.value)}
                  placeholder="Ej. Pollos a la brasa"
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Orden en carta</label>
                <input
                  type="number"
                  required
                  value={ordenCat}
                  onChange={(e) => setOrdenCat(e.target.value)}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} /> Guardar Categoría
              </button>
            </div>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-600">Orden</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Categoría</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3">{c.orden}</td>
                    <td className="p-3 font-medium">{c.nombre}</td>
                    <td className="p-3 text-green-600 text-sm font-semibold">Activa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MÓDULO 3B: PRODUCTOS */}
      {tab === 'productos' && (
        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleCrearProducto} className="bg-white p-5 rounded-xl shadow-sm border h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Registrar Producto</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  required
                  value={prodCat}
                  onChange={(e) => setProdCat(e.target.value)}
                  className="w-full mt-1 border rounded-lg p-2"
                >
                  <option value="">Seleccione categoría...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del producto</label>
                <input
                  type="text"
                  required
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  placeholder="Ej. 1/2 Pollo a la Brasa"
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Medio pollo + papas + ensalada + cremas"
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio (S/)</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={prodPrecio}
                  onChange={(e) => setProdPrecio(e.target.value)}
                  placeholder="25.00"
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} /> Registrar en Carta
              </button>
            </div>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-600">Producto</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Precio</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">{p.nombre}</p>
                      <p className="text-xs text-gray-500">{p.descripcion}</p>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">S/ {p.precio.toFixed(2)}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => alternarDisponibilidadProducto(p.id, p.disponible)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                          p.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.disponible ? (
                          <>
                            <CheckCircle size={14} /> Activo
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Inactivo
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}