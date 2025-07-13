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
    <div className="product-card">
      {/* Imagem do produto - Proporção quadrada e maior */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={product.name} 
          className="product-card-image"
        />
      </div>
      
      {/* Conteúdo do card */}
      <div className="product-card-content">
        <div className="flex-grow">
          {/* Título do produto */}
          <h3 className="product-card-title">
            {product.name}
          </h3>
          
          {/* Descrição do produto */}
          {product.description && (
            <p className="product-card-description">
              {product.description}
            </p>
          )}
          
          {/* Preço */}
          <div className="product-card-price">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(Number(product.price))}
          </div>
        </div>
        
        {/* Botão de adicionar */}
        <div className="flex justify-end">
          <button 
            onClick={handleAddToCart}
            disabled={!product.is_active}
            className="product-card-button"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
