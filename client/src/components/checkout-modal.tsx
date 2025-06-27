import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Cart, CustomerData } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  zipCode: z.string().min(1, "CEP é obrigatório"),
  reference: z.string().optional(),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  observations: z.string().optional(),
  couponCode: z.string().optional()
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onOrderComplete: (order: any) => void;
  onApplyCoupon: (code: string) => Promise<void>;
  onBackToCart: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onOrderComplete,
  onApplyCoupon,
  onBackToCart
}: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFillNotification, setAutoFillNotification] = useState(false);
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "PIX",
      city: "São Paulo",
      state: "SP"
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleWhatsAppBlur = async () => {
    const whatsapp = form.getValues("whatsapp");
    if (!whatsapp) return;

    try {
      const customer = await api.customers.getByWhatsapp(whatsapp);
      if (customer) {
        form.setValue("name", customer.name);
        form.setValue("email", customer.email || "");
        form.setValue("address", customer.address);
        form.setValue("number", customer.number);
        form.setValue("complement", customer.complement || "");
        form.setValue("neighborhood", customer.neighborhood);
        form.setValue("city", customer.city);
        form.setValue("state", customer.state);
        form.setValue("zipCode", customer.zipCode);
        form.setValue("reference", customer.reference || "");
        form.setValue("paymentMethod", customer.defaultPaymentMethod);
        
        setAutoFillNotification(true);
        setTimeout(() => setAutoFillNotification(false), 5000);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  const handleApplyCoupon = async () => {
    const couponCode = form.getValues("couponCode");
    if (!couponCode) return;

    try {
      await onApplyCoupon(couponCode);
      toast({
        title: "Cupom aplicado!",
        description: "Desconto aplicado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro no cupom",
        description: error.message || "Cupom inválido ou expirado",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Check if customer exists, if not create one
      let customer = await api.customers.getByWhatsapp(data.whatsapp);
      
      if (!customer) {
        customer = await api.customers.create({
          whatsapp: data.whatsapp,
          name: data.name,
          email: data.email || undefined,
          address: data.address,
          number: data.number,
          complement: data.complement || undefined,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          reference: data.reference || undefined,
          defaultPaymentMethod: data.paymentMethod
        });
      }

      // Create order
      const orderData = {
        customerName: data.name,
        customerPhone: data.whatsapp,
        customerEmail: data.email || undefined,
        deliveryAddress: data.address,
        deliveryNumber: data.number,
        deliveryComplement: data.complement || undefined,
        deliveryNeighborhood: data.neighborhood,
        deliveryCity: data.city,
        deliveryState: data.state,
        deliveryZipCode: data.zipCode,
        deliveryReference: data.reference || undefined,
        subtotal: cart.subtotal.toString(),
        deliveryFee: cart.deliveryFee.toString(),
        discount: cart.discount.toString(),
        total: cart.total.toString(),
        paymentMethod: data.paymentMethod,
        observations: data.observations || undefined,
        estimatedTime: 30,
        customerId: customer.id,
        establishmentId: "default" // Will be handled by backend
      };

      const orderItems = cart.items.map(item => ({
        quantity: item.quantity,
        unitPrice: item.price.toString(),
        totalPrice: item.total.toString(),
        selectedOptions: item.selectedOptions || undefined,
        observations: item.observations || undefined,
        productId: item.id
      }));

      const order = await api.orders.create({
        order: orderData,
        items: orderItems
      });

      onOrderComplete(order);
      
      toast({
        title: "Pedido confirmado!",
        description: `Pedido #${order.orderNumber} foi criado com sucesso`,
      });

    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <span className="ml-2 text-sm font-medium text-primary">Dados</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <span className="ml-2 text-sm text-gray-500">Confirmação</span>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* WhatsApp Field */}
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(11) 99999-9999" 
                      {...field}
                      onBlur={handleWhatsAppBlur}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">Utilizamos o WhatsApp para identificar seu perfil automaticamente</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-fill notification */}
            {autoFillNotification && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center text-blue-700">
                  <Check className="w-4 h-4 mr-2" />
                  <span className="text-sm">Encontramos seus dados! Você pode editá-los se necessário.</span>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Endereço de Entrega</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da rua" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número *</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345-678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ponto de Referência</FormLabel>
                    <FormControl>
                      <Input placeholder="Próximo ao mercado, esquina com..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="PIX" id="pix" />
                        <Label htmlFor="pix" className="flex items-center cursor-pointer">
                          <span className="ml-2">PIX</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="CASH" id="cash" />
                        <Label htmlFor="cash" className="flex items-center cursor-pointer">
                          <span className="ml-2">Dinheiro na entrega</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <RadioGroupItem value="CARD" id="card" />
                        <Label htmlFor="card" className="flex items-center cursor-pointer">
                          <span className="ml-2">Cartão na entrega</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Notes */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações do Pedido</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alguma observação especial?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coupon Code */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="couponCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cupom de Desconto</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Digite seu cupom" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                        Aplicar
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h4>
              <div className="space-y-2 text-sm">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega:</span>
                  <span>{formatCurrency(cart.deliveryFee)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(cart.total)}</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Tempo estimado: 30-40 min
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onBackToCart} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-orange-600">
                {isSubmitting ? "Processando..." : "Confirmar Pedido"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
