import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

type AuthTab = 'login' | 'register'

function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuthTab>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    setSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate('/')
  }

  const handleRegister = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: {
          name: registerName,
          phone: registerPhone || undefined,
        },
      },
    })

    setSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setSuccessMessage('Revisá tu email para confirmar tu cuenta')
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
        >
          ← Volver al inicio
        </button>

        <h1 className="mb-6 text-center text-4xl font-extrabold text-blue-900 dark:text-blue-400">PrecionPY</h1>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-5 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab === 'login'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-gray-800 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab === 'register'
                  ? 'bg-white text-blue-900 shadow-sm dark:bg-gray-800 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          {tab === 'login' ? (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleLogin()}
                className="w-full rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                Iniciar sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="tel"
                placeholder="+595 9XX XXX XXX"
                value={registerPhone}
                onChange={(event) => setRegisterPhone(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleRegister()}
                className="w-full rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                Crear cuenta
              </button>
            </div>
          )}

          {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
          {successMessage ? <p className="mt-4 text-sm text-green-600">{successMessage}</p> : null}
        </div>
      </div>
    </main>
  )
}

export default LoginPage
