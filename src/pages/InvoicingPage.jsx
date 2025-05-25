import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, Eye, Edit, Trash2, MoreHorizontal, Printer } from 'lucide-react';
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
import InvoiceFormDialog from "@/components/invoices/InvoiceFormDialog";
import DeleteInvoiceDialog from "@/components/invoices/DeleteInvoiceDialog";
import InvoiceViewDialog from "@/components/invoices/InvoiceViewDialog"; 
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';


const InvoicingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const printRef = useRef();


  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: () => `Facture-${invoiceToView?.numero_facture || invoiceToView?.id?.substring(0,8) || 'details'}`,
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('factures')
      .select('*, clients(id, nom, adresse, email), prestations(id, type_prestation)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      toast({ title: "Erreur", description: "Impossible de charger les factures.", variant: "destructive" });
      setInvoices([]);
    } else {
       const formattedInvoices = data.map(inv => ({
        ...inv,
        clientNom: inv.clients?.nom || 'Client Inconnu',
      }));
      setInvoices(formattedInvoices);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAddInvoice = () => {
    setCurrentInvoice(null);
    setIsFormDialogOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setIsFormDialogOpen(true);
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setInvoiceToView(invoice);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    const { error } = await supabase
      .from('factures')
      .delete()
      .eq('id', invoiceToDelete.id);

    if (error) {
      toast({ title: "Erreur de suppression", description: `Impossible de supprimer la facture ${invoiceToDelete.numero_facture || invoiceToDelete.id}: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Facture supprimée", description: `La facture ${invoiceToDelete.numero_facture || invoiceToDelete.id} a été supprimée.` });
      fetchInvoices();
    }
    setIsDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const handleSubmitForm = async (invoiceData) => {
    let result;
    const payload = {
        numero_facture: invoiceData.numero_facture,
        client_id: invoiceData.client_id,
        prestation_id: invoiceData.prestation_id || null,
        date_emission: invoiceData.date_emission,
        date_echeance: invoiceData.date_echeance || null,
        montant_ht: invoiceData.montant_ht,
        taux_tva: invoiceData.taux_tva,
        statut: invoiceData.statut,
        notes: invoiceData.notes || null,
    };

    if (currentInvoice && currentInvoice.id) {
      payload.updated_at = new Date().toISOString();
      result = await supabase.from('factures').update(payload).eq('id', currentInvoice.id).select('*, clients(nom)');
    } else {
      result = await supabase.from('factures').insert([payload]).select('*, clients(nom)');
    }
    
    const { data, error } = result;

    if (error) {
      toast({ title: "Erreur d'enregistrement", description: `Impossible de sauvegarder la facture: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: currentInvoice ? "Facture modifiée" : "Facture créée", description: `La facture ${data[0].numero_facture} a été sauvegardée.` });
      fetchInvoices();
    }
    setIsFormDialogOpen(false);
    setCurrentInvoice(null);
  };
  
  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (<Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Tout sélectionner"/>),
      cell: ({ row }) => (<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Sélectionner ligne"/>),
      enableSorting: false, enableHiding: false,
    },
    { accessorKey: "numero_facture", header: ({ column }) => <DataTableColumnHeader column={column} title="N° Facture" /> },
    { accessorKey: "clientNom", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />, cell: ({row}) => row.original.clients?.nom || row.original.clientNom || "N/A" },
    { 
      accessorKey: "date_emission", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date Émission" />, 
      cell: ({ row }) => row.original.date_emission && isValid(parseISO(row.original.date_emission)) ? format(parseISO(row.original.date_emission), "dd/MM/yyyy", { locale: fr }) : 'Date invalide'
    },
    { 
      accessorKey: "montant_ttc", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant TTC" />, 
      cell: ({ row }) => `${Number(row.original.montant_ttc || 0).toFixed(2)} €`
    },
    { accessorKey: "statut", header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => {
        const status = row.original.statut;
        let statusClass = "";
        switch(status) {
          case "Payée": statusClass = "text-green-600 dark:text-green-400"; break;
          case "En attente": statusClass = "text-orange-600 dark:text-orange-400"; break;
          case "En retard": statusClass = "text-red-600 dark:text-red-400"; break;
          default: statusClass = "text-muted-foreground";
        }
        return <span className={`font-semibold ${statusClass}`}>{status}</span>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Ouvrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}><Eye className="mr-2 h-4 w-4" /> Visualiser/Imprimer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice)} className="text-red-600 focus:text-red-500 focus:bg-red-100/50 dark:focus:bg-red-900/50"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [fetchInvoices]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Facturation</h1>
          <p className="text-muted-foreground">Générez, suivez et gérez vos factures clients.</p>
        </div>
        <Button onClick={handleAddInvoice} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Créer une Facture
        </Button>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Liste des Factures</CardTitle>
          <CardDescription>Consultez et gérez toutes vos factures.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Chargement des factures...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={invoices} filterColumn="clientNom" />
          )}
        </CardContent>
      </Card>

      <InvoiceFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleSubmitForm}
        invoice={currentInvoice}
      />

      <DeleteInvoiceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        invoiceId={invoiceToDelete?.numero_facture || invoiceToDelete?.id}
      />

      {isViewDialogOpen && invoiceToView && (
         <InvoiceViewDialog
            isOpen={isViewDialogOpen}
            onClose={() => { setIsViewDialogOpen(false); setInvoiceToView(null);}}
            invoice={invoiceToView}
            onPrint={handlePrint} 
            printRef={printRef}
          />
      )}
    </motion.div>
  );
};

export default InvoicingPage;