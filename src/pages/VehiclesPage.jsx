import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import VehicleFormDialog from "@/components/vehicles/VehicleFormDialog";
import DeleteVehicleDialog from "@/components/vehicles/DeleteVehicleDialog";
import { getVehicleTableColumns } from "@/components/vehicles/vehicleTableColumns";

const initialVehicles = [
  { id: "VEH001", immatriculation: "AA-123-BB", type: "Camion 20m³", etat: "Disponible", capacite: "20m³", prochaineMaintenance: "2025-08-15" },
  { id: "VEH002", immatriculation: "CC-456-DD", type: "Fourgonnette 12m³", etat: "En mission", capacite: "12m³", prochaineMaintenance: "2025-07-30" },
  { id: "VEH003", immatriculation: "EE-789-FF", type: "Camionnette 8m³", etat: "En maintenance", capacite: "8m³", prochaineMaintenance: "2025-06-25" },
];

export const vehicleTypes = ["Camion 20m³", "Camion 30m³", "Fourgonnette 12m³", "Camionnette 8m³", "Monte-meubles", "Remorque"];
export const vehicleStates = ["Disponible", "En mission", "En maintenance", "Hors service", "En réparation"];

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const { toast } = useToast();

  const loadVehicles = useCallback(() => {
    const storedVehicles = localStorage.getItem('vehicles');
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles));
    } else {
      setVehicles(initialVehicles);
      localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const saveVehiclesToLocalStorage = (updatedVehicles) => {
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    setVehicles(updatedVehicles);
  };

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

  const confirmDelete = () => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleToDelete.id);
    saveVehiclesToLocalStorage(updatedVehicles);
    setIsDeleteDialogOpen(false);
    setVehicleToDelete(null);
    toast({
      title: "Véhicule supprimé",
      description: `Le véhicule ${vehicleToDelete.immatriculation} a été supprimé.`,
      variant: "destructive"
    });
  };

  const handleSubmitForm = (vehicleData) => {
    if (currentVehicle) {
      const updatedVehicles = vehicles.map(v => v.id === currentVehicle.id ? { ...v, ...vehicleData } : v);
      saveVehiclesToLocalStorage(updatedVehicles);
      toast({
        title: "Véhicule modifié",
        description: `Les informations du véhicule ${vehicleData.immatriculation} ont été mises à jour.`,
      });
    } else {
      vehicleData.id = `VEH${String(vehicles.length + 1).padStart(3, '0')}`;
      const updatedVehicles = [...vehicles, vehicleData];
      saveVehiclesToLocalStorage(updatedVehicles);
      toast({
        title: "Véhicule ajouté",
        description: `Le véhicule ${vehicleData.immatriculation} a été ajouté à la flotte.`,
      });
    }
    setIsFormDialogOpen(false);
    setCurrentVehicle(null);
  };
  
  const columns = React.useMemo(() => getVehicleTableColumns(handleEditVehicle, handleDeleteVehicle), [handleEditVehicle, handleDeleteVehicle]);

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default VehiclesPage;