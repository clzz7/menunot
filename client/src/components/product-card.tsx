import { Button } from "@/components/ui/button.js";
import { Plus } from "lucide-react";
import { Product } from "@shared/schema.js";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0 bg-gray-50">
      <div className="flex py-4 px-4">
        {/* Coluna da Imagem (40% da largura) */}
        <div className="w-2/5 flex-shrink-0 pr-4">
          <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden">
            <img 
              src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Coluna de Texto (60% da largura) */}
        <div className="w-3/5 pl-4 flex flex-col justify-between min-h-32 sm:min-h-36">
          <div className="flex-1">
            {/* Título do Prato */}
            <h3 
              className="font-bold text-lg mb-2 leading-tight"
              style={{ color: 'var(--card-title)' }}
            >
              {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
            </h3>
            
            {/* Linha de Preço e Código */}
            <div className="flex items-center gap-3 mb-2">
              <span 
                className="text-base font-semibold"
                style={{ color: 'var(--card-secondary)' }}
              >
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(Number(product.price))}
              </span>
              <span 
                className="text-sm"
                style={{ color: 'var(--card-secondary)' }}
              >
                Cód: {product.id}
              </span>
            </div>
            
            {/* Descrição do Prato */}
            {product.description && (
              <p 
                className="text-sm mb-3 line-clamp-2"
                style={{ color: 'var(--card-secondary)' }}
              >
                {product.description}
              </p>
            )}
          </div>
          
          {/* Botão de Adicionar */}
          <div className="flex justify-end mt-auto">
            <Button 
              onClick={handleAddToCart}
              disabled={!product.is_active}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
