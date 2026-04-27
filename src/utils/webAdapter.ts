import api from '../services/api';

// Notificações Base na Web
export const showNotification = (title: string, body: string) => {
  if (!('Notification' in window)) {
    console.warn('Notificações não suportadas neste navegador');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
};

// Clipboard via Web API
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Falha ao copiar:', err);
    return false;
  }
};

// Abrir Link Externo
export const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Backend Integration (Substituições ao Electron FS API)

export const backupAPI = {
  // Salva enviando ao File System do servidor Node.js
  save: async (dadosBackup: any, filename: string | null = null) => {
    try {
      const response = await api.post('/backups', { dadosBackup, filename });
      showNotification('Sucesso', 'Backup salvo no servidor local com sucesso!');
      return response.data;
    } catch (err) {
      showNotification('Erro', 'Houve um erro ao tentar salvar o backup localmente.');
      console.error(err);
      return null;
    }
  },
  
  // Lista todos os arquivos `.json` exportados no diretorio de Backups no Servidor
  list: async () => {
    try {
      const response = await api.get('/backups');
      return response.data.backups; // Array of strings (filenames)
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  
  // Carrega um backup nativo pelo filename listado
  load: async (filename: string) => {
    try {
      const response = await api.get(`/backups/${filename}`);
      return response.data.data; // JSON Data
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // Fallback pra file Input caso não queira usar o que tá listado
  loadFromFilePrompt: async () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse((event.target as FileReader).result as string);
            resolve(data);
          } catch(err) {
             console.error("Erro ao ler JSON: ", err);
             resolve(null);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
};
