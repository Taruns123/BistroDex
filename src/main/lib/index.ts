import { appDirectoryName, fileEncoding, welcomeNoteFilename } from '@shared/constants'
import { BillInfo, NoteInfo } from '@shared/models'
import {
  CreateBill,
  CreateNote,
  DeleteBill,
  DeleteNote,
  GetBills,
  GetNotes,
  ReadBill,
  ReadNote,
  ReadTables,
  WriteBill,
  WriteNote
} from '@shared/types'
import { dialog } from 'electron'
import { ensureDir, readFile, readdir, remove, stat, writeFile } from 'fs-extra'
import { isEmpty } from 'lodash'
import { homedir } from 'os'
import path from 'path'
import welcomeNoteFile from '../../../resources/welcomeNote.md?asset'

export const getRootDir = () => {
  return `${homedir()}\\${appDirectoryName}`
}

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  if (isEmpty(notes)) {
    console.info('no notes found, creating a welcome note')

    const content = await readFile(welcomeNoteFile, { encoding: fileEncoding })

    // create a welcome note
    await writeFile(`${rootDir}\\${welcomeNoteFilename}`, content, {
      encoding: fileEncoding
    })

    notes.push(welcomeNoteFilename)
  }

  const returnVal = Promise.all(notes.map(getNoteInfoFromFilename))
  console.log('returnVal:: ', returnVal)
  return returnVal
}

export const getNoteInfoFromFilename = async (filename: string): Promise<NoteInfo> => {
  const fileStats = await stat(`${getRootDir()}\\${filename}`)

  return {
    title: filename.replace('.md', ''),
    lastEditTime: fileStats.mtimeMs
  }
}

export const readNote: ReadNote = async (filename) => {
  const rootDir = getRootDir()

  return readFile(`${rootDir}\\${filename}.md`, {
    encoding: fileEncoding
  })
}

export const writeNote: WriteNote = async (filename, content) => {
  const rootDir = getRootDir()

  return writeFile(`${rootDir}\\${filename}.md`, content, {
    encoding: fileEncoding
  })
}

export const createNote: CreateNote = async () => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'New note',
    defaultPath: `${rootDir}\\Untitled.md`,
    buttonLabel: 'Create',
    properties: ['showOverwriteConfirmation'],
    showsTagField: false
    // filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (canceled || !filePath) {
    console.info('Note creation canceled')
    return false
  }

  const { name: filename, dir: parentDir } = path.parse(filePath)

  if (parentDir !== rootDir) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Invalid parent directory',
      message: `The note must be created in the ${rootDir} directory`,
      detail: `The root directory is ${rootDir}`
    })

    return false
  }

  console.info(`Creating note ${filePath}`)
  await writeFile(filePath, '', { encoding: fileEncoding })

  return filename
}

export const deleteNote: DeleteNote = async (filename) => {
  const rootDir = getRootDir()

  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Delete note',
    message: `Are you sure you want to delete the note ${filename}?`,
    detail: 'This action cannot be undone',
    buttons: ['Delete', 'Cancel'],
    defaultId: 1,
    cancelId: 1
  })

  if (response === 1) {
    console.info('Note deletion canceled')
    return false
  }

  const filePath = `${rootDir}\\${filename}.md`

  console.info(`Deleting note ${filename}`)
  await remove(filePath)

  return true
}

export const getTables: ReadTables = async () => {
  const rootDir = getRootDir()

  let readValue = readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  console.log('readValue', readValue)
  return readValue
}
export const readTables: ReadTables = async () => {
  const rootDir = getRootDir()

  let readValue = readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  console.log('readValue', readValue)
  return readValue
}

/////////////////////////////////////////////////////////////////

export const getBills: GetBills = async () => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const billDataString = await readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  const billData = JSON.parse(billDataString)

  const billInfo = billData.tables.flatMap((table) =>
    table.bills.map((bill) => ({
      bill_no: bill.bill_no,
      total_amount: bill.total_amount,
      status: bill.status
    }))
  )

  // const notesFileNames = await readdir(rootDir, {
  //   encoding: fileEncoding,
  //   withFileTypes: false
  // })

  // const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  // if (isEmpty(notes)) {
  //   console.info('no notes found, creating a welcome note')

  //   const content = await readFile(welcomeNoteFile, { encoding: fileEncoding })

  //   // create a welcome note
  //   await writeFile(`${rootDir}\\${welcomeNoteFilename}`, content, {
  //     encoding: fileEncoding
  //   })

  //   notes.push(welcomeNoteFilename)
  // }

  // const returnVal = Promise.all(notes.map(getNoteInfoFromFilename))
  // console.log('returnVal:: ', returnVal)
  // return returnVal

  return Promise.all(billInfo)
}

// export const getNoteInfoFromFilename = async (filename: string): Promise<NoteInfo> => {
//   const fileStats = await stat(`${getRootDir()}\\${filename}`)

//   return {
//     title: filename.replace('.md', ''),
//     lastEditTime: fileStats.mtimeMs
//   }
// }

export const readBill: ReadBill = async (bill_no) => {
  const rootDir = getRootDir()

  const billDataString = await readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  const billData = JSON.parse(billDataString)
  const bill = billData.tables
    .flatMap((table) => table.bills)
    .find((bill) => bill.bill_no === bill_no)
  return bill
}

export const writeBill: WriteBill = async (bill_no, bill_content) => {
  const rootDir = getRootDir()

  const oldContent = await readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  const oldData = JSON.parse(oldContent)

  const newContent = JSON.stringify({
    tables: oldData.tables.map((table) => ({
      ...table,
      bills: table.bills.map((bill) => (bill.bill_no === bill_no ? bill_content : bill))
    }))
  })

  return writeFile(`${rootDir}\\tables_14_05_2024.json`, newContent, {
    encoding: fileEncoding
  })
}

export const createBill: CreateBill = async (table_no, bill_content) => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const oldBillsData = await readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  const oldData = JSON.parse(oldBillsData)

  const newBill = bill_content

  const tableIndex = oldData.tables.findIndex((table) => table.tableNumber === table_no)

  if (tableIndex !== -1) {
    oldData.tables[tableIndex].bills.push(bill_content)
  } else {
    oldData.tables.push({
      tableNumber: table_no,
      bills: [bill_content]
    })
  }

  const billContentJson = JSON.parse(bill_content)

  const newContent = JSON.stringify(oldData)

  return writeFile(`${rootDir}\\tables_14_05_2024.json`, newContent, {
    encoding: fileEncoding
  })
  const newBillInfo: BillInfo = {
    bill_no: billContentJson.bill_no,
    total_amount: billContentJson.total_amount,
    status: billContentJson.status
  }

  return newBillInfo ? JSON.stringify(newBillInfo) : false
}

export const deleteBill: DeleteBill = async (bill_no) => {
  const rootDir = getRootDir()

  const oldContent = await readFile(`${rootDir}\\tables_14_05_2024.json`, {
    encoding: fileEncoding
  })

  const oldData = JSON.parse(oldContent)

  const newContent = JSON.stringify({
    tables: oldData.tables.map((table) => ({
      ...table,
      bills: table.bills.filter((bill) => bill.bill_no !== bill_no)
    }))
  })

  await writeFile(`${rootDir}\\tables_14_05_2024.json`, newContent, {
    encoding: fileEncoding
  })

  return true
}
