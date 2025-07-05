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
    <div className="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Product Image */}
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Product Tag */}
        {product.preparation_time && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">{product.preparation_time}</span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
        </div>
        
        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(Number(product.price))}
          </span>
          
          <Button 
            onClick={handleAddToCart}
            disabled={!product.is_active}
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 font-medium transition-colors"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
