import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { factureTableColumns } from '@/components/factures/factureTableColumns';
import FactureFormDialog from '@/components/factures/FactureFormDialog';
import FactureViewDialog from '@/components/factures/FactureViewDialog';
import FacturePrintView from '@/components/factures/FacturePrintView';
import { supabase } from '@/lib/supabaseClient';

export default function FacturesPage() {
  const [factures, setFactures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFacture, setCurrentFacture] = useState(null);
  const printComponentRef = useRef();
  const { toast } = useToast();

  const fetchFactures = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('factures')
        .select(`
          id,
          montant,
          date_emission,
          statut,
          created_at,
          client:client_id(id, nom, adresse, telephone, email),
          prestation:prestation_id(id, type_prestation, date_prestation)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      setFactures(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFactures();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  const handleSubmit = async (formData) => {
    try {
      const { data, error } = currentFacture
        ? await supabase
            .from('factures')
            .update(formData)
            .eq('id', currentFacture.id)
            .select()
        : await supabase
            .from('factures')
            .insert([formData])
            .select();

      if (error) throw error;

      await fetchFactures();
      setIsFormOpen(false);
      setCurrentFacture(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('factures')
        .delete()
        .eq('id', currentFacture.id);

      if (error) throw error;

      await fetchFactures();
      setIsDeleteDialogOpen(false);
      setCurrentFacture(null);
      toast({
        title: "Succès",
        description: "La facture a été supprimée",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facturation</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes vos factures.
          </p>
        </div>
        <Button onClick={() => {
          setCurrentFacture(null);
          setIsFormOpen(true);
        }}>
          Créer une facture
        </Button>
      </div>

      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border">
        <h2 className="text-lg font-semibold mb-4">Liste des Factures</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Consultez et gérez les factures émises.
        </p>

        <DataTable
          columns={factureTableColumns}
          data={factures}
          isLoading={isLoading}
          meta={{
            onEdit: (facture) => {
              setCurrentFacture(facture);
              setIsFormOpen(true);
            },
            onView: (facture) => {
              setCurrentFacture(facture);
              setIsViewOpen(true);
            },
            onPrint: (facture) => {
              setCurrentFacture(facture);
              setTimeout(handlePrint, 100);
            },
            onDelete: (facture) => {
              setCurrentFacture(facture);
              setIsDeleteDialogOpen(true);
            },
          }}
        />
      </div>

      <FactureFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setCurrentFacture(null);
        }}
        onSubmit={handleSubmit}
        facture={currentFacture}
      />

      <FactureViewDialog
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setCurrentFacture(null);
        }}
        facture={currentFacture}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La facture sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div style={{ display: "none" }}>
        <FacturePrintView ref={printComponentRef} facture={currentFacture} />
      </div>
    </div>
  );
}
