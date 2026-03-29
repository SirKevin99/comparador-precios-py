import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useProduct } from '../hooks/useProduct'
import { useTheme } from '../hooks/useTheme'

type AlertCondition = 'below' | 'above' | 'any'

const formatGs = (value: number): string => `Gs. ${Math.round(value).toLocaleString('es-PY')}`

function ProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isDark } = useTheme()
  const { data, isLoading, isError } = useProduct(id)

  const [targetPrice, setTargetPrice] = useState('')
  const [condition, setCondition] = useState<AlertCondition>('below')

  const history = useMemo(() => {
    if (!data?.price_history) return []
    return [...data.price_history].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
  }, [data?.price_history])

  const chartData = useMemo(
    () =>
      history.map((item) => ({
        date: format(new Date(item.recorded_at), 'dd/MM'),
        dateFull: format(new Date(item.recorded_at), 'dd/MM/yyyy HH:mm'),
        price: item.price,
      })),
    [history]
  )

  const minPrice = history.length > 0 ? Math.min(...history.map((h) => h.price)) : 0
  const maxPrice = history.length > 0 ? Math.max(...history.map((h) => h.price)) : 0

  const variation = useMemo(() => {
    if (history.length < 2) return null
    const first = history[0].price
    const last = history[history.length - 1].price
    if (first === 0) return null
    const percent = ((last - first) / first) * 100
    return percent
  }, [history])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-96 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200"
          >
            ← Volver
          </button>
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
            No se pudo cargar el producto.
          </div>
        </div>
      </main>
    )
  }

  const lastUpdatedText = data.last_checked_at
    ? formatDistanceToNow(new Date(data.last_checked_at), { locale: es, addSuffix: true })
    : 'sin fecha'

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-900 md:px-6">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          ← Volver
        </button>

        <section className="mb-8 grid gap-6 rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800 lg:grid-cols-2">
          <div>
            <div className="mb-3 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
              {data.image_url ? (
                <img src={data.image_url} alt={data.name} className="h-[360px] w-full object-cover" />
              ) : (
                <div className="flex h-[360px] items-center justify-center text-gray-400">Sin imagen</div>
              )}
            </div>
            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              {data.stores?.name ?? 'Tienda'}
            </div>
            <div>
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
              >
                Ver en tienda <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">{data.category || 'Sin categoría'}</p>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Marca: {data.brand || 'N/D'} | SKU: {data.sku || 'N/D'}
            </p>

            <p className="mb-3 text-3xl font-bold text-blue-900 dark:text-blue-400">{formatGs(data.current_price)}</p>
            <span
              className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                data.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {data.in_stock ? 'En stock' : 'Sin stock'}
            </span>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Actualizado: {lastUpdatedText}</p>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Crear alerta de precio</h2>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Precio objetivo (Gs.)"
                  value={targetPrice}
                  onChange={(event) => setTargetPrice(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value as AlertCondition)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="below">Baja de ese precio</option>
                  <option value="above">Sube de ese precio</option>
                  <option value="any">Cualquier cambio</option>
                </select>
                <button
                  type="button"
                  onClick={() => window.alert('Próximamente: necesitás iniciar sesión')}
                  className="w-full rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 dark:hover:bg-blue-500"
                >
                  Crear alerta
                </button>
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
            Evolución del precio (últimos 3 meses)
          </h2>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={isDark ? '#d1d5db' : '#4b5563'} />
                <YAxis stroke={isDark ? '#d1d5db' : '#4b5563'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#d1d5db',
                    color: isDark ? '#f3f4f6' : '#111827',
                  }}
                  formatter={(value: unknown) => {
                    const normalized = Array.isArray(value) ? value[0] : value
                    if (normalized === undefined || normalized === null) {
                      return 'N/D'
                    }
                    return formatGs(Number(normalized))
                  }}
                  labelFormatter={(_label, payload) => payload?.[0]?.payload?.dateFull ?? ''}
                />
                <Line type="monotone" dataKey="price" stroke="#1e40af" strokeWidth={2} dot />
                {chartData.length > 0 ? (
                  <>
                    <ReferenceLine
                      y={minPrice}
                      stroke="#16a34a"
                      strokeDasharray="4 4"
                      label={{ value: 'Mínimo', fill: '#16a34a', position: 'insideTopLeft' }}
                    />
                    <ReferenceLine
                      y={maxPrice}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      label={{ value: 'Máximo', fill: '#dc2626', position: 'insideTopRight' }}
                    />
                  </>
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/60 dark:bg-green-900/20">
              <p className="text-sm text-green-700 dark:text-green-300">Precio mínimo</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatGs(minPrice)}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">Precio máximo</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatGs(maxPrice)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <p className="text-sm text-gray-600 dark:text-gray-300">Variación total</p>
              {variation === null ? (
                <p className="text-lg font-bold text-gray-700 dark:text-gray-200">N/D</p>
              ) : variation < 0 ? (
                <p className="text-lg font-bold text-green-600 dark:text-green-300">↓ {Math.abs(variation).toFixed(2)}%</p>
              ) : (
                <p className="text-lg font-bold text-red-600 dark:text-red-300">↑ {Math.abs(variation).toFixed(2)}%</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductPage
