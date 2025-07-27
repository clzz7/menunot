import { config } from "./config";
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// ==================== RATE LIMITING ====================

// Rate limiting para tentativas de login
export const loginRateLimit = rateLimit({
  windowMs: config.LOGIN_RATE_LIMIT_WINDOW,
  max: config.LOGIN_RATE_LIMIT_MAX,
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: Math.ceil(config.LOGIN_RATE_LIMIT_WINDOW / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Removido keyGenerator personalizado - usar o padrão que trata IPv6 corretamente
});

export const adminRateLimit = rateLimit({
  windowMs: config.LOGIN_RATE_LIMIT_WINDOW,
  max: config.ADMIN_RATE_LIMIT_MAX,
  message: {
    error: 'Muitas requisições administrativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const publicRateLimit = rateLimit({
  windowMs: config.LOGIN_RATE_LIMIT_WINDOW,
  max: config.PUBLIC_RATE_LIMIT_MAX,
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ==================== VALIDAÇÃO DE SENHA ====================

export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  try {
    passwordSchema.parse(password);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        errors: error.errors.map(err => err.message) 
      };
    }
    return { isValid: false, errors: ['Erro na validação da senha'] };
  }
}

// ==================== LOGS DE SEGURANÇA ====================

interface SecurityLog {
  timestamp: Date;
  ip: string;
  userAgent: string;
  action: string;
  username?: string;
  success: boolean;
  details?: any;
}

class SecurityLogger {
  private logs: SecurityLog[] = [];
  private maxLogs = config.MAX_SECURITY_LOGS;

  log(req: Request, action: string, success: boolean, username?: string, details?: any) {
    if (!config.ENABLE_SECURITY_LOGS) return;

    const logEntry: SecurityLog = {
      timestamp: new Date(),
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      action,
      username,
      success,
      details
    };

    this.logs.push(logEntry);

    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console para desenvolvimento
    const logLevel = success ? 'INFO' : 'WARN';
    const logMessage = `[${logLevel}] ${action} - IP: ${logEntry.ip} - User: ${username || 'anonymous'} - Success: ${success}`;
    
    if (success) {
      console.log(logMessage);
    } else {
      console.warn(logMessage, details);
    }
  }

  // Função auxiliar para obter IP do cliente (trata IPv4 e IPv6)
  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(',')[0].trim();
    }
    
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'unknown';
  }

  logRequest(req: Request, res: Response, duration: number) {
    if (!config.ENABLE_SECURITY_LOGS) return;

    this.log(req, 'HTTP_REQUEST', res.statusCode < 400, undefined, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent')
    });
  }

  getRecentLogs(limit: number = 50): SecurityLog[] {
    return this.logs.slice(-limit).reverse();
  }

  getFailedLoginAttempts(timeWindow: number = 60 * 60 * 1000): SecurityLog[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.logs.filter(log => 
      log.action.includes('LOGIN') && 
      !log.success && 
      log.timestamp > cutoff
    );
  }

  getSuspiciousActivity(): SecurityLog[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => log.timestamp > oneHourAgo);
    
    // Agrupar por IP
    const ipActivity: { [ip: string]: SecurityLog[] } = {};
    recentLogs.forEach(log => {
      if (!ipActivity[log.ip]) {
        ipActivity[log.ip] = [];
      }
      ipActivity[log.ip].push(log);
    });

    // Detectar atividade suspeita
    const suspicious: SecurityLog[] = [];
    Object.entries(ipActivity).forEach(([ip, logs]) => {
      const failedLogins = logs.filter(log => 
        log.action.includes('LOGIN') && !log.success
      );
      
      // Mais de 3 tentativas de login falhadas
      if (failedLogins.length > 3) {
        suspicious.push(...failedLogins);
      }
      
      // Muitas requisições em pouco tempo (mais de 50 em 1 hora)
      if (logs.length > 50) {
        suspicious.push(...logs.slice(-10)); // Últimas 10 requisições
      }
    });

    return suspicious;
  }
}

export const securityLogger = new SecurityLogger();

