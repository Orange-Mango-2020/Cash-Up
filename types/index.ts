export type UserRole = "owner" | "manager"

export type DayStatus = "pending" | "open" | "complete" | "locked"

export type User = {
  id: string
  name: string
  role: UserRole
  active: boolean
}

export type Month = {
  id: string
  label: string
  year: number
  month_num: number
}

export type WorkingDay = {
  id: string
  month_id: string
  date: string
  day_label: string
  day_index: number
  status: DayStatus
}
