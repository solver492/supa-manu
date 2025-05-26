
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import EmployeeFormDialog from "@/components/employees/EmployeeFormDialog";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching employees:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les employés.", 
        variant: "destructive" 
      });
      setEmployees([]);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
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
    
    const { error } = await supabase
      .from('employes')
      .delete()
      .eq('id', employeeToDelete.id);

    if (error) {
      toast({
        title: "Erreur de suppression",
        description: `Impossible de supprimer l'employé ${employeeToDelete.nom}: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Employé supprimé",
        description: `L'employé ${employeeToDelete.nom} a été supprimé avec succès.`,
      });
      fetchEmployees();
    }
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleSubmitForm = async (employeeData) => {
    try {
      let result;
      if (currentEmployee) {
        // Update existing employee
        result = await supabase
          .from('employes')
          .update({ 
            ...employeeData, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', currentEmployee.id)
          .select();
      } else {
        // Add new employee
        result = await supabase
          .from('employes')
          .insert([employeeData])
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Erreur d'enregistrement",
          description: `Impossible de sauvegarder l'employé: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: currentEmployee ? "Employé modifié" : "Employé ajouté",
          description: `L'employé ${data[0].nom} a été ${currentEmployee ? 'modifié' : 'ajouté'} avec succès.`,
        });
        fetchEmployees();
        setIsFormDialogOpen(false);
        setCurrentEmployee(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { 
      accessorKey: "nom", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" /> 
    },
    { 
      accessorKey: "email", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> 
    },
    { 
      accessorKey: "telephone", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Téléphone" /> 
    },
    { 
      accessorKey: "poste", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Poste" /> 
    },
    { 
      accessorKey: "equipe", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Équipe" /> 
    },
    { 
      accessorKey: "disponibilite", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Disponibilité" /> 
    },
    { 
      accessorKey: "salaire_journalier", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Salaire (€)" />,
      cell: ({ row }) => {
        const salaire = row.getValue("salaire_journalier");
        return salaire ? `${parseFloat(salaire).toFixed(2)}€` : "-";
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteEmployee(employee)} 
                className="text-red-600 focus:text-red-500 focus:bg-red-100/50 dark:focus:bg-red-900/50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employés</h1>
          <p className="text-muted-foreground">Gérez les informations de vos employés.</p>
        </div>
        <Button 
          onClick={handleAddEmployee} 
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Employé
        </Button>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Liste des Employés</CardTitle>
          <CardDescription>Consultez et gérez tous vos employés.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Chargement des employés...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={employees} filterColumn="nom" />
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleSubmitForm}
        employee={currentEmployee}
      />

      <DeleteEmployeeDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        employeeName={employeeToDelete?.nom}
      />
    </motion.div>
  );
};

export default EmployeesPage;
