import type { ReactNode } from 'react'
import { Card, CardHeader } from './Card'
import { cn } from '../../utils/cn'

export function ChartCard({
  title,
  description,
  icon,
  actions,
  children,
  className,
  bodyClassName,
  footer,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  footer?: ReactNode
}) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title={title} description={description} icon={icon} actions={actions} />
      <div className={cn('mt-3 flex-1 px-2 pb-4 sm:px-4', bodyClassName)}>{children}</div>
      {footer}
    </Card>
  )
}
