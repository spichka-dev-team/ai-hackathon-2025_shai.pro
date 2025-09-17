import { useSearchParams } from 'react-router-dom'
import { mockEmployees } from '../../lib/mockEmployees'
import styles from './OptionTwo.module.scss'
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { LineChart as LineChartIcon, Phone as PhoneIcon } from 'lucide-react'

export const OptionTwo = () => {
  const [search] = useSearchParams()
  const employeeId = search.get('employee') || ''
  const employee = mockEmployees.find((e) => e.id === employeeId)
  const callItems = demoCalls

  if (!employee) {
    return (
      <div className={styles.center}>
        <div className={styles.hint}>Кликните на пользователя что бы посмотреть его статистику</div>
      </div>
    )
  }

  return (
    <div className={styles.section}>
      <div className={styles.parent}>
        <div className={`${styles.card} ${styles.div1}`}>
          <div className={styles.userHeader}>
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              className={styles.userAvatarLg}
              width={200}
              height={200}
            />
            <div className={styles.userText}>
              <div className={styles.userNameLg}>{employee.name}</div>
              <div className={styles.userPositionLg}>{employee.position}</div>
            </div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.div3}`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LineChartIcon size={18} className="text-[#F33955]" />
              <div className="text-sm font-medium text-gray-800">Индекс эффективности выполнения задач</div>
            </div>
            <div className="h-40">
              <ChartSection color="#F33955" />
            </div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.div2}`}>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-800">Посещение звонков</h3>
            <ul className="divide-y divide-gray-200/60">
              {callItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-2">
                  <PhoneIcon
                    size={18}
                    className={item.attended ? 'text-green-600 mt-0.5' : 'text-[#F33955] mt-0.5'}
                    aria-hidden
                  />
                  <div className="flex flex-col">
                    <time dateTime={item.dateISO} className="text-sm font-medium text-gray-900">
                      {item.dateDisplay}
                    </time>
                    <div className="text-xs text-gray-500">
                      <time dateTime={item.start}>{item.start}</time> - <time dateTime={item.end}>{item.end}</time>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
type DataPoint = { day: string; score: number }

const data: DataPoint[] = [
  { day: 'Пн', score: 62 },
  { day: 'Вт', score: 68 },
  { day: 'Ср', score: 75 },
  { day: 'Чт', score: 71 },
  { day: 'Пт', score: 84 },
  { day: 'Сб', score: 79 },
  { day: 'Вс', score: 73 },
]

function ChartSection({ color }: { color: string }) {
  const config: ChartConfig = {
    score: { label: 'Индекс', color },
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-full w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillScore" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
        <YAxis hide domain={[0, 100]} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: '#e5e7eb', strokeDasharray: 4 }} />
        <Area
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2}
          fill="url(#fillScore)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

type CallItem = {
  id: string
  attended: boolean
  dateISO: string
  dateDisplay: string
  start: string
  end: string
}

const demoCalls: CallItem[] = [
  {
    id: '1',
    attended: true,
    dateISO: '2025-09-15',
    dateDisplay: '15.09.2025',
    start: '12:00',
    end: '13:00',
  },
  {
    id: '2',
    attended: false,
    dateISO: '2025-09-16',
    dateDisplay: '16.09.2025',
    start: '10:30',
    end: '11:00',
  },
  {
    id: '3',
    attended: true,
    dateISO: '2025-09-17',
    dateDisplay: '17.09.2025',
    start: '09:00',
    end: '09:45',
  },
]



