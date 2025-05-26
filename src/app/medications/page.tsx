"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { MedicationForm } from "@/components/medications/medication-form";
import { MOCK_MEDICATIONS } from "@/lib/constants";
import type { Medication } from "@/lib/types";
import { PlusCircle, Edit, Trash2, Pill } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const { toast } = useToast();

  const handleAddMedication = () => {
    setEditingMedication(null);
    setIsFormOpen(true);
  };

  const handleEditMedication = (med: Medication) => {
    setEditingMedication(med);
    setIsFormOpen(true);
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(meds => meds.filter(m => m.id !== id));
    toast({ title: "Medication Deleted", description: "The medication has been removed." });
  };

  const handleFormSubmit = (data: Omit<Medication, 'id' | 'dataAiHint'> & { imageUrl?: string }) => {
    if (editingMedication) {
      setMedications(meds => meds.map(m => m.id === editingMedication.id ? { ...editingMedication, ...data, dataAiHint: data.imageUrl ? 'pill' : undefined } : m));
    } else {
      const newMedication: Medication = {
        id: String(Date.now()),
        ...data,
        imageUrl: data.imageUrl || undefined,
        dataAiHint: data.imageUrl ? 'pill' : undefined,
      };
      setMedications(meds => [...meds, newMedication]);
    }
    setIsFormOpen(false);
    setEditingMedication(null);
  };
  
  const headerActions = (
    <Button onClick={handleAddMedication} className="bg-accent text-accent-foreground hover:bg-accent/90">
      <PlusCircle className="w-4 h-4 mr-2" />
      Add Medication
    </Button>
  );

  return (
    <MainLayout pageTitle="Medications" headerActions={headerActions}>
       <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingMedication(null);
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMedication ? "Edit Medication" : "Add New Medication"}</DialogTitle>
            <DialogDescription>
              {editingMedication ? "Update the details of your medication." : "Enter the details for the new medication."}
            </DialogDescription>
          </DialogHeader>
          <MedicationForm 
            medication={editingMedication} 
            onSubmit={handleFormSubmit}
            onClose={() => { setIsFormOpen(false); setEditingMedication(null); }}
          />
        </DialogContent>
      </Dialog>

      {medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <Pill className="w-16 h-16 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No Medications Logged Yet</h2>
          <p className="text-muted-foreground mb-4">Add your medications to start tracking.</p>
          <Button onClick={handleAddMedication} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Your First Medication
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {medications.map((med) => (
            <Card key={med.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{med.name}</CardTitle>
                    <CardDescription>{med.dosage}</CardDescription>
                  </div>
                  {med.imageUrl && (
                    <Image 
                      src={med.imageUrl} 
                      alt={med.name} 
                      width={60} 
                      height={60} 
                      className="rounded-md object-cover"
                      data-ai-hint={med.dataAiHint || "pill"}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-1"><strong>Schedule:</strong> {med.schedule}</p>
                {med.notes && <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {med.notes}</p>}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditMedication(med)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the medication "{med.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteMedication(med.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}