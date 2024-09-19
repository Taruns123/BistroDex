export type NoteInfo = {
  title: string
  lastEditTime: number
}

export type NoteContent = string

export type TableInfo = {
  tableNumber: any
  lastEditTime: number
}

export type TableContent = Record<string, any>

export type BillInfo = {
  bill_no: string
  total_amount: number
  status: string
}

export type BillContent = string
