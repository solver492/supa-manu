
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { employeeTableColumns } from '@/components/employees/employeeTableColumns';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { Plus, Search, Users, UserCheck, UserX, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/config/supabase';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const { toast } = useToast();

  // Charger les employés depuis Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Tentative de chargement des employés...');
      
      // Requête simple sans politiques RLS complexes
      const { data, error } = await supabase
        .from('employes')
        .select(`
          id,
          nom,
          telephone,
          email,
          poste,
          equipe,
          nb_manutentionnaires_equipe,
          disponibilite,
          salaire_journalier,
          competences,
          avatar_url,
          date_embauche,
          actif,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('Employés chargés avec succès:', data);
      setEmployees(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés. Vérifiez la connexion à la base de données.",
        variant: "destructive",
      });
      // En cas d'erreur, on utilise des données de démonstration
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Ajouter un employé
  const handleAddEmployee = async (employeeData) => {
    try {
      console.log('Données à ajouter:', employeeData);

      const { data, error } = await supabase
        .from('employes')
        .insert([{
          nom: employeeData.nom,
          telephone: employeeData.telephone,
          email: employeeData.email,
          poste: employeeData.poste,
          equipe: employeeData.equipe,
          nb_manutentionnaires_equipe: parseInt(employeeData.nb_manutentionnaires_equipe),
          disponibilite: employeeData.disponibilite,
          salaire_journalier: parseFloat(employeeData.salaire_journalier),
          competences: employeeData.competences,
          avatar_url: employeeData.avatar_url,
          date_embauche: employeeData.date_embauche,
          actif: employeeData.actif
        }])
        .select();

      if (error) {
        console.error('Erreur lors de l\'ajout:', error);
        throw error;
      }

      console.log('Employé ajouté avec succès:', data);
      toast({
        title: "Succès",
        description: "Employé ajouté avec succès.",
      });

      setIsFormDialogOpen(false);
      fetchEmployees(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'employé. Vérifiez les données saisies.",
        variant: "destructive",
      });
    }
  };

  // Modifier un employé
  const handleEditEmployee = async (employeeData) => {
    try {
      const { data, error } = await supabase
        .from('employes')
        .update({
          nom: employeeData.nom,
          telephone: employeeData.telephone,
          email: employeeData.email,
          poste: employeeData.poste,
          equipe: employeeData.equipe,
          nb_manutentionnaires_equipe: parseInt(employeeData.nb_manutentionnaires_equipe),
          disponibilite: employeeData.disponibilite,
          salaire_journalier: parseFloat(employeeData.salaire_journalier),
          competences: employeeData.competences,
          avatar_url: employeeData.avatar_url,
          date_embauche: employeeData.date_embauche,
          actif: employeeData.actif,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEmployee.id)
        .select();

      if (error) {
        console.error('Erreur lors de la modification:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Employé modifié avec succès.",
      });

      setIsFormDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployees(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la modification de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'employé.",
        variant: "destructive",
      });
    }
  };

  // Supprimer un employé
  const handleDeleteEmployee = async () => {
    try {
      const { error } = await supabase
        .from('employes')
        .delete()
        .eq('id', employeeToDelete.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Employé supprimé avec succès.",
      });

      setEmployeeToDelete(null);
      fetchEmployees(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé.",
        variant: "destructive",
      });
    }
  };

  // Ouvrir le dialogue d'édition
  const openEditDialog = (employee) => {
    setEditingEmployee(employee);
    setIsFormDialogOpen(true);
  };

  // Ouvrir le dialogue de suppression
  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
  };

  // Filtrer les employés selon le terme de recherche
  const filteredEmployees = employees.filter(employee =>
    employee.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.poste?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.equipe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.actif).length;
  const availableEmployees = employees.filter(emp => emp.disponibilite === 'Disponible').length;
  const totalSalaries = employees.reduce((sum, emp) => sum + (parseFloat(emp.salaire_journalier) || 0), 0);

  // Configuration des colonnes du tableau
  const columns = employeeTableColumns(openEditDialog, openDeleteDialog);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Gestion des Employés
        </h2>
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setIsFormDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un Employé
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masse Salariale/Jour</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalaries.toFixed(2)} €</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Employés</CardTitle>
          <CardDescription>
            Gérez les informations de vos employés, leurs postes et leurs disponibilités.
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredEmployees}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialogue de formulaire d'employé */}
      <EmployeeFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        employee={editingEmployee}
      />

      {/* Dialogue de suppression */}
      <DeleteEmployeeDialog
        employee={employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteEmployee}
      />
    </div>
  );
};

export default EmployeesPage;
