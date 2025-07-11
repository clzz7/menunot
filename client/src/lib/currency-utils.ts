/**
 * Utility functions for currency formatting
 */

export const formatCurrency = (value: number | string | undefined | null): string => {
  // Handle undefined, null, empty string, or NaN values
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return 'R$ 0,00';
  }
  
  const numValue = Number(value);
  
  // Handle negative numbers
  if (numValue < 0) {
    return '-' + new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(numValue));
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and convert to number
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR').format(Number(value));
};