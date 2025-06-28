const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const os = require("os");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
});

// Yazıcı listesini getir
ipcMain.handle("get-printers", async () => {
  const platform = os.platform();

  try {
    if (platform === "win32") {
      const { stdout } = await execAsync(`wmic printer get name`);
      return stdout
        .split("\n")
        .slice(1)
        .map((line) => line.trim())
        .filter((name) => name.length > 0);
    } else {
      const { stdout } = await execAsync("lpstat -a");
      return stdout
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => line.split(" ")[0]);
    }
  } catch (err) {
    console.error("Yazıcı listesi alınamadı:", err);
    return [];
  }
});

// PDF seçici
ipcMain.handle("select-pdf", async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    properties: ["openFile"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  } else {
    return null;
  }
});

// Yazdırma işlemi
ipcMain.handle("print", async (event, printerName, filePath) => {
  const cleanPrinterName = printerName.trim().replace(/,$/, "");
  const platform = os.platform();

  let command;

  if (platform === "win32") {
    // Windows için basit print komutu
    command = `print /d:"${cleanPrinterName}" "${filePath}"`;
  } else {
    // macOS ve Linux
    command = `lp -d "${cleanPrinterName}" "${filePath}"`;
  }

  console.log("Yazdırma komutu:", command);

  try {
    await execAsync(command);
  } catch (error) {
    console.error("Yazdırma hatası:", error);
    throw error;
  }
});
