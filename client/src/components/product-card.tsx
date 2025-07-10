import { Button } from "@/components/ui/button.js";
import { Clock, Plus } from "lucide-react";
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
    <div className="product-card bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="flex">
        {/* Product Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 leading-tight">
              {product.name}
            </h3>
            
            {/* Price and Code */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm sm:text-base font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(Number(product.price))}
              </span>
              {product.id && (
                <span className="text-xs text-gray-500">
                  Cód: {product.id}
                </span>
              )}
            </div>
            
            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
                {product.description}
              </p>
            )}
            
            {/* Time indicator */}
            {product.preparation_time && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <Clock className="w-3 h-3" />
                <span>{product.preparation_time}</span>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleAddToCart}
              disabled={!product.is_active}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-1 text-sm font-medium transition-colors"
              size="sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
