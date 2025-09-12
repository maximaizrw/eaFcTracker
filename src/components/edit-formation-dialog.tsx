
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EditTacticFormValues, Tactic } from "@/lib/types";
import { tacticStyles, defenseStyles } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";


const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  detail: z.string().optional(),
  formation: z.string().min(3, "La formación debe tener al menos 3 caracteres."),
  style: z.enum(tacticStyles),
  defense: z.enum(defenseStyles),
  code: z.string().optional(),
});


type EditFormationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditFormation: (values: EditTacticFormValues) => void;
  initialData?: Tactic;
};

export function EditFormationDialog({ open, onOpenChange, onEditFormation, initialData }: EditFormationDialogProps) {
  const form = useForm<EditTacticFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        detail: initialData.detail || "",
        formation: initialData.formation,
        style: initialData.style,
        defense: initialData.defense,
        code: initialData.code || "",
      });
    }
  }, [open, initialData, form]);
  
  function onSubmit(values: EditTacticFormValues) {
    onEditFormation(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Táctica</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la táctica.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col">
                <ScrollArea className="flex-grow pr-6">
                    <div className="space-y-4 pb-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Táctica</FormLabel>
                                <FormControl>
                                <Input placeholder="Ej: 4-3-3" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="detail"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detalle (Opcional)</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Detalles sobre la táctica, autor, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="formation"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Formación</FormLabel>
                                <FormControl>
                                <Input placeholder="Ej: 4-3-3" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="style"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estilo de Ataque</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un estilo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {tacticStyles.map((style) => (
                                    <SelectItem key={style} value={style} className="capitalize">{style}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="defense"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estilo de Defensa</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un estilo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {defenseStyles.map((style) => (
                                    <SelectItem key={style} value={style} className="capitalize">{style}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código (Opcional)</FormLabel>
                                <FormControl>
                                <Input placeholder="Código para compartir" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 bg-background/95 py-4 border-t border-border -mx-6 px-6">
                    <Button type="submit">Guardar Cambios</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
