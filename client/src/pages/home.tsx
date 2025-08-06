import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button.js";
import { Card } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Input } from "@/components/ui/input.js";
import { CartSidebar } from "@/components/cart-sidebar.js";
import TextReveal from "@/components/text-reveal.js";
import { api } from "@/lib/api.js";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart.js";
import { 
  ShoppingBag, Star, Clock, MapPin, ChefHat, Leaf, 
  Wine, Award, Users, Calendar, ArrowRight, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";
import { ReactLenis } from "lenis/react";

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
    <ReactLenis root>
      <div className="min-h-screen bg-background overflow-x-hidden" style={{ paddingTop: '5rem' }}>
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
              
              <TextReveal delay={0.5}>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground">
                  {establishment.name}: Onde a<br />
                  <span className="text-highlight">Tradição Encontra a Inovação</span>
                </h1>
              </TextReveal>
              
              <TextReveal delay={0.8}>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Experimente a arte culinária onde cada prato conta uma história de paixão e criatividade
                </p>
              </TextReveal>
              
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
            <div className="text-center mb-16">
              <TextReveal>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Por Que Escolher <span className="text-highlight">Culinária Artesanal?</span>
                </h2>
              </TextReveal>
              <TextReveal delay={0.2}>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Uma experiência gastronômica que transcende o comum
                </p>
              </TextReveal>
            </div>

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
                    <TextReveal delay={index * 0.1}>
                      <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                    </TextReveal>
                    <TextReveal delay={index * 0.1 + 0.2}>
                      <p className="text-muted-foreground">{item.description}</p>
                    </TextReveal>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Highlights */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <TextReveal>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Destaques do <span className="text-highlight">Nosso Cardápio</span>
                </h2>
              </TextReveal>
              <TextReveal delay={0.2}>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Pratos cuidadosamente elaborados pelos nossos chefs
                </p>
              </TextReveal>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-card overflow-hidden card-hover group">
                    {product.imageUrl && (
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                        <span className="text-highlight text-xl font-bold">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <Link href="/cardapio">
                        <Button className="w-full rounded-full">
                          Ver Detalhes
                        </Button>
                      </Link>
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
                  className="rounded-full px-8"
                >
                  Ver Menu Completo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />
      </div>
    </ReactLenis>
  );
}

export default Home;