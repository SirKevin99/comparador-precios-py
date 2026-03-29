import { useEffect } from 'react'

import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const mapSessionUser = (sessionUser: {
  id: string
  email?: string
  user_metadata?: { name?: string }
}) => ({
  id: sessionUser.id,
  email: sessionUser.email ?? '',
  name: sessionUser.user_metadata?.name,
})

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error || !data.session) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser(mapSessionUser(data.session.user))
      setLoading(false)
    }

    void initialize()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser(mapSessionUser(session.user))
      setLoading(false)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [setLoading, setUser])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}
