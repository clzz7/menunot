/**
 * Utility functions for currency formatting
 */

export const formatCurrency = (value: number | string | undefined | null): string => {
  // Handle undefined, null values
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  
  // Convert to number more carefully
  let numValue: number;
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return 'R$ 0,00';
    }
    numValue = parseFloat(value);
  } else {
    numValue = Number(value);
  }
  
  // Handle NaN and invalid numbers
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }
  
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