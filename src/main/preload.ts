import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onMessage: 
  (callback: (message: string) => void) => ipcRenderer.on('message', (event, message) => callback(message))
})
