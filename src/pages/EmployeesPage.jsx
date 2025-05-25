import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import EmployeeFormDialog from "@/components/employees/EmployeeFormDialog";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";
import { getEmployeeTableColumns } from "@/components/employees/employeeTableColumns";

const initialEmployees = [
  { id: "EMP001", nom: "Alice Dubois", poste: "Chef d'équipe", disponibilite: "Disponible", salaireJournalier: 150, competences: "Conduite PL, Gestion d'équipe", avatar: "https://randomuser.me/api/portraits/women/1.jpg", equipe: "Équipe Alpha", nbManutentionnairesEquipe: 3 },
  { id: "EMP002", nom: "Bob Leclerc", poste: "Déménageur", disponibilite: "En mission", salaireJournalier: 100, competences: "Emballage, Montage meubles", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "EMP003", nom: "Charlie Moreau", poste: "Chauffeur", disponibilite: "Disponible", salaireJournalier: 120, competences: "Conduite VL, Logistique", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
];

export const employeeRoles = ["Chef d'équipe", "Déménageur", "Chauffeur", "Manutentionnaire", "Commercial"];
export const employeeStatus = ["Disponible", "En mission", "En congé", "Indisponible"];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const { toast } = useToast();

  const loadEmployees = useCallback(() => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees(initialEmployees);
      localStorage.setItem('employees', JSON.stringify(initialEmployees));
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const saveEmployeesToLocalStorage = (updatedEmployees) => {
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);
  };

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

  const confirmDelete = () => {
    const updatedEmployees = employees.filter(e => e.id !== employeeToDelete.id);
    saveEmployeesToLocalStorage(updatedEmployees);
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
    toast({
      title: "Employé supprimé",
      description: `L'employé ${employeeToDelete.nom} a été supprimé.`,
      variant: "destructive"
    });
  };

  const handleSubmitForm = (employeeData) => {
    if (currentEmployee) {
      const updatedEmployees = employees.map(e => e.id === currentEmployee.id ? { ...e, ...employeeData } : e);
      saveEmployeesToLocalStorage(updatedEmployees);
      toast({
        title: "Employé modifié",
        description: `Les informations de ${employeeData.nom} ont été mises à jour.`,
      });
    } else {
      employeeData.id = `EMP${String(employees.length + 1).padStart(3, '0')}`;
      const updatedEmployees = [...employees, employeeData];
      saveEmployeesToLocalStorage(updatedEmployees);
      toast({
        title: "Employé ajouté",
        description: `${employeeData.nom} a été ajouté à la liste des employés.`,
      });
    }
    setIsFormDialogOpen(false);
    setCurrentEmployee(null);
  };
  
  const columns = React.useMemo(() => getEmployeeTableColumns(handleEditEmployee, handleDeleteEmployee), [handleEditEmployee, handleDeleteEmployee]);

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