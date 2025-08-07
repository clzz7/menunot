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
  const heroImages = Array.isArray(products) ? products.slice(0, 4) : [];

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
        {/* Hero Section - editorial, assimétrico e com formas personalizadas */}
        <section className="relative min-h-[82vh] flex items-center">
          <div className="absolute inset-0 bg-micro-grid pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
              {/* Hero Copy */}
              <div className="md:col-span-6">
                <Badge className="mb-4 px-4 py-1 text-xs border-dashed border-2 border-primary/40 bg-transparent text-primary rounded-full">
                  {establishment.name}
                </Badge>

                <TextReveal delay={0.3}>
                  <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                    Cozinha de autor para quem busca o extraordinário
                  </h1>
                </TextReveal>

                <TextReveal delay={0.6}>
                  <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl">
                    Uma casa de sabores pensada prato a prato, sem pressa, sem truques. Ingredientes de origem, técnica precisa e respeito ao tempo.
                  </p>
                </TextReveal>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
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

                <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
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

              {/* Hero Collage – assimétrica com clip-path e leve rotação */}
              <div className="md:col-span-6">
                {heroImages.length === 0 ? (
                  <div className="h-64 md:h-[460px] bg-muted/50 rounded-3xl border border-foreground/10 flex items-center justify-center text-muted-foreground">
                    Imagens do cardápio em breve
                  </div>
                ) : (
                  <div className="relative grid grid-cols-12 gap-4 md:gap-6">
                    {/* Peça principal */}
                    <div className="col-span-12 sm:col-span-8 relative">
                      <div className="photo-tile clip-diagonal tilt-right h-56 md:h-[360px]">
                        <img src={heroImages[0]?.imageUrl} alt={heroImages[0]?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-4 -left-4 hidden sm:block">
                        <div className="badge-shadow rounded-full px-3 py-1 text-xs bg-background border border-foreground/10">
                          {heroImages[0]?.name}
                        </div>
                      </div>
                    </div>

                    {/* Pilha lateral */}
                    <div className="col-span-12 sm:col-span-4 flex flex-col gap-4 md:gap-6">
                      <div className="photo-tile clip-arch tilt-left h-40 md:h-[170px] -mt-6 sm:mt-0">
                        <img src={heroImages[1]?.imageUrl} alt={heroImages[1]?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="photo-tile clip-hex tilt-right h-40 md:h-[170px]">
                        <img src={heroImages[2]?.imageUrl} alt={heroImages[2]?.name} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Tile inferior amplo */}
                    <div className="col-span-12 sm:col-span-8 sm:ml-auto">
                      <div className="photo-tile clip-slope tilt-right h-40 md:h-[140px]">
                        <img src={heroImages[3]?.imageUrl || heroImages[0]?.imageUrl} alt={heroImages[3]?.name || heroImages[0]?.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Marquee sutil com manifesto */}
            <div className="mt-10 md:mt-14 border-y border-foreground/10 py-3 overflow-hidden">
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

        {/* Seção de valor – mosaico assimétrico */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">
              {/* Editorial card grande */}
              <motion.div 
                className="md:col-span-7"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative note-card h-full border border-foreground/10 rounded-2xl p-6 md:p-8 overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-accent/5" />
                  <div className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-primary/5" />
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                    A assinatura da casa
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-prose">
                    Cozinha de autor com técnica e precisão, aliando ingredientes sazonais a métodos clássicos. Um percurso que respeita o tempo da mesa e a conversa.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[{
                      icon: <Leaf className="w-5 h-5" />,
                      title: "Origem e Estação",
                      description: "Produtos frescos de pequenos produtores"
                    }, {
                      icon: <ChefHat className="w-5 h-5" />,
                      title: "Técnica e Precisão",
                      description: "Execução cirúrgica, sabor no ponto"
                    }, {
                      icon: <Award className="w-5 h-5" />,
                      title: "Sala e Ritual",
                      description: "Ritmo que respeita cada mesa"
                    }].map((item, idx) => (
                      <div key={idx} className="border border-foreground/10 rounded-xl p-4 hover:bg-foreground/[0.02] transition-colors">
                        <div className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center mb-3">
                          {item.icon}
                        </div>
                        <div className="font-semibold mb-1">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Cartões menores empilhados */}
              <div className="md:col-span-5 grid grid-rows-2 gap-6 md:gap-8">
                {[0,1].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                    viewport={{ once: true }}
                    className={i === 0 ? "tilt-right" : "tilt-left"}
                  >
                    <div className="note-card h-full border border-foreground/10 rounded-2xl p-6 flex items-center justify-between gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">{i === 0 ? 'Menu de estação' : 'Carta de vinhos'}</div>
                        <div className="text-xl font-semibold">{i === 0 ? 'Sabores que mudam com o tempo' : 'Seleção autoral, serviço à taça'}</div>
                      </div>
                      <div className={`w-20 h-20 shrink-0 photo-tile ${i === 0 ? 'clip-hex' : 'clip-arch'} overflow-hidden`}>
                        <img 
                          src={heroImages[i]?.imageUrl || heroImages[0]?.imageUrl}
                          alt={heroImages[i]?.name || 'Imagem'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Destaques do Cardápio – foco no produto com formas e sobreposição */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
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
                  <Card className="relative overflow-hidden border border-foreground/10 rounded-2xl group">
                    {product.imageUrl && (
                      <div className="relative h-56 overflow-visible">
                        <div className={`photo-tile ${index % 3 === 0 ? 'clip-diagonal tilt-right' : index % 3 === 1 ? 'clip-arch tilt-left' : 'clip-hex tilt-right'} w-[calc(100%+16px)] -ml-2 h-full`}>
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="price-pill">R$ {product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold leading-snug max-w-[75%]">{product.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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

        {/* Newsletter – bloco escuro mínimo e elegante */}
        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="newsletter-diagonal border border-foreground/10 rounded-2xl p-6 md:p-8">
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