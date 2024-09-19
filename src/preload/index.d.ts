import {
  CreateBill,
  CreateNote,
  DeleteBill,
  DeleteNote,
  GetBills,
  GetNotes,
  GetTables,
  ReadBill,
  ReadNote,
  WriteBill,
  WriteNote
} from '@shared/types'

declare global {
  interface Window {
    // electron: ElectronAPI
    context: {
      locale: string
      getNotes: GetNotes
      readNote: ReadNote
      writeNote: WriteNote
      createNote: CreateNote
      deleteNote: DeleteNote
      getTables: GetTables
      readTables: ReadTables
      getBills: GetBills
      readBill: ReadBill
      writeBill: WriteBill
      createBill: CreateBill
      deleteBill: DeleteBill
    }
  }
}
