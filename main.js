const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

let win = null;

const Store = require('electron-store');

const store = new Store();


function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    show: false,
    maximizable: false,
    fullscreenable: false, // think about this!
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // file transfer (drag and drop???)
  win.loadURL(
    isDev
      ? "http://localhost:8080"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  win.once("ready-to-show", () => {
    win.show();
  })

  if (!isDev) {
    win.removeMenu();
  }

  ipcMain.on("select-document", async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      defaultPath: app.getPath("documents"),
      title: "Choose a Word document",
      buttonLabel: "Choose file",
      filters: [{ name: "Word Documents", extensions: ["doc", "docx"] }],
      properties: ["openFile"],
    });
    const [documentPath] = filePaths;
    event.reply("document-selected", { canceled, documentPath });
  });

  ipcMain.handle("last-opened-project", () => {
    return store.get("lastOpenedProject");
  })

  ipcMain.on("save-last-opened-project", (event, lastProject) => {
    store.set("lastOpenedProject", lastProject);
  })
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
