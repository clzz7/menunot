import { Button } from "@/components/ui/button.js";
import { Plus } from "lucide-react";
import { Product } from "@shared/schema.js";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  variant?: "grid" | "list";
}

export function ProductCard({ product, onAddToCart, variant = "list" }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  if (variant === "grid") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
        {/* Imagem */}
        <div className="w-full h-48 md:h-56 lg:h-64 relative overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Conteúdo */}
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg md:text-xl mb-2 leading-tight text-gray-900 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(Number(product.price))}
                </span>
                <span className="text-sm text-gray-500">
                  Cód: {product.id}
                </span>
              </div>
            </div>
          </div>
          
          {/* Descrição */}
          {product.description && (
            <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Botão */}
          <Button 
            onClick={handleAddToCart}
            disabled={!product.is_active}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-200 hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    );
  }

  // Layout list (mobile-first)
  return (
    <div className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50 transition-all duration-200">
      <div className="flex py-4 px-4">
        {/* Coluna da Imagem */}
        <div className="w-2/5 flex-shrink-0 pr-4">
          <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden">
            <img 
              src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Coluna de Texto */}
        <div className="w-3/5 pl-4 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 leading-tight text-gray-900">
                {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
              </h3>
              
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(Number(product.price))}
                </span>
                <span className="text-sm text-gray-500">
                  Cód: {product.id}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              disabled={!product.is_active}
              className="bg-primary hover:bg-primary/90 text-white rounded-full p-2 ml-4 flex-shrink-0 transition-colors"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {product.description && (
            <p className="text-sm line-clamp-2 text-gray-600">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
