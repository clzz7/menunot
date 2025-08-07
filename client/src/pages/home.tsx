import { useState } from "react";
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
import { Clock, MapPin, Star, ArrowRight, UtensilsCrossed, Wine, Users } from "lucide-react";
import { ReactLenis } from "lenis/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.js";

function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { cart, updateQuantity, removeFromCart } = useCart();

  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getAll,
  });

  const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];
  const heroImages = Array.isArray(products) ? products.slice(0, 5) : [];

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
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* HERO — Full-bleed immersive carousel with content overlay */}
        <section className="relative min-h-[92vh]">
          <div className="absolute inset-0">
            {heroImages.length > 0 ? (
              <Carousel opts={{ loop: true }} className="h-full">
                <CarouselContent className="h-full">
                  {heroImages.map((item, idx) => (
                    <CarouselItem key={item.id ?? idx} className="basis-full h-[92vh]">
                      <div className="relative w-full h-full">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading={idx > 0 ? "lazy" : "eager"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            ) : (
              <div className="h-full w-full bg-cream-50" />
            )}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-10 flex items-end h-[92vh]">
            <div className="max-w-2xl">
              <Badge className="mb-4 px-4 py-1 text-xs border-dashed border-2 border-primary/40 bg-transparent text-primary rounded-full">
                {establishment.name}
              </Badge>

              <TextReveal delay={0.2}>
                <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                  Uma casa para celebrar tempo, técnica e sabor
                </h1>
              </TextReveal>

              <TextReveal delay={0.4}>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl">
                  Ingredientes de origem, execução precisa e uma sala conduzida com elegância. Sente, converse, prove sem pressa.
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
                <div className="flex items-center gap-2"><Star className="w-4 h-4" /><span>Avaliação 4.9</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Ter–Dom, 12h–23h</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{establishment?.address || "Centro"}</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIÊNCIAS — Três caminhos claros */}
        <section className="py-14 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <TextReveal>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Escolha sua experiência</h2>
                </TextReveal>
                <p className="text-muted-foreground mt-2">Mesa para hoje, pedido para agora, ou um evento privado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Jantar na Casa",
                  description: "Reserve sua mesa e viva a sala ao seu tempo",
                  cta: "Reservar",
                  href: "/cardapio",
                  icon: UtensilsCrossed,
                  image: heroImages[0]?.imageUrl || heroImages[1]?.imageUrl,
                },
                {
                  title: "Delivery Autoral",
                  description: "Sabores da cozinha, no conforto de casa",
                  cta: "Pedir agora",
                  href: "/cardapio",
                  icon: Wine,
                  image: heroImages[2]?.imageUrl || heroImages[0]?.imageUrl,
                },
                {
                  title: "Eventos & Sala",
                  description: "Aniversários, jantares a quatro mãos e encontros",
                  cta: "Falar com a equipe",
                  href: "/pedidos",
                  icon: Users,
                  image: heroImages[3]?.imageUrl || heroImages[1]?.imageUrl,
                },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} className="group block">
                  <div className="relative overflow-hidden rounded-2xl border border-foreground/10">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span>Experiência</span>
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <Button variant="outline" className="mt-4 w-fit rounded-full">{item.cta}</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* DESTAQUES DO CARDÁPIO */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <TextReveal>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pratos em destaque</h2>
                </TextReveal>
                <p className="text-muted-foreground mt-2">Seleção que muda conforme a estação</p>
              </div>
              <Link href="/cardapio">
                <Button variant="outline" className="rounded-full">Ver tudo</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <Card key={product.id} className="relative overflow-hidden border border-foreground/10 rounded-2xl group">
                  {product.imageUrl && (
                    <div className="relative h-56 overflow-visible">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-3 right-3"><span className="price-pill">R$ {product.price.toFixed(2)}</span></div>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold leading-snug max-w-[75%]">{product.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                    <Link href="/cardapio">
                      <Button className="w-full rounded-full" variant="outline">Ver detalhes</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* MANIFESTO — Texto com revelação sutil */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="border rounded-2xl p-8 md:p-12 border-foreground/10 note-card">
              <TextReveal stagger={0.08}>
                <p className="text-2xl md:text-3xl font-semibold leading-snug">
                  Cozinha aberta. Ingredientes de estação. Vinho servido com calma. Cada prato nasce do encontro entre origem e técnica — para que cada visita seja diferente da última, e igualmente memorável.
                </p>
              </TextReveal>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="badge-shadow rounded-full px-3 py-1 bg-background border border-foreground/10">Carta autoral</span>
                <span className="badge-shadow rounded-full px-3 py-1 bg-background border border-foreground/10">Fogo controlado</span>
                <span className="badge-shadow rounded-full px-3 py-1 bg-background border border-foreground/10">Produtores locais</span>
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
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