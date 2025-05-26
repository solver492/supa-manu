
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import EmployeeFormDialog from "@/components/employees/EmployeeFormDialog";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";
import { getEmployeeTableColumns } from "@/components/employees/employeeTableColumns";
import { supabase } from '@/lib/supabaseClient';

export const employeeRoles = ["Chef d'équipe", "Déménageur", "Chauffeur", "Manutentionnaire", "Commercial"];
export const employeeStatus = ["Disponible", "En mission", "En congé", "Indisponible"];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employes')
        .select('*')
        .eq('actif', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des employés:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les employés.",
          variant: "destructive"
        });
        setEmployees([]);
      } else {
        setEmployees(data || []);
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setIsFormDialogOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setIsFormDialogOpen(true);
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const { error } = await supabase
        .from('employes')
        .update({ actif: false, updated_at: new Date().toISOString() })
        .eq('id', employeeToDelete.id);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'employé.",
          variant: "destructive"
        });
        return;
      }

      await fetchEmployees();
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      toast({
        title: "Employé supprimé",
        description: `L'employé ${employeeToDelete.nom} a été supprimé.`,
        variant: "destructive"
      });
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitForm = async (employeeData) => {
    try {
      if (currentEmployee) {
        // Mise à jour d'un employé existant
        const updateData = {
          ...employeeData,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('employes')
          .update(updateData)
          .eq('id', currentEmployee.id);

        if (error) {
          console.error("Erreur lors de la mise à jour:", error);
          toast({
            title: "Erreur",
            description: "Impossible de modifier l'employé.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Employé modifié",
          description: `Les informations de ${employeeData.nom} ont été mises à jour.`,
        });
      } else {
        // Création d'un nouvel employé
        const insertData = {
          ...employeeData,
          actif: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('employes')
          .insert([insertData]);

        if (error) {
          console.error("Erreur lors de l'ajout:", error);
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter l'employé.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Employé ajouté",
          description: `${employeeData.nom} a été ajouté à la liste des employés.`,
        });
      }

      await fetchEmployees();
      setIsFormDialogOpen(false);
      setCurrentEmployee(null);
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    }
  };
  
  const columns = React.useMemo(() => getEmployeeTableColumns(handleEditEmployee, handleDeleteEmployee), [handleEditEmployee, handleDeleteEmployee]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des employés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Employés</h1>
          <p className="text-muted-foreground">Gérez votre personnel, leurs compétences et disponibilités.</p>
        </div>
        <Button onClick={handleAddEmployee} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Employé
        </Button>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Liste des Employés</CardTitle>
          <CardDescription>Consultez et gérez la liste de tous vos employés.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={employees} filterColumn="nom" />
        </CardContent>
      </Card>

      <EmployeeFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleSubmitForm}
        employee={currentEmployee}
        employeeRoles={employeeRoles}
        employeeStatus={employeeStatus}
      />

      <DeleteEmployeeDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        employeeName={employeeToDelete?.nom}
      />
    </div>
  );
};

export default EmployeesPage;
