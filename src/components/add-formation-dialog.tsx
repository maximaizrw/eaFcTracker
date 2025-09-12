
"use client";

import { useEffect, useState } from "react";
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
import type { AddFormationFormValues } from "@/lib/types";
import { formationPlayStyles, FormationSlotSchema } from "@/lib/types";
import { formationPresets } from "@/lib/formation-presets";
import { ScrollArea } from "./ui/scroll-area";

const defaultPreset = formationPresets.find(p => p.name === '4-4-2');
const defaultSlots = defaultPreset?.slots || Array(11).fill({ position: 'ST', styles: [] });

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  creator: z.string().optional(),
  playStyle: z.enum(formationPlayStyles),
  slots: z.array(FormationSlotSchema).length(11, "Debe definir exactamente 11 posiciones."),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  secondaryImageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  sourceUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

type AddFormationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFormation: (values: AddFormationFormValues) => void;
};

export function AddFormationDialog({ open, onOpenChange, onAddFormation }: AddFormationDialogProps) {
  
  const form = useForm<AddFormationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      creator: "",
      playStyle: "Equilibrado",
      slots: defaultSlots,
      imageUrl: "",
      secondaryImageUrl: "",
      sourceUrl: "",
    },
  });
  
  const { reset } = form;

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        creator: "",
        playStyle: "Equilibrado",
        slots: defaultSlots,
        imageUrl: "",
        secondaryImageUrl: "",
        sourceUrl: "",
      });
    } else {
        // When opening, ensure default slots are set
        form.setValue('slots', defaultSlots);
        const presetName = defaultPreset?.name || '';
        if(!form.getValues('name')) {
            form.setValue('name', presetName);
          }
    }
  }, [open, reset, form]);

  function onSubmit(values: AddFormationFormValues) {
    onAddFormation(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Añadir Nueva Táctica Personalizada</DialogTitle>
          <DialogDescription>
            Configura los detalles de tu nueva táctica.
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
                            <Input placeholder="Ej: 4-4-2 Equilibrado" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="creator"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Creador (Opcional)</FormLabel>
                            <FormControl>
                            <Input placeholder="Ej: TuNombre" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="playStyle"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estilo Táctico</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estilo táctico" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {formationPlayStyles.map((style) => (
                                <SelectItem key={style} value={style}>{style}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Táctica Principal (Opcional)</FormLabel>
                            <FormControl>
                            <Input placeholder="https://ejemplo.com/tactica.png" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="secondaryImageUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Táctica Secundaria (Opcional)</FormLabel>
                            <FormControl>
                            <Input placeholder="https://ejemplo.com/tactica_sec.png" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sourceUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Fuente (Opcional)</FormLabel>
                            <FormControl>
                            <Input placeholder="https://youtube.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </ScrollArea>
            <DialogFooter className="flex-shrink-0 bg-background/95 py-4 border-t -mx-6 px-6">
                <Button type="submit">Guardar Táctica</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
