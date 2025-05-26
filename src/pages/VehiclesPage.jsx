
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import VehicleFormDialog from "@/components/vehicles/VehicleFormDialog";
import DeleteVehicleDialog from "@/components/vehicles/DeleteVehicleDialog";
import { getVehicleTableColumns } from "@/components/vehicles/vehicleTableColumns";
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export const vehicleTypes = ["Camion 20m³", "Camion 30m³", "Fourgonnette 12m³", "Camionnette 8m³", "Monte-meubles", "Remorque"];
export const vehicleStates = ["Disponible", "En mission", "En maintenance", "Hors service", "En réparation"];

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des véhicules:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les véhicules",
          variant: "destructive"
        });
        return;
      }

      // Transformer les données pour correspondre au format attendu par l'interface
      const transformedVehicles = data.map(vehicle => ({
        id: vehicle.id,
        immatriculation: vehicle.immatriculation,
        type: vehicle.type,
        etat: vehicle.statut,
        capacite: vehicle.capacite_m3 ? `${vehicle.capacite_m3}m³` : '',
        prochaineMaintenance: vehicle.prochaine_maintenance,
        marque: vehicle.marque,
        modele: vehicle.modele,
        annee: vehicle.annee,
        dateAcquisition: vehicle.date_acquisition,
        notes: vehicle.notes
      }));

      setVehicles(transformedVehicles);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setIsFormDialogOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsFormDialogOpen(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('vehicules')
        .delete()
        .eq('id', vehicleToDelete.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le véhicule",
          variant: "destructive"
        });
        return;
      }

      await loadVehicles();
      setIsDeleteDialogOpen(false);
      setVehicleToDelete(null);
      toast({
        title: "Véhicule supprimé",
        description: `Le véhicule ${vehicleToDelete.immatriculation} a été supprimé.`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const handleSubmitForm = async (vehicleData) => {
    try {
      // Transformer les données pour correspondre à la structure de la base de données
      const dbData = {
        immatriculation: vehicleData.immatriculation,
        type: vehicleData.type,
        statut: vehicleData.etat,
        capacite_m3: vehicleData.capacite ? parseFloat(vehicleData.capacite.replace('m³', '')) : null,
        prochaine_maintenance: vehicleData.prochaineMaintenance || null,
        marque: vehicleData.marque || null,
        modele: vehicleData.modele || null,
        annee: vehicleData.annee ? parseInt(vehicleData.annee) : null,
        date_acquisition: vehicleData.dateAcquisition || null,
        notes: vehicleData.notes || null,
        updated_at: new Date().toISOString()
      };

      if (currentVehicle) {
        // Modification
        const { error } = await supabase
          .from('vehicules')
          .update(dbData)
          .eq('id', currentVehicle.id);

        if (error) {
          console.error('Erreur lors de la modification:', error);
          toast({
            title: "Erreur",
            description: "Impossible de modifier le véhicule",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Véhicule modifié",
          description: `Les informations du véhicule ${vehicleData.immatriculation} ont été mises à jour.`,
        });
      } else {
        // Ajout
        const { error } = await supabase
          .from('vehicules')
          .insert([dbData]);

        if (error) {
          console.error('Erreur lors de l\'ajout:', error);
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter le véhicule",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Véhicule ajouté",
          description: `Le véhicule ${vehicleData.immatriculation} a été ajouté à la flotte.`,
        });
      }

      await loadVehicles();
      setIsFormDialogOpen(false);
      setCurrentVehicle(null);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération",
        variant: "destructive"
      });
    }
  };
  
  const columns = React.useMemo(() => getVehicleTableColumns(handleEditVehicle, handleDeleteVehicle), []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des véhicules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Véhicules</h1>
          <p className="text-muted-foreground">Suivez et gérez votre flotte de véhicules.</p>
        </div>
        <Button onClick={handleAddVehicle} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Véhicule
        </Button>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Liste des Véhicules</CardTitle>
          <CardDescription>Consultez et gérez la liste de tous vos véhicules.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={vehicles} filterColumn="immatriculation" />
        </CardContent>
      </Card>

      <VehicleFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleSubmitForm}
        vehicle={currentVehicle}
        vehicleTypes={vehicleTypes}
        vehicleStates={vehicleStates}
      />

      <DeleteVehicleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        vehicleImmatriculation={vehicleToDelete?.immatriculation}
      />
    </motion.div>
  );
};

export default VehiclesPage;
