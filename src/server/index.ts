import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import toolcenterAuthMiddleware from './middleware/toolcenterAuth';
import { initDB } from './database/schema';
import { importBackupToDb, exportDbToBackup } from './services/backupService';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar SQLite
initDB();

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
app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const apiRouter = express.Router();

apiRouter.use(toolcenterAuthMiddleware);

apiRouter.get('/me', (req: Request, res: Response) => {
  res.json({ user: req.user });
});

const backupDir = path.join(__dirname, '..', '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

apiRouter.post('/backups', (req: Request, res: Response) => {
  try {
    const { dadosBackup, filename } = req.body;
    if (!dadosBackup) {
      return res.status(400).json({ error: 'Dados do backup não fornecidos' });
    }
    
    // 1 - Persistir em SQLite Transacional
    importBackupToDb(dadosBackup);
    
    // 2 - Salvar também em arquivo para histórico (retrocompatibilidade da UI)
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const finalName = filename || `backup_${ts}.json`;
    const filePath = path.join(backupDir, finalName);
    
    fs.writeFileSync(filePath, JSON.stringify(dadosBackup, null, 2));
    
    res.json({ success: true, message: 'Dados gravados no banco e backup salvo', filename: finalName });
  } catch (error) {
    console.error('Erro ao processar e salvar no banco:', error);
    res.status(500).json({ error: 'Erro fatal ao persistir dados no SQLite' });
  }
});

apiRouter.get('/backups', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
    files.unshift('ESTADO_ATUAL_DB.json'); // Inject current SQLite active export
    res.json({ backups: files });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({ error: 'Erro ao listar backups do servidor' });
  }
});

apiRouter.get('/backups/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    
    if (filename === 'ESTADO_ATUAL_DB.json') {
      const dbData = exportDbToBackup();
      return res.json({ data: dbData });
    }

    const filePath = path.join(backupDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo de backup não encontrado' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    res.json({ data: JSON.parse(fileContent) });
  } catch (error) {
    console.error('Erro ao exportar/ler dados:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do banco/arquivo' });
  }
});

app.use('/api/v1', apiRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Express Server rodando na porta ${PORT}`);
});
