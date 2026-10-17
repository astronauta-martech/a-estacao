// App de mesa da Estação: liga o servidor (app/servidor.js) dentro do próprio
// processo e abre a página numa janela. Fechar a janela desliga tudo.
//
// Quem instala pelo instalador não precisa de Node nem de Terminal: o Electron
// já traz o Node. O servidor é o mesmo do clone, sem mudança de comportamento,
// só com ESTACAO_APP=1 para a tela de atualização apontar para os instaladores.

const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');

const PORTA = Number(process.env.PORTA || 4317);
const ENDERECO = `http://localhost:${PORTA}`;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let janela = null;

  app.on('second-instance', () => {
    if (!janela) return;
    if (janela.isMinimized()) janela.restore();
    janela.focus();
  });

  // Responde quando o servidor (este ou um já ligado pelo clone) atende na porta
  const atende = () => new Promise(ok => {
    const req = http.get(`${ENDERECO}/api/versao`, { timeout: 1500 }, res => { res.resume(); ok(res.statusCode > 0); });
    req.on('error', () => ok(false));
    req.on('timeout', () => { req.destroy(); ok(false); });
  });

  async function esperarServidor(ms) {
    const fim = Date.now() + ms;
    while (Date.now() < fim) {
      if (await atende()) return true;
      await new Promise(ok => setTimeout(ok, 300));
    }
    return false;
  }

  async function ligarServidor() {
    // Se A Estação do clone já está ligada nesta porta, usa ela em vez de brigar pela porta
    if (await atende()) return;
    process.env.ESTACAO_APP = '1';
    const pastaApp = app.isPackaged
      ? path.join(process.resourcesPath, 'app')
      : path.join(__dirname, '..', 'app');
    await import(pathToFileURL(path.join(pastaApp, 'servidor.js')).href);
  }

  function abrirJanela() {
    janela = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 900,
      minHeight: 600,
      title: 'A Estação',
      backgroundColor: '#a99fca',
      autoHideMenuBar: true,
      webPreferences: { contextIsolation: true, sandbox: true },
    });
    // Links para fora (GitHub, releases) abrem no navegador, não dentro da janela
    janela.webContents.setWindowOpenHandler(({ url }) => {
      if (!url.startsWith(ENDERECO)) shell.openExternal(url);
      return { action: url.startsWith(ENDERECO) ? 'allow' : 'deny' };
    });
    janela.webContents.on('will-navigate', (evento, url) => {
      if (url.startsWith(ENDERECO)) return;
      evento.preventDefault();
      shell.openExternal(url);
    });
    janela.on('closed', () => { janela = null; });
    janela.loadURL(ENDERECO);
  }

  app.whenReady().then(async () => {
    try {
      await ligarServidor();
    } catch (e) {
      dialog.showErrorBox('A Estação', `O servidor não ligou: ${e?.message || e}`);
      app.quit();
      return;
    }
    if (!(await esperarServidor(15000))) {
      dialog.showErrorBox('A Estação', `Nada respondeu em ${ENDERECO}. Talvez outro programa esteja usando a porta ${PORTA}.`);
      app.quit();
      return;
    }
    abrirJanela();
    app.on('activate', () => { if (!janela) abrirJanela(); });
  });

  app.on('window-all-closed', () => app.quit());
}
