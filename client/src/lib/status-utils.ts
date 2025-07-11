export interface StatusInfo {
  label: string;
  variant: "default" | "secondary" | "destructive" | "success" | "warning";
  className: string;
}

export const getStatusInfo = (status: string): StatusInfo => {
  // Normalize status to uppercase for consistency
  const normalizedStatus = status.toUpperCase();
  
  const statusMap: Record<string, StatusInfo> = {
    'PENDING': { 
      label: 'Pendente', 
      variant: 'secondary',
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    'CONFIRMED': { 
      label: 'Confirmado', 
      variant: 'default',
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    'PREPARING': { 
      label: 'Em Preparação', 
      variant: 'warning',
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    'READY': { 
      label: 'Pronto', 
      variant: 'success',
      className: 'bg-orange-200 text-orange-900 border-orange-300'
    },
    'OUT_DELIVERY': { 
      label: 'Saiu para Entrega', 
      variant: 'default',
      className: 'bg-orange-200 text-orange-900 border-orange-300'
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