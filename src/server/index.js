require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3002', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const apiRouter = express.Router();

const backupDir = path.join(__dirname, '..', '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

apiRouter.post('/backups', (req, res) => {
  try {
    const { dadosBackup, filename } = req.body;
    if (!dadosBackup) {
      return res.status(400).json({ error: 'Dados do backup não fornecidos' });
    }
    
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const finalName = filename || `backup_${ts}.json`;
    const filePath = path.join(backupDir, finalName);
    
    fs.writeFileSync(filePath, JSON.stringify(dadosBackup, null, 2));
    
    res.json({ success: true, message: 'Backup salvo com sucesso', filename: finalName });
  } catch (error) {
    console.error('Erro ao salvar backup:', error);
    res.status(500).json({ error: 'Erro ao salvar o backup no servidor' });
  }
});

apiRouter.get('/backups', (req, res) => {
  try {
    const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
    res.json({ backups: files });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({ error: 'Erro ao listar backups do servidor' });
  }
});

apiRouter.get('/backups/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(backupDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo de backup não encontrado' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    res.json({ data: JSON.parse(fileContent) });
  } catch (error) {
    console.error('Erro ao ler backup:', error);
    res.status(500).json({ error: 'Erro ao ler arquivo de backup' });
  }
});

app.use('/api/v1', apiRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Express Server rodando na porta ${PORT}`);
});
