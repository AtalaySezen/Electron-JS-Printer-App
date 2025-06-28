const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("printerAPI", {
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  selectPdf: () => ipcRenderer.invoke("select-pdf"),
  print: (printerName, filePath) => ipcRenderer.invoke("print", printerName, filePath),
});
