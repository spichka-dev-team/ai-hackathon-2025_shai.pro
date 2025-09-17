import type { ImgHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import styles from './EmployeeCard.module.scss'

export interface EmployeeCardProps {
  avatarUrl: string
  name: string
  position: string
  className?: string
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
}

export const EmployeeCard = ({
  avatarUrl,
  name,
  position,
  className,
  imgProps,
}: EmployeeCardProps) => {
  return (
    <div className={cn(styles.root, className)}>
      <img
        src={avatarUrl}
        alt={name}
        className={styles.avatar}
        width={48}
        height={48}
        {...imgProps}
      />
      <div className={styles.text}>
        <div className={styles.name}>{name}</div>
        <div className={styles.position}>{position}</div>
      </div>
    </div>
  )
}


