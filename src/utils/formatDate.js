import { subYears, subMonths, subDays, format, isWeekend } from 'date-fns'

const currentDate = new Date()
const dateFormat = 'YYYY-MM-DD'
const cache = {}
export default function formatDate (type, distance = 1) {
  if (!type) {
    return format(currentDate, dateFormat)
  }
  if (cache[type]) {
    return cache[type]
  }
  let distanceFn
  switch (type) {
    case 'last-day':
      distanceFn = subDays
      break
    case 'last-month':
      distanceFn = subMonths
      break
    case 'last-year':
    default:
      distanceFn = subYears
      break
  }
  return (cache[type] = format(distanceFn(currentDate, distance), dateFormat))
}

export function getLastMonthWeekday () {
  let lastMonthDay = subMonths(currentDate, 1)
  while (isWeekend(lastMonthDay)) {
    lastMonthDay = subDays(lastMonthDay, 1)
  }
  return format(lastMonthDay, dateFormat)
}
