import { config } from "./config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { securityLogger, validatePasswordStrength, checkSessionTimeout } from "./security";

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

// ==================== SCHEMAS DE VALIDAÇÃO ====================

export const loginSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Password é obrigatório')
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(8, 'Password deve ter pelo menos 8 caracteres')
});

// ==================== FUNÇÕES JWT ====================

// Função para gerar JWT com configurações de segurança
export function generateToken(user: { id: number; username: string }): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Função para verificar JWT
export function verifyToken(token: string): { id: number; username: string; iat: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; iat: number };
    return decoded;
  } catch (error) {
    return null;
  }
}

// ==================== FUNÇÕES DE SENHA ====================

// Função para hash da senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Aumentado de 10 para 12 rounds para mais segurança
}

// Função para verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Função para validar força da senha
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  return validatePasswordStrength(password);
}

// ==================== MIDDLEWARES DE AUTENTICAÇÃO ====================

// Middleware de autenticação com logs de segurança
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // Extrair token do cookie em vez do header Authorization
  const token = req.cookies?.auth_token;

  console.log('🔍 Debug - Cookie auth_token:', token ? 'PRESENTE' : 'AUSENTE');
  console.log('🔍 Debug - Todos os cookies:', req.cookies);

  if (!token) {
    securityLogger.log(req, 'AUTH_MISSING_TOKEN', false);
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  const user = verifyToken(token);
  if (!user) {
    securityLogger.log(req, 'AUTH_INVALID_TOKEN', false);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }

  console.log('✅ Debug - Usuário autenticado:', user.username);
  req.user = user;
  securityLogger.log(req, 'AUTH_SUCCESS', true, user.username);
  next();
}

// Middleware para proteger rotas administrativas com timeout de sessão
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Verificar timeout de sessão primeiro
  const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '86400000'); // 24 horas
  checkSessionTimeout(sessionTimeout)(req, res, (err) => {
    if (err) return next(err);
    
    // Depois verificar autenticação
    return authenticateToken(req, res, next);
  });
}

// Middleware para verificar se usuário é admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    
    // Por enquanto, todos os usuários autenticados são admins
    // Futuramente pode ser expandido para verificar roles
    if (!req.user) {
      securityLogger.log(req, 'ADMIN_ACCESS_DENIED', false);
      return res.status(403).json({ error: 'Acesso negado. Privilégios de administrador requeridos.' });
    }
    
    securityLogger.log(req, 'ADMIN_ACCESS_GRANTED', true, req.user.username);
    next();
  });
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

// Validar dados de login
export function validateLoginData(data: any): { isValid: boolean; errors: string[] } {
  try {
    loginSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
      };
    }
    return { isValid: false, errors: ['Erro na validação dos dados'] };
  }
}

// Validar dados de criação de usuário
export function validateUserCreation(data: any): { isValid: boolean; errors: string[] } {
  try {
    createUserSchema.parse(data);
    
    // Validar força da senha
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
    
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
      };
    }
    return { isValid: false, errors: ['Erro na validação dos dados'] };
  }
}

// ==================== UTILITÁRIOS DE SEGURANÇA ====================

// Função para limpar dados sensíveis de logs
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  
  // Remover campos sensíveis
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.authorization;
  
  return sanitized;
}

// Função para gerar ID de sessão único
export function generateSessionId(): string {
  return jwt.sign(
    { sessionId: Math.random().toString(36).substring(2, 15) },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}