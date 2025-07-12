import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Card } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Input } from "@/components/ui/input.js";
import { CartSidebar } from "@/components/cart-sidebar.js";
import { api } from "@/lib/api.js";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart.js";
import { 
  ShoppingBag, Star, Clock, MapPin, ChefHat, Leaf, 
  Wine, Award, Users, Calendar, ArrowRight, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { cart, updateQuantity, removeFromCart, isCartAnimating } = useCart();
  
  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll
  });

  // Get featured products (first 6)
  const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
  };

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 hero-pattern opacity-50"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="mb-4 px-6 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Experiência Gastronômica Única
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              {establishment.name}: Onde a<br />
              <span className="text-gradient">Tradição Encontra a Inovação</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Experimente a arte culinária onde cada prato conta uma história de paixão e criatividade
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/cardapio">
                <Button 
                  size="lg" 
                  className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full"
                >
                  Reserve Sua Mesa
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/cardapio">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/5 px-8 py-6 text-lg rounded-full"
                >
                  Explorar Cardápio
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por Que Escolher <span className="text-gradient">Culinária Artesanal?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma experiência gastronômica que transcende o comum
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "Ingredientes Selecionados",
                description: "Ingredientes frescos e orgânicos de produtores locais cuidadosamente escolhidos"
              },
              {
                icon: <ChefHat className="w-8 h-8" />,
                title: "Chefs Mestres",
                description: "Equipe de chefs renomados com experiência internacional e paixão pela arte"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Experiência Única",
                description: "Ambiente intimista e serviço personalizado que torna cada visita memorável"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-8 h-full card-hover">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Destaques do <span className="text-gradient">Nosso Menu</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pratos cuidadosamente elaborados para despertar seus sentidos
            </p>
          </motion.div>

          {/* Responsive Grid for Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="glass-card overflow-hidden card-hover group h-full">
                  {/* Product Image */}
                  <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                    <img 
                      src={product.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Price Badge - Visible on hover */}
                    <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(product.price))}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-2 flex-grow">
                          {product.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Desktop: Show price and button | Mobile: Show button only */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4 md:hidden">
                        <span className="text-gradient text-xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(Number(product.price))}
                        </span>
                      </div>
                      
                      <Link href="/cardapio">
                        <Button className="w-full rounded-full hover:shadow-lg transition-all duration-300 group/btn">
                          <span className="group-hover/btn:scale-105 transition-transform">
                            Ver Detalhes
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/cardapio">
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-full px-8 py-6 text-lg hover:shadow-xl transition-all duration-300"
              >
                Ver Menu Completo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                A Experiência <span className="text-gradient">{establishment.name}</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Descubra uma jornada culinária onde cada detalhe é pensado para criar momentos inesquecíveis.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Wine />, text: "Carta de vinhos selecionados por sommeliers" },
                  { icon: <Users />, text: "Chef's Table - Experiência exclusiva" },
                  { icon: <Calendar />, text: "Eventos privados e celebrações especiais" },
                  { icon: <Clock />, text: "Menu sazonal com ingredientes frescos" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <span className="text-lg">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <Button size="lg" className="rounded-full px-8">
                Fazer Reserva
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <Card className="glass-card p-8">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Star className="w-12 h-12 fill-current" />
                    </div>
                    <h3 className="text-3xl font-bold">4.9/5.0</h3>
                    <p className="text-muted-foreground">Avaliação média</p>
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baseado em mais de 2.000 avaliações
                    </p>
                  </div>
                </Card>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Fique Por Dentro das <span className="text-gradient">Novidades</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Receba em primeira mão nosso menu sazonal e eventos exclusivos
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full px-6"
                  required
                />
                <Button type="submit" className="rounded-full px-8">
                  Inscrever
                </Button>
              </div>
            </form>
            
            <p className="text-sm text-muted-foreground">
              Prometemos enviar apenas conteúdo relevante e delicioso!
            </p>
          </motion.div>
        </div>
      </section>



      {/* Cart Sidebar */}
      <CartSidebar
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Floating Cart Button */}
      {cart.items.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`fixed bottom-8 right-8 bg-primary text-primary-foreground rounded-full p-4 shadow-2xl z-50 btn-glow transition-all duration-300 ${
            isCartAnimating ? 'cart-shake' : ''
          }`}
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
          </span>
        </motion.button>
      )}
    </div>
  );
}

export default Home;