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
import ClientFormDialog from "@/components/clients/ClientFormDialog";
import DeleteClientDialog from "@/components/clients/DeleteClientDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';


const ClientSitesPage = () => {
  const [clients, setClients] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      toast({ title: "Erreur", description: "Impossible de charger les clients.", variant: "destructive" });
      setClients([]);
    } else {
      setClients(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClient = () => {
    setCurrentClient(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClient = (client) => {
    setCurrentClient(client);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientToDelete.id);

    if (error) {
      toast({
        title: "Erreur de suppression",
        description: `Impossible de supprimer le client ${clientToDelete.nom}: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Client supprimé",
        description: `Le client ${clientToDelete.nom} a été supprimé avec succès.`,
      });
      fetchClients(); // Refresh list
    }
    setIsDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleSubmitForm = async (clientData) => {
    let result;
    if (currentClient) {
      // Update existing client
      result = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', currentClient.id)
        .select();
    } else {
      // Add new client
      result = await supabase
        .from('clients')
        .insert([{ ...clientData }])
        .select();
    }

    const { data, error } = result;

    if (error) {
      toast({
        title: "Erreur d'enregistrement",
        description: `Impossible de sauvegarder le client: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: currentClient ? "Client modifié" : "Client ajouté",
        description: `Le client ${data[0].nom} a été ${currentClient ? 'modifié' : 'ajouté'} avec succès.`,
      });
      fetchClients(); // Refresh list
    }
    setIsFormDialogOpen(false);
    setCurrentClient(null);
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
    { accessorKey: "nom", header: ({ column }) => <DataTableColumnHeader column={column} title="Nom du Client" /> },
    { accessorKey: "adresse", header: ({ column }) => <DataTableColumnHeader column={column} title="Adresse" /> },
    { accessorKey: "contact", header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" /> },
    { accessorKey: "telephone", header: ({ column }) => <DataTableColumnHeader column={column} title="Téléphone" /> },
    { accessorKey: "email", header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;
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
              <DropdownMenuItem onClick={() => handleEditClient(client)}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteClient(client)} className="text-red-600 focus:text-red-500 focus:bg-red-100/50 dark:focus:bg-red-900/50">
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [handleEditClient, handleDeleteClient]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground">Gérez les informations de vos clients.</p>
        </div>
        <Button onClick={handleAddClient} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Client
        </Button>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Liste des Clients</CardTitle>
          <CardDescription>Consultez et gérez tous vos clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Chargement des clients...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={clients} filterColumn="nom" />
          )}
        </CardContent>
      </Card>

      <ClientFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleSubmitForm}
        client={currentClient}
      />

      <DeleteClientDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        clientName={clientToDelete?.nom}
      />
    </motion.div>
  );
};

export default ClientSitesPage;