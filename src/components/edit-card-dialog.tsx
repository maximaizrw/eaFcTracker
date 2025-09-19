
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { League, CardStyle } from "@/lib/types";
import { leagues, cardStyles } from "@/lib/types";

const formSchema = z.object({
  playerId: z.string(),
  cardId: z.string(),
  league: z.enum(leagues).optional(),
  team: z.string().optional(),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  cardStyle: z.enum(cardStyles),
});

export type FormValues = z.infer<typeof formSchema>;

type EditCardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCard: (values: FormValues) => void;
  initialData?: FormValues;
};

export function EditCardDialog({ open, onOpenChange, onEditCard, initialData }: EditCardDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
          ...initialData,
          league: initialData.league || 'Sin Liga',
          team: initialData.team || 'Sin Equipo',
          cardStyle: initialData.cardStyle || 'gold-common',
      });
    }
  }, [open, initialData, form]);
  
  function onSubmit(values: FormValues) {
    onEditCard(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Carta</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la carta, como su tipo, liga, equipo e imagen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Carta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cardStyles.map((style) => (
                        <SelectItem key={style} value={style} className="capitalize">{style.replace('-', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="league"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liga</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una liga" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league} value={league}>{league}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: FC Barcelona" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen de la Carta (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen_carta.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
