import type { ReactNode } from 'react'

interface AuthLayoutProps {
  leftPanel: ReactNode
  children: ReactNode
}

export function AuthLayout({ leftPanel, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-2 max-md:grid-cols-1">
      <div className="max-md:hidden">{leftPanel}</div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
