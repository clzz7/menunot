import 'dotenv/config';
import { config, validateConfig } from "./config";
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, publicRateLimit, securityLogger } from "./security";

// Validar configurações na inicialização
validateConfig();

const app = express();
const PORT = 5000;

// Configurar proxy para obter IP real
app.set('trust proxy', 1);

// Aplicar headers de segurança globalmente
app.use(securityHeaders);

// Rate limiting público
app.use(publicRateLimit);

// Configurar cookie parser
app.use(cookieParser());

// Configurar parsing com limites de segurança
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging com segurança
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(body) {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // Log de segurança para rotas sensíveis
    if (req.url.includes('/api/auth') || req.url.includes('/api/admin')) {
      securityLogger.logRequest(req, res, duration);
    }
    
    log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Registrar rotas e inicializar WebSocket
registerRoutes(app).then((server) => {
  if (config.NODE_ENV === "development") {
    setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Tratamento de erros global com logs de segurança
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    
    // Log de erro de segurança
    securityLogger.log(req, 'SERVER_ERROR', false, undefined, {
      error: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: "Erro interno do servidor",
      ...(config.NODE_ENV === 'development' && { details: err.message })
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    const mode = config.NODE_ENV === "development" ? "desenvolvimento" : "produção";
    log(`Servidor rodando na porta ${PORT} em modo ${mode}`);
    log(`WebSocket disponível em ws://localhost:${PORT}/api/ws`);
    
    // Logs de inicialização de segurança
    console.log("🔒 Configurações de segurança ativadas:");
    console.log("  ✓ Headers de segurança aplicados");
    console.log("  ✓ Rate limiting configurado");
    console.log("  ✓ Logs de segurança habilitados");
    console.log("  ✓ WebSocket isolado do Vite HMR");
  });
});
