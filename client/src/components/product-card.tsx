import { Button } from "@/components/ui/button.js";
import { Plus, Wheat, Egg, Fish, ShellIcon } from "lucide-react";
import { Product } from "@shared/schema.js";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// Ícones de alérgenos baseados no produto
const allergenIcons = {
  gluten: Wheat,
  egg: Egg,
  fish: Fish,
  shellfish: ShellIcon,
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  // Detectar alérgenos baseado no nome/descrição do produto
  const detectAllergens = () => {
    const allergens = [];
    const text = `${product.name} ${product.description}`.toLowerCase();
    
    if (text.includes('camarão') || text.includes('crustáceo')) {
      allergens.push('shellfish');
    }
    if (text.includes('peixe') || text.includes('fish')) {
      allergens.push('fish');
    }
    if (text.includes('ovo') || text.includes('milanesa')) {
      allergens.push('egg');
    }
    if (text.includes('trigo') || text.includes('glúten') || text.includes('farinha')) {
      allergens.push('gluten');
    }
    
    return allergens;
  };

  const allergens = detectAllergens();

  return (
    <div 
      className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div className="flex h-36 sm:h-40">
        {/* Coluna da Imagem (40% da largura) */}
        <div className="w-2/5 flex-shrink-0 p-4">
          <div className="w-full h-full rounded-xl overflow-hidden">
            <img 
              src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Coluna de Texto (60% da largura) */}
        <div className="w-3/5 p-4 flex flex-col justify-between">
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
          
          {/* Parte inferior com ícones e botão */}
          <div className="flex items-center justify-between">
            {/* Ícones de Alérgenos */}
            <div className="flex items-center gap-2">
              {allergens.map((allergen) => {
                const IconComponent = allergenIcons[allergen as keyof typeof allergenIcons];
                return (
                  <div
                    key={allergen}
                    className="w-6 h-6 rounded-full border bg-white flex items-center justify-center"
                    style={{ borderColor: 'var(--card-accent)' }}
                  >
                    <IconComponent 
                      className="w-3 h-3" 
                      style={{ color: 'var(--card-accent)' }}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Botão de Adicionar */}
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
