'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface InviteData {
  email: string
  role: string
  orgId: string
  invitedBy: string
  expires: number
}

export default function AcceptInvitePage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      try {
        // Decode the invitation token
        const decoded = JSON.parse(
          Buffer.from(token, 'base64url').toString('utf-8')
        ) as InviteData

        // Check if token is expired
        if (decoded.expires < Date.now()) {
          setTokenError('Esta invitación ha expirado. Solicita una nueva invitación.')
        } else {
          setInviteData(decoded)
        }
      } catch (err) {
        setTokenError('Token de invitación inválido.')
      }
    } else {
      setTokenError('No se encontró token de invitación.')
    }
  }, [token])

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!inviteData) {
      setError('Datos de invitación no válidos')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteData.email,
        password,
        options: {
          data: {
            invited_to_org: inviteData.orgId,
            invited_role: inviteData.role,
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Add user to organization with specified role
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            user_id: authData.user.id,
            org_id: inviteData.orgId,
            role: inviteData.role,
          })

        if (membershipError) {
          console.error('Error creating membership:', membershipError)
          setError('Error al unirte a la organización. Contacta al administrador.')
          setLoading(false)
          return
        }

        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Error al procesar la invitación')
      setLoading(false)
    }
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              <h3 className="font-medium mb-2">Error de invitación</h3>
              <p>{tokenError}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acepta tu invitación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Has sido invitado como <strong>{inviteData.role}</strong>
          </p>
          <p className="text-center text-sm text-gray-600">
            Email: <strong>{inviteData.email}</strong>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAcceptInvite}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Crea una contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? 'Creando cuenta...' : 'Aceptar invitación y crear cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}