import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.js";
import { Alert, AlertDescription } from "@/components/ui/alert.js";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  User, 
  Globe,
  RefreshCw,
  Eye,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast.js";

interface SecurityLog {
  timestamp: string;
  ip: string;
  userAgent: string;
  action: string;
  username?: string;
  success: boolean;
  details?: any;
}

interface SuspiciousActivity {
  timestamp: string;
  ip: string;
  action: string;
  username?: string;
  success: boolean;
  details?: any;
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [suspicious, setSuspicious] = useState<SuspiciousActivity[]>([]);
  const [failedLogins, setFailedLogins] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      
      const [logsRes, suspiciousRes, failedRes] = await Promise.all([
        fetch('/api/security/logs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/security/suspicious', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/security/failed-logins', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (suspiciousRes.ok) {
        const suspiciousData = await suspiciousRes.json();
        setSuspicious(suspiciousData.suspicious || []);
      }

      if (failedRes.ok) {
        const failedData = await failedRes.json();
        setFailedLogins(failedData.failedLogins || []);
      }

    } catch (error) {
      console.error('Erro ao buscar dados de segurança:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de segurança",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getActionBadgeVariant = (action: string, success: boolean) => {
    if (!success) return "destructive";
    if (action.includes('LOGIN')) return "default";
    if (action.includes('ADMIN')) return "secondary";
    return "outline";
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4" />;
    if (action.includes('ADMIN')) return <Shield className="h-4 w-4" />;
    if (action.includes('AUTH')) return <Lock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Segurança</h1>
          <p className="text-muted-foreground">
            Monitore a segurança e atividade do sistema
          </p>
        </div>
        <Button onClick={fetchSecurityData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Suspeita</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{suspicious.length}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Falhados</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{failedLogins.length}</div>
            <p className="text-xs text-muted-foreground">
              Última hora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Seguro</div>
            <p className="text-xs text-muted-foreground">
              Sistema protegido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Segurança */}
      {suspicious.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            <strong>Atenção:</strong> Detectada atividade suspeita. 
            Verifique a aba "Atividade Suspeita" para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {failedLogins.length >= 3 && (
        <Alert className="border-red-200 bg-red-50">
          <Shield className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Alerta:</strong> Múltiplas tentativas de login falhadas detectadas. 
            Possível tentativa de ataque.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs com Dados de Segurança */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Logs de Segurança
          </TabsTrigger>
          <TabsTrigger value="suspicious">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Atividade Suspeita ({suspicious.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            <Shield className="h-4 w-4 mr-2" />
            Logins Falhados ({failedLogins.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Segurança Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum log encontrado
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(log.action)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getActionBadgeVariant(log.action, log.success)}>
                              {log.action}
                            </Badge>
                            {log.username && (
                              <span className="text-sm text-muted-foreground">
                                {log.username}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{log.ip}</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? "Sucesso" : "Falha"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Suspeita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {suspicious.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma atividade suspeita detectada
                    </p>
                  </div>
                ) : (
                  suspicious.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">
                              {activity.action}
                            </Badge>
                            {activity.username && (
                              <span className="text-sm text-muted-foreground">
                                {activity.username}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{activity.ip}</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        Suspeito
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Tentativas de Login Falhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {failedLogins.length === 0 ? (
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma tentativa de login falhada recente
                    </p>
                  </div>
                ) : (
                  failedLogins.map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-red-500" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">
                              LOGIN_FAILED
                            </Badge>
                            {login.username && (
                              <span className="text-sm text-muted-foreground">
                                {login.username}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{login.ip}</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(login.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        Falha
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}