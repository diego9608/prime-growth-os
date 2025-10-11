import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type InviteRequest = {
  email: string
  role: 'admin' | 'editor' | 'viewer'
  orgId: string
  orgName: string
}

export async function POST(request: NextRequest) {
  try {
    const body: InviteRequest = await request.json()
    const { email, role, orgId, orgName } = body

    if (!email || !role || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, orgId' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'editor', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, editor, or viewer' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('org_id, role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You do not belong to this organization' },
        { status: 403 }
      )
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only owners and admins can invite members' },
        { status: 403 }
      )
    }

    try {
      const admin = createAdminClient()

      const { data: existingUser } = await admin.auth.admin.getUserByEmail(email)

      if (existingUser?.user) {
        return NextResponse.json(
          { error: 'User already exists. They should sign in instead.' },
          { status: 409 }
        )
      }
    } catch (err) {
      console.error('Error checking existing user:', err)
    }

    const inviteData = {
      email,
      role,
      orgId,
      invitedBy: user.email,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    }

    const token = Buffer.from(JSON.stringify(inviteData)).toString('base64url')

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invite?token=${token}`

    const emailResponse = await fetch(`${request.nextUrl.origin}/api/email/send-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
        orgName: orgName || 'la organización',
        inviteUrl
      })
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.json()
      console.error('Error sending invitation email:', error)
      return NextResponse.json(
        { error: 'Failed to send invitation email. The invite link has been generated but not sent.' },
        { status: 500 }
      )
    }

    const { data: auditData, error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        org_id: orgId,
        action: 'invite_member',
        resource_type: 'membership',
        metadata: {
          invited_email: email,
          invited_role: role
        }
      })

    if (auditError) {
      console.error('Error creating audit log:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      inviteUrl
    })

  } catch (error) {
    console.error('Error in invite handler:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
