import type { PropsWithChildren } from 'react'
import styles from './Container.module.scss'

export const Container = ({ children }: PropsWithChildren) => {
  return <div className={styles.root}>{children}</div>
}


