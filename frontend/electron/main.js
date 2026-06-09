const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let pythonProcess
const isDev = process.env.NODE_ENV === 'development'

function startPythonServer() {
  const backendPath = isDev
    ? path.join(__dirname, '../../backend')
    : path.join(process.resourcesPath, 'backend')

  const pythonExec = process.platform === 'win32' ? 'python' : 'python3'

  pythonProcess = spawn(pythonExec, ['main.py'], {
    cwd: backendPath,
    env: { ...process.env },
  })

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python] ${data}`)
  })

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Python Error] ${data}`)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#0a0a0f',
  })

  if (isDev) {
    // 서버 준비까지 잠깐 대기
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173')
      mainWindow.webContents.openDevTools()
    }, 2000)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  startPythonServer()
  createWindow()
})

app.on('window-all-closed', () => {
  if (pythonProcess) pythonProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
