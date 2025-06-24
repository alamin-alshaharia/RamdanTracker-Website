const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Platform info
  platform: process.platform,
  
  // App info
  isElectron: true,
  isDev: process.env.NODE_ENV === 'development'
});

// Handle window controls for custom titlebar (if needed)
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});

// Listen for window state changes
ipcRenderer.on('window-state-changed', (event, isMaximized) => {
  // You can emit this to the renderer if needed
  window.dispatchEvent(new CustomEvent('window-state-changed', { detail: { isMaximized } }));
}); 