import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { UtensilsCrossed, Package, Clock, Star, ArrowRight, Phone, MapPin, Globe } from "lucide-react";
import { api } from "@/lib/api.js";
import { Establishment } from "@shared/schema.js";

export default function Home() {
  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: api.categories.getAll
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  // Get featured products (first 3 products)
  const featuredProducts = products.slice(0, 3);

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative w-full text-white py-20 flex items-center justify-center text-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=60)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center mb-6">
              {establishment.logo && (
                <img 
                  src={establishment.logo}
                  alt={`Logo ${establishment.name}`}
                  className="h-20 w-20 rounded-full object-cover mr-4 shadow-lg ring-2 ring-white"
                />
              )}
              <h1 className="text-4xl md:text-6xl font-bold">
                {establishment.name}
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {establishment.description || "Sabores únicos e experiências inesquecíveis"}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cardapio">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <UtensilsCrossed className="w-5 h-5 mr-2" />
                  Ver Cardápio
                </Button>
              </Link>
              <Link href="/pedidos">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Package className="w-5 h-5 mr-2" />
                  Meus Pedidos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`h-3 w-3 rounded-full ${establishment.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-lg font-medium ${establishment.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                {establishment.isOpen ? 'Aberto agora' : 'Fechado'}
              </span>
            </div>
            <p className="text-gray-600">
              {establishment.isOpen ? 'Estamos prontos para receber seu pedido!' : 'Voltamos em breve para atendê-lo!'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Produtos em Destaque</h2>
            <p className="text-gray-600">Conheça alguns dos nossos produtos mais populares</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </span>
                    <Badge variant="secondary">
                      {product.preparationTime}min
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/cardapio">
              <Button size="lg" className="bg-primary hover:bg-orange-600">
                Ver Todos os Produtos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossas Categorias</h2>
            <p className="text-gray-600">Explore nossa variedade de produtos</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category: any) => (
              <Link key={category.id} href="/cardapio">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UtensilsCrossed className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <p className="text-gray-600">Acesse rapidamente suas funcionalidades favoritas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/cardapio">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Fazer Pedido</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Explore nosso cardápio e faça seu pedido</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pedidos">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Meus Pedidos</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Veja o histórico dos seus pedidos</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/rastreamento">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Rastreamento</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Acompanhe seu pedido em tempo real</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Informações de Contato</h2>
            <p className="text-gray-600">Entre em contato conosco</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600">{establishment.phone}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Endereço</h3>
              <p className="text-gray-600">{establishment.address}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Horário de Funcionamento</h3>
              <p className="text-gray-600">
                {establishment.openingHours ? 
                  Object.entries(establishment.openingHours).map(([day, hours]: [string, any]) => (
                    <span key={day} className="block text-sm">
                      {day}: {hours.open} - {hours.close}
                    </span>
                  ))
                  : "Consulte nossos horários"
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
