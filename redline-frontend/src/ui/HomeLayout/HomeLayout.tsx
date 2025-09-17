import { Outlet } from 'react-router-dom'
import { Container } from '../Container/Container'
import { Sidebar } from '../Sidebar/Sidebar'
import styles from './HomeLayout.module.scss'

export const HomeLayout = () => {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <Container>
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}


