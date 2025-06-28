import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, Plus, Edit, Trash2, Calendar, Percent, DollarSign, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

export function CouponsManagement() {
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons = [] } = useQuery({
    queryKey: ["/api/coupons"],
    queryFn: api.coupons.getAll
  });

  const form = useForm<CouponFormData>({
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

  const createCouponMutation = useMutation({
    mutationFn: api.coupons.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setIsAddCouponOpen(false);
      form.reset();
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

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.coupons.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setEditingCoupon(null);
      form.reset();
      toast({
        title: "Cupom atualizado",
        description: "Cupom foi atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar cupom",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: api.coupons.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({
        title: "Cupom removido",
        description: "Cupom foi removido com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover cupom",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Percent className="h-4 w-4" />;
      case 'FIXED':
        return <DollarSign className="h-4 w-4" />;
      case 'FREE_DELIVERY':
        return <Truck className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Porcentagem';
      case 'FIXED':
        return 'Valor Fixo';
      case 'FREE_DELIVERY':
        return 'Frete Grátis';
      default:
        return type;
    }
  };

  const getValueDisplay = (coupon: any) => {
    switch (coupon.type) {
      case 'PERCENTAGE':
        return `${coupon.value}%`;
      case 'FIXED':
        return formatCurrency(coupon.value);
      case 'FREE_DELIVERY':
        return 'Frete Grátis';
      default:
        return coupon.value;
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const onSubmit = async (data: CouponFormData) => {
    const formData = {
      ...data,
      value: data.value,
      minimumOrder: data.minimumOrder || null,
      maxDiscount: data.maxDiscount || null,
      usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
      validFrom: new Date(data.validFrom).toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
      isActive: true,
      usageCount: 0
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, data: formData });
    } else {
      createCouponMutation.mutate(formData);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    form.reset({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value.toString(),
      minimumOrder: coupon.minimumOrder?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0]
    });
    setIsAddCouponOpen(true);
  };

  const handleDelete = (couponId: string) => {
    if (confirm('Tem certeza que deseja remover este cupom?')) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
          <p className="text-gray-600">Gerencie cupons e promoções</p>
        </div>
        
        <Dialog open={isAddCouponOpen} onOpenChange={setIsAddCouponOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCoupon(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="DESCONTO10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descrição do cupom..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
                          <SelectItem value="FIXED">Valor Fixo</SelectItem>
                          <SelectItem value="FREE_DELIVERY">Frete Grátis</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={form.watch("type") === "PERCENTAGE" ? "10" : "5.00"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Válido de</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Válido até</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="minimumOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pedido Mínimo (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="50.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Uso (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="100" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddCouponOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                  >
                    {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cupons Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cupom</h3>
              <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro cupom de desconto.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon: any) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(coupon.type)}
                        <span>{getTypeLabel(coupon.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getValueDisplay(coupon)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(coupon.validFrom)}</div>
                        <div>até {formatDate(coupon.validUntil)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isExpired(coupon.validUntil) ? "destructive" : "default"}>
                        {isExpired(coupon.validUntil) ? 'Expirado' : 'Ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}