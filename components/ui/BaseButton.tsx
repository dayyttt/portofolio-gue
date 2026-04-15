import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export default function BaseButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: BaseButtonProps) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white active:bg-blue-600 focus:ring-blue-500',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
