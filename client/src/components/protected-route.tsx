import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth.js";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card.js";
import { Lock, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-4" />
            <p className="text-gray-600">Verificando autenticação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Lock className="w-8 h-8 text-red-600 mb-4" />
            <p className="text-gray-600">Redirecionando para login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}