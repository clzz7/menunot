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

  const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];
  const heroImages = Array.isArray(products) ? products.filter((p: any) => p?.image).slice(0, 4) : [];

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        {/* Hero Section - editorial, sem gradientes clichês */}
        <section className="relative min-h-[80vh] flex items-center">
          <div className="absolute inset-0 bg-micro-grid pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
              {/* Hero Copy */}
              <div>
                <Badge className="mb-4 px-4 py-1 text-xs border-dashed border-2 border-primary/40 bg-transparent text-primary">
                  {establishment.name}
                </Badge>

                <TextReveal delay={0.3}>
                  <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                    Cozinha de autor para quem busca o extraordinário
                  </h1>
                </TextReveal>

                <TextReveal delay={0.6}>
                  <p className="mt-2 text-lg md:text-xl text-muted-foreground max-w-xl">
                    Uma casa de sabores pensada prato a prato, sem pressa, sem truques. Ingredientes de origem, técnica precisa e respeito ao tempo.
                  </p>
                </TextReveal>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  <Link href="/cardapio">
                    <Button 
                      size="lg"
                      className="px-7 py-6 text-base rounded-full border border-foreground/10 bg-foreground text-background hover:bg-foreground/90"
                    >
                      Reservar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/cardapio">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="px-7 py-6 text-base rounded-full border-foreground/20 hover:bg-foreground/[0.03]"
                    >
                      Ver Cardápio
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Avaliação 4.9</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Ter–Dom, 12h–23h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Centro</span>
                  </div>
                </div>
              </div>

              {/* Hero Collage - imagens com máscara em arco */}
              <div className="hero-collage grid grid-cols-2 gap-4 md:gap-6">
                {heroImages.length === 0 ? (
                  <div className="col-span-2 h-64 md:h-[420px] bg-muted/50 rounded-3xl border border-foreground/10 flex items-center justify-center text-muted-foreground">
                    Imagens do cardápio em breve
                  </div>
                ) : (
                  heroImages.map((p: any, idx: number) => (
                    <div key={p.id || idx} className={`photo-tile ${idx % 3 === 0 ? 'col-span-2 h-52 md:h-64' : 'h-36 md:h-44'}`}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Marquee sutil com manifesto */}
            <div className="mt-6 md:mt-10 border-y border-foreground/10 py-3 overflow-hidden">
              <div className="marquee whitespace-nowrap text-sm tracking-wide">
                <span className="mr-8">Ingredientes de origem</span>
                <span className="mr-8">Fogo controlado</span>
                <span className="mr-8">Técnica, não truque</span>
                <span className="mr-8">Carta de vinhos autoral</span>
                <span className="mr-8">Atendimento de sala</span>
                <span className="mr-8">Cozinha aberta</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tríade de valor – editorial minimalista */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: <Leaf className="w-6 h-6" />, 
                  title: "Origem e Estação",
                  description: "Produtos frescos de pequenos produtores, colheita pensada para o menu."
                },
                {
                  icon: <ChefHat className="w-6 h-6" />, 
                  title: "Técnica e Precisão",
                  description: "Execução cirúrgica: menos pirotecnia, mais sabor e textura no ponto."
                },
                {
                  icon: <Award className="w-6 h-6" />, 
                  title: "Sala e Ritual",
                  description: "Ritmo de serviço que respeita a conversa e o apetite de cada mesa."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="note-card h-full border border-foreground/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Destaques do Cardápio – sem vidro/gradiente, foco no produto */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <TextReveal>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Pratos em destaque
                  </h2>
                </TextReveal>
                <p className="text-muted-foreground mt-2">Seleção que muda conforme a estação</p>
              </div>
              <Link href="/cardapio">
                <Button variant="outline" className="rounded-full">Ver tudo</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden border border-foreground/10 rounded-2xl group">
                    {product.image && (
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-lg font-semibold leading-snug max-w-[75%]">{product.name}</h3>
                        <span className="text-base font-semibold">R$ {product.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <Link href="/cardapio">
                        <Button className="w-full rounded-full" variant="outline">
                          Ver detalhes
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter discreta */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto border border-foreground/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold">Receba o menu da semana</h3>
                <p className="text-muted-foreground mt-1">Uma mensagem, uma vez por semana. Sem spam.</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex-1 flex gap-2">
                <Input 
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                <Button type="submit" className="h-12 px-6">Assinar</Button>
              </form>
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