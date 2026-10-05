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
  ReadTables,
  WriteBill,
  WriteNote,
  SaveTableOrder,
  SettleTable
} from '@shared/types'
import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('preload script is not context isolated context Isolation must be enabled')
}

try {
  contextBridge.exposeInMainWorld('context', {
    // TODO
    locale: navigator.language,
    getNotes: (...args: Parameters<GetNotes>) => ipcRenderer.invoke('getNotes', ...args),
    readNote: (...args: Parameters<ReadNote>) => ipcRenderer.invoke('readNote', ...args),
    writeNote: (...args: Parameters<WriteNote>) => ipcRenderer.invoke('writeNote', ...args),
    createNote: (...args: Parameters<CreateNote>) => ipcRenderer.invoke('createNote', ...args),
    deleteNote: (...args: Parameters<DeleteNote>) => ipcRenderer.invoke('deleteNote', ...args),
    getTables: (...args: Parameters<GetTables>) => ipcRenderer.invoke('getTables', ...args),
    readTables: (...args: Parameters<ReadTables>) => ipcRenderer.invoke('readTables', ...args),
    getBills: (...args: Parameters<GetBills>) => ipcRenderer.invoke('getBills', ...args),
    readBill: (...args: Parameters<ReadBill>) => ipcRenderer.invoke('readBill', ...args),
    writeBill: (...args: Parameters<WriteBill>) => ipcRenderer.invoke('writeBill', ...args),
    createBill: (...args: Parameters<CreateBill>) => ipcRenderer.invoke('createBill', ...args),
    deleteBill: (...args: Parameters<DeleteBill>) => ipcRenderer.invoke('deleteBill', ...args),
    // POS
    getOutlet: () => ipcRenderer.invoke('getOutlet'),
    getMenu: () => ipcRenderer.invoke('getMenu'),
    getFloor: () => ipcRenderer.invoke('getFloor'),
    getInventory: () => ipcRenderer.invoke('getInventory'),
    listBills: () => ipcRenderer.invoke('listBills'),
    getSalesSummary: () => ipcRenderer.invoke('getSalesSummary'),
    saveTableOrder: (...args: Parameters<SaveTableOrder>) =>
      ipcRenderer.invoke('saveTableOrder', ...args),
    settleTable: (...args: Parameters<SettleTable>) => ipcRenderer.invoke('settleTable', ...args)
  })
} catch (error) {
  console.log(error)
}
