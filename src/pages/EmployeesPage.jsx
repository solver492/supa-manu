
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Search, Users, UserCheck, UserX, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { employeeTableColumns } from '@/components/employees/employeeTableColumns';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const { toast } = useToast();

  // Statistiques calculées
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.actif).length,
    inactive: employees.filter(emp => !emp.actif).length,
    available: employees.filter(emp => emp.disponibilite === 'Disponible').length
  };

  // Fonction pour récupérer les employés
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Requête simplifiée sans jointures complexes pour éviter la récursion RLS
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

      setEmployees(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter un employé
  const handleAddEmployee = async (employeeData) => {
    try {
      const { data, error } = await supabase
        .from('employes')
        .insert([{
          nom: employeeData.nom,
          telephone: employeeData.telephone,
          email: employeeData.email,
          poste: employeeData.poste,
          equipe: employeeData.equipe,
          nb_manutentionnaires_equipe: parseInt(employeeData.nb_manutentionnaires_equipe) || 1,
          disponibilite: employeeData.disponibilite || 'Disponible',
          salaire_journalier: parseFloat(employeeData.salaire_journalier) || 0,
          competences: employeeData.competences || '',
          avatar_url: employeeData.avatar_url || '',
          date_embauche: employeeData.date_embauche || new Date().toISOString().split('T')[0],
          actif: employeeData.actif !== undefined ? employeeData.actif : true
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout:', error);
        throw error;
      }

      setEmployees(prev => [data, ...prev]);
      toast({
        title: "Succès",
        description: "Employé ajouté avec succès",
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'employé",
        variant: "destructive",
      });
    }
  };

  // Fonction pour modifier un employé
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
          nb_manutentionnaires_equipe: parseInt(employeeData.nb_manutentionnaires_equipe) || 1,
          disponibilite: employeeData.disponibilite,
          salaire_journalier: parseFloat(employeeData.salaire_journalier) || 0,
          competences: employeeData.competences || '',
          avatar_url: employeeData.avatar_url || '',
          date_embauche: employeeData.date_embauche,
          actif: employeeData.actif,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEmployee.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la modification:', error);
        throw error;
      }

      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? data : emp));
      toast({
        title: "Succès",
        description: "Employé modifié avec succès",
      });
      setIsFormOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'employé",
        variant: "destructive",
      });
    }
  };

  // Fonction pour supprimer un employé
  const handleDeleteEmployee = async () => {
    try {
      const { error } = await supabase
        .from('employes')
        .delete()
        .eq('id', deleteEmployee.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }

      setEmployees(prev => prev.filter(emp => emp.id !== deleteEmployee.id));
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès",
      });
      setDeleteEmployee(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé",
        variant: "destructive",
      });
    }
  };

  // Filtrage des employés
  const filteredEmployees = employees.filter(employee =>
    employee.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.poste?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.equipe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Colonnes du tableau avec actions
  const columns = employeeTableColumns(
    (employee) => {
      setEditingEmployee(employee);
      setIsFormOpen(true);
    },
    (employee) => setDeleteEmployee(employee)
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Employés</h1>
        <p className="text-muted-foreground">Gérez votre équipe et suivez les performances.</p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md border-none bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.total}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Personnel total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.active}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Employés actifs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Inactifs</CardTitle>
            <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.inactive}</div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Employés inactifs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Disponibles</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{stats.available}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Prêts à travailler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un Employé
        </Button>
      </div>

      {/* Tableau des employés */}
      <Card className="shadow-lg border-none bg-gradient-to-br from-card to-slate-50 dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Liste des Employés
          </CardTitle>
          <CardDescription>
            {filteredEmployees.length} employé(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredEmployees}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialogues */}
      <EmployeeFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        employee={editingEmployee}
      />

      <DeleteEmployeeDialog
        employee={deleteEmployee}
        onClose={() => setDeleteEmployee(null)}
        onConfirm={handleDeleteEmployee}
      />
    </div>
  );
};

export default EmployeesPage;
