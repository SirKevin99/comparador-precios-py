import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAlerts, useCancelAlert, type Alert } from '../hooks/useAlerts'
import { useAuth } from '../hooks/useAuth'

const formatGs = (value: number): string => `Gs. ${Math.round(value).toLocaleString('es-PY')}`

const AlertCard = ({
  alert,
  onCancel,
  isCancelling,
}: {
  alert: Alert
  onCancel: (alertId: string) => void
  isCancelling: boolean
}) => {
  const navigate = useNavigate()
  const product = alert.products

  const conditionRow =
    alert.condition === 'below' ? (
      <p className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-300">
        <TrendingDown className="h-4 w-4" />
        Alertar si baja de {formatGs(alert.target_price ?? 0)}
      </p>
    ) : alert.condition === 'above' ? (
      <p className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
        <TrendingUp className="h-4 w-4" />
        Alertar si sube de {formatGs(alert.target_price ?? 0)}
      </p>
    ) : (
      <p className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300">
        <Bell className="h-4 w-4" />
        Alertar en cualquier cambio de precio
      </p>
    )

  const lastNotified = alert.last_notified_at
    ? formatDistanceToNow(new Date(alert.last_notified_at), { locale: es, addSuffix: true })
    : null

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm transition dark:bg-gray-800">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          {product?.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{product?.name ?? 'Producto'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{product?.stores?.name ?? 'Tienda'}</p>
            <p className="mt-1 text-sm font-bold text-blue-700 dark:text-blue-300">{formatGs(product?.current_price ?? 0)}</p>
            <div className="mt-1">{conditionRow}</div>
            {lastNotified ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Última notificación: {lastNotified}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-row gap-2 md:flex-col">
          <button
            type="button"
            onClick={() => navigate(`/product/${alert.product_id}`)}
            className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 dark:hover:bg-blue-500"
          >
            Ver producto
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => onCancel(alert.id)}
            className="rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            Cancelar alerta
          </button>
        </div>
      </div>
    </article>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data: alerts = [], isLoading } = useAlerts(user?.id)
  const cancelAlertMutation = useCancelAlert(user?.id)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const activeAlerts = alerts.filter((alert) => alert.is_active)
  const emailInitial = user?.email?.charAt(0).toUpperCase() ?? '?'

  const handleCancelAlert = async (alertId: string) => {
    const confirmed = window.confirm('¿Cancelar esta alerta?')
    if (!confirmed) return

    setFeedback(null)
    try {
      await cancelAlertMutation.mutateAsync(alertId)
      setFeedback({ type: 'success', text: 'Alerta cancelada correctamente.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cancelar la alerta.'
      setFeedback({ type: 'error', text: message })
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white">
                {emailInitial}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cuenta</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void signOut().then(() => navigate('/'))
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mis alertas ({activeAlerts.length} activas)</h1>
          </div>

          {feedback ? (
            <p className={`mb-4 text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.text}
            </p>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, idx) => (
                <div key={idx} className="animate-pulse rounded-xl bg-gray-100 p-4 dark:bg-gray-700">
                  <div className="h-12 w-full rounded bg-gray-200 dark:bg-gray-600" />
                </div>
              ))}
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-600">
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">No tenés alertas activas</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 dark:hover:bg-blue-500"
              >
                Buscar productos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onCancel={handleCancelAlert}
                  isCancelling={cancelAlertMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ProfilePage
