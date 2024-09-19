import { BillContent, BillInfo, NoteContent, NoteInfo, TableInfo } from '@shared/models'
import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

const loadNotes = async () => {
  const notes = await window.context.getNotes()

  // sort them by most recently edited
  return notes.sort((a, b) => b.lastEditTime - a.lastEditTime)
}

const notesAtomAsync = atom<NoteInfo[] | Promise<NoteInfo[]>>(loadNotes())

export const notesAtom = unwrap(notesAtomAsync, (prev) => prev)

export const selectedNoteIndexAtom = atom<number | null>(null)

const selectedNoteAtomAsync = atom(async (get) => {
  const notes = get(notesAtom)
  const selectedNoteIndex = get(selectedNoteIndexAtom)

  if (selectedNoteIndex === null || !notes) return null

  const selectedNote = notes[selectedNoteIndex]

  const noteContent = await window.context.readNote(selectedNote.title)

  return {
    ...selectedNote,
    content: noteContent
  }
})

export const selectedNoteAtom = unwrap(
  selectedNoteAtomAsync,
  (prev) =>
    prev ?? {
      title: '',
      lastEditTime: Date.now(),
      content: ''
    }
)

export const saveNoteAtom = atom(null, async (get, set, newContent: NoteContent) => {
  const notes = get(notesAtom)
  const selectedNote = get(selectedNoteAtom)

  if (!selectedNote || !notes) return

  // save on disk
  await window.context.writeNote(selectedNote.title, newContent)

  // update the last edit time
  set(
    notesAtom,
    notes.map((note) => {
      if (note.title === selectedNote.title) {
        return {
          ...note,
          lastEditTime: Date.now()
        }
      }
      return note
    })
  )
})

export const createEmptyNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom)

  if (!notes) return
  const title = await window.context.createNote()

  if (!title) return

  const newNote: NoteInfo = {
    title: title,
    lastEditTime: Date.now()
  }
  set(notesAtom, [newNote, ...notes.filter((note) => note.title !== newNote.title)])

  set(selectedNoteIndexAtom, 0)
})

export const deleteNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom)
  const selectedNote = get(selectedNoteAtom)

  if (!selectedNote || !notes) return

  const isDeleted = await window.context.deleteNote(selectedNote.title)

  if (!isDeleted) return
  // filter out the deleted note
  set(
    notesAtom,
    notes.filter((note) => note.title !== selectedNote.title)
  )
  // de select any note
  set(selectedNoteIndexAtom, null)
})

/////////////////////////////////////////////////

const loadTables = async () => {
  const tables = await window.context.getTables()

  // sort them by most recently edited
  return tables
}

const tablesAtomAsync = atom<TableInfo[] | Promise<TableInfo[]>>(loadTables())

export const tablesAtom = unwrap(tablesAtomAsync, (prev) => prev)

export const selectedTableIndexAtom = atom<number | null>(null)

const selectedTableAtomAsync = atom(async (get) => {
  const tables = get(tablesAtom)
  const selectedTableIndex = get(selectedTableIndexAtom)

  if (selectedTableIndex === null || !tables) return null

  const selectedTable = tables[selectedTableIndex]

  const tableContent = await window.context.readTables(selectedTable.tableNumber)

  return {
    ...selectedTable,
    content: tableContent
  }
})

export const selectedTableAtom = unwrap(
  selectedTableAtomAsync,
  (prev) =>
    prev ?? {
      tableNumber: '',
      lastEditTime: Date.now(),
      content: ''
    }
)

//////////////////////////////////////

const loadBills = async () => {
  const bills = await window.context.getBills()

  // sort them by most recently edited
  console.log('bills: ', bills)
  return bills

  // return notes.sort((a, b) => b.lastEditTime - a.lastEditTime)
}

const billsAtomAsync = atom<BillInfo[] | Promise<BillInfo[]>>(loadBills())

export const billsAtom = unwrap(billsAtomAsync, (prev) => prev)

export const selectedBillIndexAtom = atom<number | null>(null)

const selectedBillAtomAsync = atom(async (get) => {
  const bills = get(billsAtom)
  const selectedBillIndex = get(selectedBillIndexAtom)

  if (selectedBillIndex === null || !bills) return null

  const selectedBill = bills[selectedBillIndex]

  const billContent = await window.context.readBill(selectedBill.bill_no)

  console.log('bill Contnet', billContent)

  let val = {
    ...selectedBill,
    content: billContent
  }

  console.log(val, typeof val, 'this is val')

  return val
})

export const selectedBillAtom = unwrap(
  selectedBillAtomAsync,
  (prev) =>
    prev ?? {
      bill_no: '',
      total_amount: 0,
      status: 'unpaid',
      content: ''
    }
)

export const saveBillAtom = atom(null, async (get, set, newContent: BillContent) => {
  const bills = get(billsAtom)
  const selectedBill = get(selectedBillAtom)

  if (!selectedBill || !bills) return

  // save on disk
  await window.context.writeBill(selectedBill.bill_no, newContent)

  // update the last edit time
  // set(
  //   billsAtom,
  //   bills.map((note) => {
  //     if (note.title === selectedNote.title) {
  //       return {
  //         ...note,
  //         lastEditTime: Date.now()
  //       }
  //     }
  //     return note
  //   })
  // )
})

export const createEmptyBillAtom = atom(
  null,
  async (get, set, table_no: string, newContent: BillContent) => {
    const bills = get(billsAtom)

    if (!bills) return
    const bill_no = await window.context.createBill(table_no, newContent)

    if (!bill_no) return

    const newBill: BillInfo = {
      bill_no: bill_no,
      total_amount: JSON.parse(newContent).total_amount,
      status: JSON.parse(newContent).status
    }
    set(billsAtom, [newBill, ...bills.filter((bill) => bill.bill_no !== newBill.bill_no)])

    set(selectedBillIndexAtom, 0)
  }
)

export const deleteBillAtom = atom(null, async (get, set) => {
  const bills = get(billsAtom)
  const selectedBill = get(selectedBillAtom)

  if (!selectedBill || !bills) return

  const isDeleted = await window.context.deleteBill(selectedBill.bill_no)

  if (!isDeleted) return
  // filter out the deleted note
  set(
    billsAtom,
    bills.filter((bill) => bill.bill_no !== selectedBill.bill_no)
  )
  // de select any note
  set(selectedBillIndexAtom, null)
})
