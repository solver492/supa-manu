import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { FileText } from 'lucide-react';
import { format, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient'; // Import supabase

export const invoiceStatusOptions = ["Payée", "En attente", "En retard", "Partiellement payée", "Annulée"];
export const TVA_RATE = 0.20; // 20%


const InvoiceFormDialog = ({ isOpen, onClose, onSubmit, invoice }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    prestation_id: '',
    date_emission: new Date().toISOString(),
    date_echeance: '',
    montant_ht: 0,
    statut: invoiceStatusOptions[1], // Default to "En attente"
    numero_facture: '',
    taux_tva: TVA_RATE
  });

  const [clients, setClients] = useState([]);
  const [prestations, setPrestations] = useState([]);


  useEffect(() => {
    const fetchDropdownData = async () => {
      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id, nom');
      if (clientsError) console.error("Error fetching clients for invoice form", clientsError);
      else setClients(clientsData || []);

      const { data: prestationsData, error: prestationsError } = await supabase.from('prestations').select('id, type_prestation, client_id, clients(nom)');
      if (prestationsError) console.error("Error fetching prestations for invoice form", prestationsError);
      else {
        const formattedPrestations = prestationsData.map(p => ({
          ...p,
          displayName: `${p.id.substring(0,8)}... (${p.type_prestation}) - Client: ${p.clients?.nom || 'N/A'}`
        }));
        setPrestations(formattedPrestations || []);
      }
    };

    if (isOpen) {
      fetchDropdownData();
      if (invoice) {
        setFormData({
          client_id: invoice.client_id || '',
          prestation_id: invoice.prestation_id || '',
          date_emission: invoice.date_emission ? invoice.date_emission : new Date().toISOString(),
          date_echeance: invoice.date_echeance || '',
          montant_ht: invoice.montant_ht || 0,
          statut: invoice.statut || invoiceStatusOptions[1],
          numero_facture: invoice.numero_facture || '',
          taux_tva: invoice.taux_tva || TVA_RATE,
        });
      } else {
        setFormData({
          client_id: '', prestation_id: '', date_emission: new Date().toISOString(), date_echeance: '', montant_ht: 0, statut: invoiceStatusOptions[1], numero_facture: '', taux_tva: TVA_RATE
        });
      }
    }
  }, [invoice, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date ? date.toISOString().split('T')[0] : '' })); // Store as YYYY-MM-DD
  };

  // TVA and TTC are now generated columns in Supabase, so we don't need to calculate them here for the payload
  // but we can display them for user feedback
  const displayTVA = parseFloat(formData.montant_ht || 0) * parseFloat(formData.taux_tva || TVA_RATE);
  const displayTTC = parseFloat(formData.montant_ht || 0) + displayTVA;


  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      montant_ht: parseFloat(formData.montant_ht),
      taux_tva: parseFloat(formData.taux_tva),
      // Supabase will auto-generate numero_facture if not provided and set up with default or trigger
      // For now, we require it to be manually entered or pre-filled.
    };
     if (!payload.numero_facture && !invoice) { // Only auto-generate for new invoices if not provided
        payload.numero_facture = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`; // Simple unique ID
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{invoice ? "Modifier la Facture" : "Créer une Nouvelle Facture"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Modifiez les détails de la facture." : "Remplissez les détails de la nouvelle facture."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="numero_facture">Numéro de Facture</Label>
              <Input id="numero_facture" name="numero_facture" value={formData.numero_facture} onChange={handleChange} required placeholder={invoice ? "" : "Ex: INV-2025-0001"}/>
            </div>
             <div>
              <Label htmlFor="client_id">Client</Label>
              <Select name="client_id" value={formData.client_id} onValueChange={(value) => handleSelectChange('client_id', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prestation_id">Prestation Associée</Label>
              <Select name="prestation_id" value={formData.prestation_id} onValueChange={(value) => handleSelectChange('prestation_id', value)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une prestation (optionnel)" /></SelectTrigger>
                <SelectContent>
                  {prestations.map(p => <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_emission">Date d'Émission</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <FileText className="mr-2 h-4 w-4" />
                    {formData.date_emission ? format(parseISO(formData.date_emission), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.date_emission ? parseISO(formData.date_emission) : null} onSelect={(date) => handleDateChange('date_emission', date)} initialFocus locale={fr}/>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="date_echeance">Date d'Échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <FileText className="mr-2 h-4 w-4" />
                    {formData.date_echeance ? format(parseISO(formData.date_echeance), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.date_echeance ? parseISO(formData.date_echeance) : null} onSelect={(date) => handleDateChange('date_echeance', date)} initialFocus locale={fr}/>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="montant_ht">Montant HT (€)</Label>
              <Input id="montant_ht" name="montant_ht" type="number" step="0.01" value={formData.montant_ht} onChange={handleChange} required />
            </div>
             <div>
              <Label htmlFor="taux_tva">Taux TVA (ex: 0.20 pour 20%)</Label>
              <Input id="taux_tva" name="taux_tva" type="number" step="0.01" value={formData.taux_tva} onChange={handleChange} required />
            </div>
            <div>
              <Label>Montant TVA (€) (calculé)</Label>
              <Input value={displayTVA.toFixed(2)} disabled />
            </div>
            <div>
              <Label>Montant TTC (€) (calculé)</Label>
              <Input value={displayTTC.toFixed(2)} disabled />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select name="statut" value={formData.statut} onValueChange={(value) => handleSelectChange('statut', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                <SelectContent>
                  {invoiceStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">{invoice ? "Sauvegarder" : "Créer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormDialog;