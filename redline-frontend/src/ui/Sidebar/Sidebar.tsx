import { NavLink, useLocation, useNavigate, createSearchParams } from 'react-router-dom'
import { cn } from '../../lib/cn'
import styles from './Sidebar.module.scss'
import { EmployeeCard } from '../EmployeeCard/EmployeeCard'
import { mockEmployees } from '../../lib/mockEmployees'

const items = [
  { to: '/chat', label: 'Чат' },
  { to: '/people', label: 'Люди' },
  { to: '/calls', label: 'Звонки' },
  { to: '/roadmap', label: 'Roadmap' },
]

export const Sidebar = () => {
  const location = useLocation()
  const isPeople = location.pathname.startsWith('/people')

  const navigate = useNavigate()
  const employees = mockEmployees
  const handleEmployeeClick = (id: string) => {
    const params = createSearchParams({ employee: id })
    navigate({ pathname: '/people', search: `?${params.toString()}` })
  }
  return (
    <div className={styles.wrapper}>
      <aside className={styles.root}>
        <div className={styles.logo}>RED LINE</div>
        <nav>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => cn(styles.link, isActive && styles.active)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {isPeople && (
          <div className={styles.employees}>
            <div className={styles.employeesTitle}>Сотрудники</div>
            <div className={styles.employeesList}>
              {employees.map((emp) => (
                <button key={emp.id} type="button" onClick={() => handleEmployeeClick(emp.id)} className="text-left">
                  <EmployeeCard
                    avatarUrl={emp.avatarUrl}
                    name={emp.name}
                    position={emp.position}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}


