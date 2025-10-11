import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/provider'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const { email, role, orgId, orgName } = await request.json()

    // Verify the requesting user has permission
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to invite (must be owner or admin)
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Generate invitation token (in production, store this in database)
    const inviteToken = Buffer.from(
      JSON.stringify({
        email,
        role,
        orgId,
        invitedBy: user.id,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      })
    ).toString('base64url')

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${inviteToken}`

    // Send invitation email
    const emailResult = await sendEmail({
      to: email,
      subject: `Invitación a ${orgName}`,
      html: emailTemplates.invitation(
        user.email || 'Un miembro del equipo',
        orgName,
        inviteUrl,
        role
      )
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send invitation email', details: emailResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      messageId: emailResult.messageId
    })

  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}