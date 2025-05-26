
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Medication } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const medicationSchema = z.object({
  name: z.string().min(2, { message: "Medication name must be at least 2 characters." }),
  dosage: z.string().min(1, { message: "Dosage is required." }),
  schedule: z.string().min(5, { message: "Schedule details are required." }),
  notes: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  medication?: Medication | null;
  onSubmit: (data: MedicationFormData) => void;
  onClose?: () => void;
}

export function MedicationForm({ medication, onSubmit, onClose }: MedicationFormProps) {
  const { toast } = useToast();
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: medication?.name || "",
      dosage: medication?.dosage || "",
      schedule: medication?.schedule || "",
      notes: medication?.notes || "",
      imageUrl: medication?.imageUrl || "",
    },
  });

  const handleSubmit = (data: MedicationFormData) => {
    onSubmit(data);
    toast({
      title: medication ? "Medication Updated" : "Medication Added",
      description: `${data.name} has been successfully ${medication ? 'updated' : 'added'}.`,
    });
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lisinopril" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 10mg, 1 pill" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Once daily in the morning" {...field} />
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
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://placehold.co/40x40.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Take with food, for blood pressure" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onClose && <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>}
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="w-4 h-4 mr-2" />
            {medication ? "Save Changes