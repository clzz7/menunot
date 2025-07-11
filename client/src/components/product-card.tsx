import { Button } from "@/components/ui/button.js";
import { Plus, Tag, Sparkles, Leaf } from "lucide-react";
import { Product } from "@shared/schema.js";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  // Determine badges based on product properties
  const getBadges = () => {
    const badges = [];
    
    // Mock logic for demonstration - in real app, these would be product properties
    if (product.id === "1" || product.id === "2") {
      badges.push({ type: "novidade", text: "NOVIDADE", icon: Sparkles });
    }
    
    if (product.id === "3" || product.id === "4") {
      badges.push({ type: "promocao", text: "PROMOÇÃO", icon: Tag });
    }
    
    if (product.name.toLowerCase().includes("veggie") || product.name.toLowerCase().includes("vegetariano")) {
      badges.push({ type: "vegetariano", text: "VEGETARIANO", icon: Leaf });
    }
    
    return badges;
  };

  const badges = getBadges();

  return (
    <div className="border-b border-gray-200 last:border-b-0 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
      <div className="flex py-4 px-4">
        {/* Coluna da Imagem (40% da largura) */}
        <div className="w-2/5 flex-shrink-0 pr-4">
          <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden relative">
            <img 
              src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {/* Badges overlay */}
            {badges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        badge.type === "novidade" ? "bg-red-500 text-white" :
                        badge.type === "promocao" ? "bg-green-500 text-white" :
                        badge.type === "vegetariano" ? "bg-green-100 text-green-800" :
                        "bg-gray-500 text-white"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {badge.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Coluna de Texto (60% da largura) */}
        <div className="w-3/5 pl-4 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {/* Título do Prato */}
              <h3 
                className="font-bold text-lg mb-1 leading-tight"
                style={{ color: 'var(--card-title)' }}
              >
                {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
              </h3>
              
              {/* Linha de Preço e Código */}
              <div className="flex items-center gap-3">
                <span 
                  className="text-lg font-bold"
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
            </div>
            
            {/* Botão redondo pequeno */}
            <Button 
              onClick={handleAddToCart}
              disabled={!product.is_active}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 ml-4 flex-shrink-0 transition-colors"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Descrição do Prato */}
          {product.description && (
            <p 
              className="text-sm line-clamp-2"
              style={{ color: 'var(--card-secondary)' }}
            >
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
