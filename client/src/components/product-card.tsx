import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image (4:3 aspect ratio) */}
        <div className="w-full sm:w-32 h-24 flex-shrink-0">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <span className="text-lg font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(Number(product.price))}
            </span>
          </div>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
          )}
          
          {/* Product Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.preparationTime && (
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {product.preparationTime} min
                </span>
              )}
              <Badge variant={product.isAvailable ? "default" : "secondary"} className="bg-success text-white">
                {product.isAvailable ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className="bg-primary text-white hover:bg-orange-600 transition-colors"
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
