'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

type Member = {
  id: string
  user_id: string
  org_id: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  email?: string
  created_at: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadMembers()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    if (user) {
      // Get user's role in the organization
      const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (membership) {
        setUserRole(membership.role)
      }
    }
  }

  const loadMembers = async () => {
    try {
      // First get the user's organization
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No autenticado')
        setLoading(false)
        return
      }

      // Get user's org
      const { data: membership } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        setError('No perteneces a ninguna organización')
        setLoading(false)
        return
      }

      // Get all members of the org
      const { data: orgMembers, error: membersError } = await supabase
        .from('memberships')
        .select('*')
        .eq('org_id', membership.org_id)
        .order('created_at', { ascending: false })

      if (membersError) {
        setError(membersError.message)
      } else {
        // Get user emails for each member
        const membersWithEmails = await Promise.all(
          (orgMembers || []).map(async (member) => {
            const { data: { user } } = await supabase.auth.admin.getUserById(member.user_id)
            return {
              ...member,
              email: user?.email
            }
          })
        )
        setMembers(membersWithEmails)
      }
    } catch (err) {
      setError('Error cargando miembros')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setInviting(true)

    try {
      // Get current user's org
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No autenticado')
        setInviting(false)
        return
      }

      const { data: membership } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        setError('No perteneces a ninguna organización')
        setInviting(false)
        return
      }

      // Get organization name
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', membership.org_id)
        .single()

      // Send invitation through API
      const response = await fetch('/api/email/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          orgId: membership.org_id,
          orgName: org?.name || 'la organización'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(`Invitación enviada a ${inviteEmail} con rol ${inviteRole}`)
        setInviteEmail('')
      } else {
        setError(result.error || 'Error enviando invitación')
      }

    } catch (err) {
      setError('Error enviando invitación')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from('memberships')
      .update({ role: newRole })
      .eq('id', memberId)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Rol actualizado exitosamente')
      loadMembers()
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro?')) {
      return
    }

    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', memberId)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Miembro eliminado exitosamente')
      loadMembers()
    }
  }

  const canManageMembers = userRole === 'owner' || userRole === 'admin'

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-text-secondary">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Miembros del Equipo</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Gestiona los miembros de tu organización y sus permisos
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-500/10 border border-danger-500/20 p-4">
          <div className="text-sm text-danger-500">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-success-500/10 border border-success-500/20 p-4">
          <div className="text-sm text-success-500">{success}</div>
        </div>
      )}

      {/* Invite Form */}
      {canManageMembers && (
        <div className="card mb-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Invitar nuevo miembro</h2>
          <form onSubmit={handleInvite} className="flex gap-4">
            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
              className="px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="btn-primary"
            >
              {inviting ? 'Enviando...' : 'Invitar'}
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="card overflow-hidden p-0">
        <ul className="divide-y divide-dark-border">
          {members.map((member) => (
            <li key={member.id} className="px-6 py-4 hover:bg-dark-surface/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                      <span className="text-gold-500 font-medium">
                        {member.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-text-primary">
                      {member.email || 'Email no disponible'}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Rol: <span className="text-gold-500">{member.role}</span>
                    </div>
                  </div>
                </div>

                {canManageMembers && member.user_id !== currentUser?.id && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                      disabled={member.role === 'owner'}
                    >
                      <option value="owner" disabled>Owner</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-danger-500 hover:text-danger-400 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Role Descriptions */}
      <div className="mt-8 card bg-dark-surface/50">
        <h3 className="text-sm font-medium text-text-primary mb-3">Descripción de roles</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="inline font-medium text-gold-500">Owner:</dt>
            <dd className="inline ml-2 text-text-secondary">Control total, puede eliminar la organización</dd>
          </div>
          <div>
            <dt className="inline font-medium text-cyan-500">Admin:</dt>
            <dd className="inline ml-2 text-text-secondary">Puede gestionar miembros y todas las funciones</dd>
          </div>
          <div>
            <dt className="inline font-medium text-violet-500">Editor:</dt>
            <dd className="inline ml-2 text-text-secondary">Puede crear y editar contenido</dd>
          </div>
          <div>
            <dt className="inline font-medium text-text-primary">Viewer:</dt>
            <dd className="inline ml-2 text-text-secondary">Solo puede ver contenido</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}