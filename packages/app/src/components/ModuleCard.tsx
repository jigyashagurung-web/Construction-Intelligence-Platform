import { Link } from 'react-router-dom'

export function ModuleCard({
  to, icon, title, description, bg, disabled,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  bg: string
  disabled?: boolean
}) {
  const cls = `block p-5 rounded-xl border ${
    disabled
      ? 'border-gray-100 opacity-50 cursor-not-allowed'
      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group'
  } bg-white`

  const inner = (
    <>
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className={`font-medium text-sm text-gray-900 mb-1 ${disabled ? '' : 'group-hover:text-blue-600 transition-colors'}`}>
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </>
  )

  if (disabled) return <div className={cls}>{inner}</div>
  return <Link to={to} className={cls}>{inner}</Link>
}
