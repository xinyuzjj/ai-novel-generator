const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 优化Electron应用配置
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor,WebGL');

// 增加应用性能
app.disableHardwareAcceleration();
app.allowRendererProcessReuse = true;

// 检查和创建必要的目录
function ensureDirectories() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Data directory created:', dataDir);
    }
}

// 创建主窗口
function createWindow() {
    ensureDirectories();

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        backgroundColor: '#121212',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            enableWebSQL: true,
            spellcheck: false,
            autoplayPolicy: 'no-user-gesture-required',
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegrationInWorker: false,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    // 设置窗口加载策略
    win.loadFile('index.html');

    // 打开开发者工具（仅在开发环境）
    // if (process.env.NODE_ENV === 'development') {
    //     win.webContents.openDevTools();
    // }

    // 优化窗口显示
    win.setMenu(null);
    win.setAutoHideMenuBar(true);
    win.setMenuBarVisibility(false);

    // 设置窗口关闭策略
    win.on('close', (e) => {
        // 可以在这里添加保存数据的逻辑
        console.log('Window is closing...');
    });

    // 处理窗口加载完成事件
    win.on('ready-to-show', () => {
        win.show();
        win.focus();
        console.log('Application loaded successfully');
    });

    // 处理页面加载失败
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('页面加载失败:', errorCode, errorDescription);
        // 可以在这里添加错误处理逻辑
    });

    // 处理IPC通信
    ipcMain.on('window-minimize', () => {
        win.minimize();
    });

    ipcMain.on('window-maximize', () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });

    ipcMain.on('window-close', () => {
        win.close();
    });

    // 监听窗口最大化状态变化
    win.on('maximize', () => {
        win.webContents.send('window-is-maximized');
    });

    win.on('unmaximize', () => {
        win.webContents.send('window-is-unmaximized');
    });

    // 处理应用崩溃
    win.webContents.on('crashed', () => {
        console.error('页面崩溃，尝试重启...');
        // 可以在这里添加重启逻辑
    });

    // 处理应用无响应
    win.on('unresponsive', () => {
        console.error('应用无响应...');
        // 可以在这里添加恢复逻辑
    });

    // 处理应用恢复响应
    win.on('responsive', () => {
        console.log('Application responsive');
    });
}

// 应用事件处理
app.on('ready', () => {
    console.log('Application starting...');
    createWindow();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('Application activated, creating new window...');
        createWindow();
    }
});

app.on('window-all-closed', () => {
    console.log('All windows closed, application exiting...');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 处理应用退出事件
app.on('before-quit', () => {
    console.log('Application exiting...');
    // 可以在这里添加清理逻辑
});

app.on('will-quit', () => {
    console.log('Application will exit...');
    // 可以在这里添加退出逻辑
});

// 处理应用崩溃
app.on('renderer-process-crashed', (event, webContents, details) => {
    console.error('Renderer process crashed:', details);
    // 可以在这里添加恢复逻辑
});

// 处理应用无响应
app.on('renderer-process-unresponsive', (event, webContents) => {
    console.error('Renderer process unresponsive');
    // 可以在这里添加恢复逻辑
});

// 处理应用恢复响应
app.on('renderer-process-responsive', (event, webContents) => {
    console.log('Renderer process responsive');
});

// 处理应用错误
app.on('web-contents-created', (event, webContents) => {
    webContents.on('will-navigate', (event, url) => {
        if (url !== webContents.getURL()) {
            event.preventDefault();
            console.log('Prevent external navigation:', url);
        }
    });
});

// 处理应用错误
app.on('error', (error) => {
    console.error('Application error:', error);
});

// 处理应用警告
app.on('warn-logged', (warning) => {
    console.warn('Application warning:', warning);
});

// 处理应用信息
app.on('info-logged', (info) => {
    console.info('Application info:', info);
});
