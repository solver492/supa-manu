import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Printer, Eye } from 'lucide-react';
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
import ServiceFormDialog from "@/components/services/ServiceFormDialog";
import DeleteServiceDialog from "@/components/services/DeleteServiceDialog";
import ServicePrintView from '@/components/services/ServicePrintView';
import ServiceViewDialog from '@/components/services/ServiceViewDialog';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const printRef = useRef();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('prestations')
        .select('*, clients(id, nom)') // Join with clients table
        // Add joins for employes and vehicules if those foreign keys are in 'prestations'
        // .select('*, clients(id, nom), employes(id, nom, prenom), vehicules(id, immatriculation, type)')
        .order('date_prestation', { ascending: false });

      if (servicesError) throw servicesError;
      
      setServices(servicesData || []);

    } catch (error) {
      console.error("Error fetching prestations:", error);
      toast({ title: "Erreur", description: "Impossible de charger les prestations.", variant: "destructive" });
      setServices([]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddService = () => {
    setCurrentService(null);
    setIsFormDialogOpen(true);
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    setIsFormDialogOpen(true);
  };

  const handleDeleteService = (service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleViewService = useCallback((service) => {
    setCurrentService(service);
    setIsViewDialogOpen(true);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Prestation_${currentService?.id || 'nouvelle'}`,
    onAfterPrint: () => {
      setCurrentService(null);
    },
  });

  const handlePrintService = useCallback((service) => {
    setCurrentService(service);
    setTimeout(handlePrint, 100);
  }, [handlePrint]);

  const handleConfirmDelete = async () => {
    if (!currentService) return;
    const { error } = await supabase
      .from('prestations')
      .delete()
      .eq('id', currentService.id);

    if (error) {
      toast({ title: "Erreur de suppression", description: `Impossible de supprimer la prestation: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Prestation supprimée", description: "La prestation a été supprimée avec succès." });
      fetchData();
    }
    setIsDeleteDialogOpen(false);
    setCurrentService(null);
  };

  const handleSubmitForm = async (serviceData) => {
    let result;
    const payload = { ...serviceData }; // Already formatted in ServiceFormDialog

    if (currentService && currentService.id) {
       result = await supabase.from('prestations').update(payload).eq('id', currentService.id).select('*, clients(nom)');
    } else {
       result = await supabase.from('prestations').insert([payload]).select('*, clients(nom)');
    }
    
    const { data, error } = result;

    if (error) {
      toast({ title: "Erreur d'enregistrement", description: `Impossible de sauvegarder la prestation: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: currentService ? "Prestation modifiée" : "Prestation ajoutée", description: `La prestation pour ${data[0].clients?.nom || 'N/A'} a été sauvegardée.` });
      fetchData();
    }
    setIsFormDialogOpen(false);
    setCurrentService(null);
  };

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (<Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Tout sélectionner" />),
      cell: ({ row }) => (<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Sélectionner la ligne" />),
      enableSorting: false, enableHiding: false,
    },
    { 
      accessorKey: "id", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID Presta" />, 
      cell: ({row}) => <span className="font-mono text-xs">{row.original.id.substring(0,8)}...</span> 
    },
    { 
      accessorKey: "nom_client", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
      cell: ({row}) => row.original.nom_client || 'N/A'
    },
    { 
      accessorKey: "type_prestation", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />
    },
    { 
      accessorKey: "date_prestation", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />, 
      cell: ({ row }) => row.original.date_prestation && isValid(parseISO(row.original.date_prestation)) ? format(parseISO(row.original.date_prestation), "dd/MM/yy HH:mm", { locale: fr }) : 'Date invalide'
    },
    { 
      accessorKey: "statut", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" /> 
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const service = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Ouvrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditService(service)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewService(service)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrintService(service)}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteService(service)} className="text-red-600 focus:text-red-500 focus:bg-red-100/50 dark:focus:bg-red-900/50"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [fetchData]);


  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Prestations</h1>
          <p className="text-muted-foreground">Planifiez et suivez toutes vos prestations.</p>
        </div>
        <Button onClick={handleAddService} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Planifier une Prestation
        </Button>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Liste des Prestations</CardTitle>
          <CardDescription>Visualisez et gérez les prestations planifiées et en cours.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Chargement des prestations...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={services} filterColumn="clients.nom" />
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleSubmitForm}
        service={currentService}
      />

      <DeleteServiceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        service={currentService}
      />
      
      <div className="hidden">
        <ServicePrintView ref={printRef} service={currentService} />
      </div>

      <ServiceViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        service={currentService}
      />
    </motion.div>
  );
};

export default ServicesPage;