// ==================== MIDDLEWARE DE LOGS ====================

export function logSecurityEvent(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const success = res.statusCode < 400;
      const username = (req as any).user?.username;
      
      securityLogger.log(req, action, success, username, {
        statusCode: res.statusCode,
        method: req.method,
        path: req.path
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

// ==================== TIMEOUT DE SESSÃO ====================

export function checkSessionTimeout(maxAge: number = config.SESSION_TIMEOUT) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extrair token do cookie em vez do header Authorization
    const token = req.cookies?.auth_token;
    
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const tokenAge = Date.now() - (decoded.iat * 1000);
        
        console.log('🕐 Debug - Token age:', tokenAge, 'Max age:', maxAge);
        
        if (tokenAge > maxAge) {
          securityLogger.log(req, 'SESSION_TIMEOUT', false, decoded.username);
          
          // Limpar o cookie expirado usando as configurações corretas
          res.clearCookie('auth_token', {
            httpOnly: config.COOKIE_HTTP_ONLY,
            secure: config.COOKIE_SECURE,
            sameSite: config.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none'
          });
          
          return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
        }
      } catch (error) {
        console.log('❌ Debug - Erro ao decodificar token:', error);
        // Token inválido, deixar o middleware de autenticação lidar com isso
      }
    }
    
    next();
  };
}

// ==================== HEADERS DE SEGURANÇA ====================

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar proteção XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Controlar referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy básico
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' ws: wss: https://api.mercadopago.com;"
  );
  
  next();
}

// ==================== DETECÇÃO DE FORÇA BRUTA ====================

const bruteForceAttempts: { [ip: string]: { count: number; lastAttempt: Date } } = {};

// Middleware específico para detecção de força bruta apenas em rotas de login
export function detectBruteForceLogin(req: Request, res: Response, next: NextFunction) {
  const ip = securityLogger['getClientIP'](req);
  const now = new Date();
  const windowMs = config.BRUTE_FORCE_WINDOW;
  const maxAttempts = config.BRUTE_FORCE_THRESHOLD;
  
  // Limpar tentativas antigas
  if (bruteForceAttempts[ip]) {
    const timeDiff = now.getTime() - bruteForceAttempts[ip].lastAttempt.getTime();
    if (timeDiff > windowMs) {
      delete bruteForceAttempts[ip];
    }
  }
  
  // Verificar se excedeu o limite
  if (bruteForceAttempts[ip] && bruteForceAttempts[ip].count >= maxAttempts) {
    securityLogger.log(req, 'BRUTE_FORCE_DETECTED', false, undefined, {
      ip,
      attempts: bruteForceAttempts[ip].count
    });
    
    return res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente mais tarde.',
      retryAfter: Math.ceil(windowMs / 1000 / 60)
    });
  }
  
  // Interceptar resposta para contar APENAS tentativas de login falhadas
  const originalSend = res.send;
  res.send = function(data) {
    // Só contar como tentativa de força bruta se:
    // 1. É uma rota de login (/api/auth/login)
    // 2. Retornou erro 401 (credenciais inválidas)
    // 3. Não é uma verificação de token ou outras operações
    if (req.path === '/api/auth/login' && res.statusCode === 401) {
      if (!bruteForceAttempts[ip]) {
        bruteForceAttempts[ip] = { count: 0, lastAttempt: now };
      }
      bruteForceAttempts[ip].count++;
      bruteForceAttempts[ip].lastAttempt = now;
      
      securityLogger.log(req, 'LOGIN_FAILED_ATTEMPT', false, undefined, {
        ip,
        attempts: bruteForceAttempts[ip].count,
        path: req.path
      });
    } else if (req.path === '/api/auth/login' && res.statusCode === 200) {
      // Login bem-sucedido, limpar tentativas
      delete bruteForceAttempts[ip];
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Middleware genérico para outras rotas (sem contagem de força bruta)
export function detectBruteForce(req: Request, res: Response, next: NextFunction) {
  // Este middleware não faz nada agora, mas pode ser usado para outros tipos de detecção
  next();
}