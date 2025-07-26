export interface StatusInfo {
  label: string;
  variant: "default" | "secondary" | "destructive" | "success" | "warning";
  className: string;
}

export const getStatusInfo = (status: string): StatusInfo => {
  // Normalize status to uppercase for consistency
  const normalizedStatus = status.toUpperCase();
  
  const statusMap: Record<string, StatusInfo> = {
    PENDING: {
      label: 'Pendente',
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    CONFIRMED: {
      label: 'Confirmado',
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    PREPARING: {
      label: 'Preparando',
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    READY: {
      label: 'Pronto',
      className: 'bg-primary/20 text-primary border-primary/30'
    },
    OUT_DELIVERY: {
      label: 'Saiu para entrega',
      className: 'bg-primary/20 text-primary border-primary/30'
    },
    'DELIVERED': {
      label: 'Entregue',
      variant: 'success',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    'CANCELLED': {
      label: 'Cancelado',
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };
  
  return statusMap[normalizedStatus] || {
    label: status,
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  };
};

// Legacy function for backward compatibility
export const getStatusLabel = (status: string) => {
  const info = getStatusInfo(status);
  return {
    label: info.label,
    variant: info.variant === 'success' ? 'default' :
             info.variant === 'warning' ? 'default' :
             info.variant
  };
};

export const getStatusColor = (status: string) => {
  return getStatusInfo(status).className;
};