import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.js";
import { Alert, AlertDescription } from "@/components/ui/alert.js";
import { Progress } from "@/components/ui/progress.js";
import { useToast } from "@/hooks/use-toast.js";
import { useAuth } from "@/hooks/use-auth.js";
import { Lock, User, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Password é obrigatório")
});

const setupSchema = z.object({
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

type LoginForm = z.infer<typeof loginSchema>;
type SetupForm = z.infer<typeof setupSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const setupForm = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  // Função para calcular força da senha
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    return Math.min(strength, 100);
  };

  // Função para obter cor da força da senha
  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Função para obter texto da força da senha
  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 40) return "Fraca";
    if (strength < 70) return "Média";
    return "Forte";
  };

  const onPasswordChange = (password: string) => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.username}!`,
        });
        // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
      } else {
        setError(data.error || "Erro ao fazer login");
        toast({
          title: "Erro no login",
          description: data.error || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Erro de conexão. Tente novamente.");
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSetupSubmit = async (data: SetupForm) => {
    setIsLoading(true);
    setSecurityAlerts([]);

    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          username: data.username,
          password: data.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          setSecurityAlerts(result.details);
        }
        throw new Error(result.error || "Erro na configuração");
      }

      toast({
        title: "Usuário admin criado com sucesso!",
        description: "Agora você pode fazer login com suas credenciais"
      });
      setIsSetupMode(false);
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        title: "Erro na configuração",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSetupNeeded = async () => {
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ username: "test", password: "test" }),
      });

      if (response.status === 400) {
        const result = await response.json();
        if (result.error === "Sistema já foi configurado") {
          setIsSetupMode(false);
        }
      }
    } catch (error) {
      // Se der erro, assumir que precisa de setup
      setIsSetupMode(true);
    }
  };

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSetupMode ? "Configuração Inicial" : "Login Administrativo"}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {isSetupMode 
              ? "Configure o primeiro usuário administrador" 
              : "Acesse o painel administrativo"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mostrar erro se houver */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Alertas de Segurança */}
          {securityAlerts.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {securityAlerts.map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isSetupMode ? (
            <Form {...setupForm}>
              <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-4">
                <FormField
                  control={setupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Digite o username"
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite a senha"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            onChange={(e) => {
                              field.onChange(e);
                              onPasswordChange(e.target.value);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {field.value && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Força da senha:</span>
                            <span className={`font-medium ${
                              passwordStrength < 40 ? 'text-red-500' :
                              passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <Progress 
                            value={passwordStrength} 
                            className="h-2"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme a senha"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Configurando..." : "Configurar Sistema"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSetupMode(false)}
                  disabled={isLoading}
                >
                  Já tenho uma conta
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Digite seu username"
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="pl-10 pr-10"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSetupMode(true)}
                  disabled={isLoading}
                >
                  Configuração Inicial
                </Button>
              </form>
            </Form>
          )}

          {/* Informações de Segurança */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Segurança Ativada</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Rate limiting ativo</li>
              <li>• Detecção de brute force</li>
              <li>• Logs de segurança habilitados</li>
              <li>• Validação de senha forte</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}