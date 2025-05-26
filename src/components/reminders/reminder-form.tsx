
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Reminder, Medication } from "@/lib/types";
import { MOCK_MEDICATIONS } from "@/lib/constants"; // For medication dropdown
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const reminderSchema = z.object({
  medicationId: z.string().min(1, { message: "Please select a medication." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
  days: z.array(z.string()).min(1, { message: "Select at least one day or 'Daily'." }),
  isEnabled: z.boolean().default(true),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  reminder?: Reminder | null;
  medications: Medication[];
  onSubmit: (data: ReminderFormData) => void;
  onClose?: () => void;
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ReminderForm({ reminder, medications, onSubmit, onClose }: ReminderFormProps) {
  const { toast } = useToast();
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      medicationId: reminder?.medicationId || "",
      time: reminder?.time || "08:00",
      days: reminder?.days?.includes("Daily") ? ["Daily"] : reminder?.days || [],
      isEnabled: reminder?.isEnabled === undefined ? true : reminder.isEnabled,
    },
  });

  const handleSubmit = (data: ReminderFormData) => {
    const submittedData = {
      ...data,
      days: data.days.includes("Daily") ? ["Daily"] : data.days.filter(d => d !== "Daily")
    };
    onSubmit(submittedData);
     toast({
      title: reminder ? "Reminder Updated" : "Reminder Added",
      description: `The reminder has been successfully ${reminder ? 'updated' : 'added'}.`,
    });
    if (onClose) onClose();
  };
  
  const selectedDays = form.watch("days") || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="medicationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a medication" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name} ({med.dosage})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="days"
          render={() => (
            <FormItem>
              <FormLabel>Days</FormLabel>
              <div className="grid grid-cols-4 gap-2 items-center">
                 <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("Daily")}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange(["Daily"])
                                  : field.onChange(field.value?.filter(v => v !== "Daily"))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Daily
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                {ALL_DAYS.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="days"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day)}
                              disabled={selectedDays.includes("Daily") && day !== "Daily"}
                              onCheckedChange={(checked) => {
                                const currentDays = field.value || [];
                                // If "Daily" is selected, unselect it before selecting individual days
                                const daysWithoutDaily = currentDays.filter(d => d !== "Daily");
                                return checked
                                  ? field.onChange([...daysWithoutDaily, day])
                                  : field.onChange(
                                      daysWithoutDaily.filter(
                                        (value)