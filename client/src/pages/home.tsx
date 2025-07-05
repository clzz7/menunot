import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.js";
import { Card } from "@/components/ui/card.js";
import { UtensilsCrossed, Package, Star, Clock } from "lucide-react";
import { api } from "@/lib/api.js";
import { useCart } from "@/hooks/use-cart.js";
import { CartSidebar } from "@/components/cart-sidebar.js";
import { useState } from "react";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart } = useCart();
  
  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  // Get featured products (first 3)
  const featuredProducts = Array.isArray(products) ? products.slice(0, 3) : [];

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Content */}
              <div className="p-12 lg:p-16 flex flex-col justify-center">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
                  Comida saudável e deliciosa.
                </h1>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center">
                    <span className="text-xl font-semibold mr-2">4.7</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-600">3.2k+ Avaliações</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/cardapio">
                    <Button 
                      size="lg" 
                      className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg font-medium"
                    >
                      Fazer pedido
                    </Button>
                  </Link>
                  <Link href="/pedidos">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-2 border-gray-300 rounded-full px-8 py-6 text-lg font-medium hover:bg-gray-50"
                    >
                      Meus pedidos
                    </Button>
                  </Link>
                </div>

                {/* Testimonial */}
                <Card className="bg-gray-50 border-0 p-6">
                  <p className="text-gray-700 mb-4 italic">
                    "A comida é simplesmente incrível! O sabor é perfeito e a entrega sempre rápida. 
                    Com certeza o melhor restaurante da região!"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" 
                      alt="Maria" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">Maria Silva</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Image */}
              <div className="relative h-[400px] lg:h-auto">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
                  alt="Delicious food"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Bar */}
      <section className="bg-white/80 backdrop-blur-sm py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${establishment.is_open ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className={`font-medium ${establishment.is_open ? 'text-green-600' : 'text-red-600'}`}>
                {establishment.is_open ? 'Aberto agora' : 'Fechado'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Entrega: 30-45 min
              </span>
              <span>•</span>
              <span>Taxa: R$ {establishment.delivery_fee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Mais pedidos
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(product.price))}
                      </span>
                      <Link href="/cardapio">
                        <Button className="bg-black text-white hover:bg-gray-800 rounded-full">
                          Ver cardápio
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Ingredientes frescos</h3>
              <p className="text-gray-600">Selecionamos os melhores ingredientes diariamente</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Entrega rápida</h3>
              <p className="text-gray-600">Seu pedido quentinho em até 45 minutos</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Embalagem segura</h3>
              <p className="text-gray-600">Cuidado especial para manter a qualidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">{establishment.name}</h3>
              <p className="text-gray-400">{establishment.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/cardapio" className="text-gray-400 hover:text-white transition-colors">
                    Cardápio
                  </Link>
                </li>
                <li>
                  <Link href="/pedidos" className="text-gray-400 hover:text-white transition-colors">
                    Meus pedidos
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <p className="text-gray-400">
                {establishment.phone}<br />
                {establishment.email}<br />
                {establishment.address}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {establishment.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = '/carrinho';
        }}
      />
    </div>
  );
}