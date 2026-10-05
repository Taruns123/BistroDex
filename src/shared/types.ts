import { BillContent, BillInfo, NoteContent, NoteInfo, TableInfo } from './models'
import type {
  Bill,
  DiningTable,
  InventoryItem,
  Menu,
  OrderLine,
  Outlet,
  PaymentMode,
  SalesSummary
} from './models'

export type GetNotes = () => Promise<NoteInfo[]>

export type ReadNote = (title: NoteInfo['title']) => Promise<NoteContent>

export type WriteNote = (title: NoteInfo['title'], content: NoteContent) => Promise<void>

export type CreateNote = () => Promise<NoteInfo['title'] | false>

export type DeleteNote = (title: NoteInfo['title']) => Promise<boolean>

export type GetTables = () => Promise<TableInfo[]>

export type ReadTables = () => Promise<string>

////////////////////

export type GetBills = () => Promise<BillInfo[]>

export type ReadBill = (bill_no: BillInfo['bill_no']) => Promise<BillContent>

export type WriteBill = (bill_no: BillInfo['bill_no'], content: BillContent) => Promise<void>

export type CreateBill = (
  table_no: string,
  content: BillContent
) => Promise<BillInfo['bill_no'] | false | void>

export type DeleteBill = (bill_no: BillInfo['bill_no']) => Promise<boolean>

////////////////////

/* POS channels */

export type GetOutlet = () => Promise<Outlet>
export type GetMenu = () => Promise<Menu>
export type GetFloor = () => Promise<DiningTable[]>
export type SaveTableOrder = (tableId: string, lines: OrderLine[]) => Promise<DiningTable>
export type SettleTable = (
  tableId: string,
  paymentMode: PaymentMode,
  discountPct: number
) => Promise<Bill>
export type GetInventory = () => Promise<InventoryItem[]>
export type ListBills = () => Promise<Bill[]>
export type GetSalesSummary = () => Promise<SalesSummary>

/** Everything the renderer needs from the outside world. */
export type BistroApi = {
  getOutlet: GetOutlet
  getMenu: GetMenu
  getFloor: GetFloor
  saveTableOrder: SaveTableOrder
  settleTable: SettleTable
  getInventory: GetInventory
  listBills: ListBills
  getSalesSummary: GetSalesSummary
}
