interface LoadingSpinnerProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

export default function LoadingSpinner({
  label = 'Loading',
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label={label} className={`inline-flex ${className}`}>
      <span
        className={`${sizes[size]} animate-spin rounded-full border-current border-t-transparent`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
