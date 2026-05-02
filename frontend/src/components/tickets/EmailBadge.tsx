interface EmailBadgeProps {
  email: string | null
}

export function EmailBadge({ email }: EmailBadgeProps) {
  if (!email) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
      📧 {email}
    </span>
  )
}
