import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod.js";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.js";
import { Input } from "@/components/ui/input.js";
import { Textarea } from "@/components/ui/textarea.js";
import { Switch } from "@/components/ui/switch.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.js";
import { Badge } from "@/components/ui/badge.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";
import { 
  Settings as SettingsIcon, 
  Store, 
  Clock, 
  Truck, 
  CreditCard, 
  Ticket,
  Save,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { api } from "@/lib/api.js";
import { useToast } from "@/hooks/use-toast.js";
import { Establishment } from "@shared/schema.js";

const establishmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  address: z.string().min(1, "Endereço é obrigatório"),
  logo: z.string().url("URL inválida").optional().or(z.literal("")),
  banner: z.string().url("URL inválida").optional().or(z.literal("")),
  primaryColor: z.string().min(1, "Cor primária é obrigatória"),
  secondaryColor: z.string().min(1, "Cor secundária é obrigatória"),
  isOpen: z.boolean(),
  preparationTime: z.string().min(1, "Tempo de preparo é obrigatório"),
  deliveryFee: z.string().min(1, "Taxa de entrega é obrigatória"),
  minimumOrder: z.string().min(1, "Pedido mínimo é obrigatório"),
  acceptsCard: z.boolean(),
  acceptsPix: z.boolean(),
  acceptsCash: z.boolean(),
  pixKey: z.string().optional()
});

type EstablishmentFormData = z.infer<typeof establishmentSchema>;

const couponSchema = z.object({
  code: z.string().min(1, "Código é obrigatório").toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_DELIVERY"]),
  value: z.string().min(1, "Valor é obrigatório"),
  minimumOrder: z.string().optional(),
  maxDiscount: z.string().optional(),
  usageLimit: z.string().optional(),
  validFrom: z.string().min(1, "Data inicial é obrigatória"),
  validUntil: z.string().min(1, "Data final é obrigatória")
});

type CouponFormData = z.infer<typeof couponSchema>;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: establishment } = useQuery({
    queryKey: ["/api/establishment"],
    queryFn: api.establishment.get
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["/api/coupons"],
    queryFn: () => establishment ? api.coupons.getAll() : Promise.resolve([])
  });

  const form = useForm<EstablishmentFormData>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      logo: "",
      banner: "",
      primaryColor: "#FF6B35",
      secondaryColor: "#F7931E",
      isOpen: true,
      preparationTime: "30",
      deliveryFee: "5.00",
      minimumOrder: "20.00",
      acceptsCard: true,
      acceptsPix: true,
      acceptsCash: true,
      pixKey: ""
    }
  });

  const couponForm = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: "",
      minimumOrder: "",
      maxDiscount: "",
      usageLimit: "",
      validFrom: "",
      validUntil: ""
    }
  });

  // Set form values when establishment data loads
  useEffect(() => {
    if (establishment) {
      form.reset({
        name: establishment.name,
        description: establishment.description || "",
        phone: establishment.phone,
        email: establishment.email || "",
        address: establishment.address,
        logo: establishment.logo || "",
        banner: establishment.banner || "",
        primaryColor: establishment.primaryColor,
        secondaryColor: establishment.secondaryColor,
        isOpen: establishment.isOpen,
        preparationTime: establishment.preparationTime?.toString() || "30",
        deliveryFee: establishment.deliveryFee?.toString() || "5.00",
        minimumOrder: establishment.minimumOrder?.toString() || "20.00",
        acceptsCard: establishment.acceptsCard,
        acceptsPix: establishment.acceptsPix,
        acceptsCash: establishment.acceptsCash,
        pixKey: establishment.pixKey || ""
      });
    }
  }, [establishment]);

  const updateEstablishmentMutation = useMutation({
    mutationFn: (data: any) => establishment ? api.establishment.update(establishment.id, data) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/establishment"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: api.coupons.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setIsAddCouponOpen(false);
      couponForm.reset();
      toast({
        title: "Cupom criado",
        description: "Cupom foi criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar cupom",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  const onSubmitEstablishment = async (data: EstablishmentFormData) => {
    const updateData = {
      ...data,
      preparationTime: parseInt(data.preparationTime),
      deliveryFee: data.deliveryFee,
      minimumOrder: data.minimumOrder
    };

    updateEstablishmentMutation.mutate(updateData);
  };

  const onSubmitCoupon = async (data: CouponFormData) => {
    const couponData = {
      ...data,
      value: data.value,
      minimumOrder: data.minimumOrder || undefined,
      maxDiscount: data.maxDiscount || undefined,
      usageLimit: data.usageLimit ? parseInt(data.usageLimit) : undefined,
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
      isActive: true,
      establishmentId: establishment?.id || "default"
    };

    createCouponMutation.mutate(couponData);
  };

  if (!establishment) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600">Gerencie as configurações do seu estabelecimento</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center">
            <Store className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center">
            <Truck className="w-4 h-4 mr-2" />
            Entrega
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Pagamento
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center">
            <Ticket className="w-4 h-4 mr-2" />
            Cupons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="w-5 h-5 mr-2 text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEstablishment)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Estabelecimento *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do seu restaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição do seu estabelecimento..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@estabelecimento.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preparationTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo de Preparo Padrão (min) *</FormLabel>
                          <FormControl>
                            <Input placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo do estabelecimento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Logo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/logo.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="banner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Banner</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/banner.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária *</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Secundária *</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isOpen"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Estabelecimento Aberto</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Controla se o estabelecimento está aceitando pedidos
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-orange-600"
                    disabled={updateEstablishmentMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateEstablishmentMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2 text-primary" />
                Configurações de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEstablishment)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Entrega *</FormLabel>
                          <FormControl>
                            <Input placeholder="5.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minimumOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pedido Mínimo *</FormLabel>
                          <FormControl>
                            <Input placeholder="20.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-orange-600"
                    disabled={updateEstablishmentMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateEstablishmentMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Métodos de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEstablishment)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="acceptsPix"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aceitar PIX</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Permite pagamento via PIX
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptsCash"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aceitar Dinheiro</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Permite pagamento em dinheiro na entrega
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptsCard"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aceitar Cartão</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Permite pagamento com cartão na entrega
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pixKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave PIX</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua chave PIX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-orange-600"
                    disabled={updateEstablishmentMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateEstablishmentMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cupons de Desconto</h3>
              <p className="text-gray-600">Gerencie cupons de desconto para seus clientes</p>
            </div>
            <Button onClick={() => setIsAddCouponOpen(true)} className="bg-primary hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              {coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cupom criado</p>
                  <p className="text-sm">Crie cupons para oferecer descontos aos seus clientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon: any) => (
                    <div key={coupon.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="font-mono">
                              {coupon.code}
                            </Badge>
                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                              {coupon.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                          )}
                          <div className="text-sm text-gray-500 mt-2">
                            <span>
                              {coupon.type === "PERCENTAGE" 
                                ? `${coupon.value}% de desconto`
                                : coupon.type === "FIXED"
                                ? `${formatCurrency(coupon.value)} de desconto`
                                : "Frete grátis"
                              }
                            </span>
                            {coupon.minimumOrder && (
                              <span> • Mínimo: {formatCurrency(coupon.minimumOrder)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
