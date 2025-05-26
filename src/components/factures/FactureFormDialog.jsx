import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const FactureFormDialog = ({ isOpen, onClose, onSubmit, facture: initialFacture, prestation }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_id: "",
    prestation_id: "",
    montant: "0",
    date_emission: format(new Date(), 'yyyy-MM-dd'),
    date_echeance: format(new Date(), 'yyyy-MM-dd'),
    statut: "en_attente",
    taux_tva: "0.20", // 20% par défaut
    notes: "",
    numero: ""
  });

  const [clients, setClients] = useState([]);
  const [prestations, setPrestations] = useState([]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, nom').order('nom');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients",
        variant: "destructive"
      });
    }
  };

  const fetchPrestations = async () => {
    try {
      const { data, error } = await supabase
        .from('prestations')
        .select(`
          id, 
          type_prestation, 
          date_prestation, 
          prix,
          client_id,
          clients(nom)
        `)
        .order('date_prestation', { ascending: false });
      if (error) throw error;
      setPrestations(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des prestations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des prestations",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchPrestations();
      if (initialFacture) {
        setFormData({
          ...initialFacture,
          client_id: initialFacture.client_id || "",
          prestation_id: initialFacture.prestation_id || "",
          date_emission: format(new Date(initialFacture.date_emission), 'yyyy-MM-dd'),
          date_echeance: initialFacture.date_echeance
            ? format(new Date(initialFacture.date_echeance), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          taux_tva: initialFacture.taux_tva || 0.20, // S'assurer que taux_tva est défini
          montant: initialFacture.montant?.toString() || ""
        });
      } else if (prestation) {
        setFormData(prev => ({
          ...prev,
          prestation_id: prestation.id,
          client_id: prestation.client_id,
          montant: prestation.montant?.toString() || "",
          taux_tva: 0.20 // Valeur par défaut pour nouvelle facture
        }));
      } else {
        setFormData({
          client_id: '',
          prestation_id: '',
          montant: '',
          date_emission: format(new Date(), 'yyyy-MM-dd'),
          statut: 'non_payee',
          notes: '',
          numero: ''
        });
      }
    }
  }, [isOpen, initialFacture, prestation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation de base
    if (!formData.client_id || !formData.montant) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Convertir et valider les montants
      const montant = parseFloat(formData.montant);
      const taux_tva = parseFloat(formData.taux_tva);

      if (isNaN(montant) || montant <= 0) {
        toast.error("Le montant doit être un nombre positif");
        return;
      }

      if (isNaN(taux_tva) || taux_tva < 0 || taux_tva > 1) {
        toast.error("Le taux de TVA doit être entre 0 et 1 (ex: 0.20 pour 20%)");
        return;
      }

      // Calculer le montant TTC
      const montantTTC = montant * (1 + taux_tva);

      const payload = {
        ...formData,
        montant: montant.toFixed(2),
        taux_tva: taux_tva.toFixed(2),
        montant_ttc: montantTTC.toFixed(2)
      };

      if (initialFacture) {
        const { error } = await supabase
          .from('factures')
          .update(payload)
          .eq('id', initialFacture.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('factures')
          .insert([payload]);
        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: initialFacture ? "Facture mise à jour" : "Facture créée",
      });
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la facture: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1c1e] text-white p-6 rounded-lg max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-2">
            {initialFacture ? 'Modifier la facture' : 'Créer une Nouvelle Facture'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 mb-4">
            Renseignez les détails de la nouvelle facture.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Numéro de Facture</Label>
              <Input
                id="numero"
                type="text"
                className="bg-[#2a2d2f] border-gray-700"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="FA-20250525-001"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
              >
                <SelectTrigger className="bg-[#2a2d2f] border-gray-700">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestation_id">Prestation Associée</Label>
              <Select 
                value={formData.prestation_id} 
                onValueChange={(value) => setFormData({ ...formData, prestation_id: value })}
              >
                <SelectTrigger className="bg-[#2a2d2f] border-gray-700">
                  <SelectValue placeholder="Sélectionner une prestation (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {prestations.map(prestation => (
                    <SelectItem key={prestation.id} value={prestation.id}>
                      {prestation.clients?.nom || 'Client non spécifié'} - {prestation.type_prestation} - {format(new Date(prestation.date_prestation), 'dd/MM/yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date d'Émission</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-[#2a2d2f] border-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_emission ? format(new Date(formData.date_emission), 'dd MMMM yyyy', { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.date_emission)}
                    onSelect={(date) => setFormData({ ...formData, date_emission: format(date, 'yyyy-MM-dd') })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant HT (€)</Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                min="0"
                required
                className="bg-[#2a2d2f] border-gray-700"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taux_tva">Taux TVA (ex: 0.20 pour 20%)</Label>
                <Input
                  id="taux_tva"
                  name="taux_tva"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.taux_tva}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Montant TVA (€) (calculé)</Label>
                <Input
                  value={new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(formData.montant || 0) * parseFloat(formData.taux_tva || 0))}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Montant TTC (€) (calculé)</Label>
              <Input
                type="text"
                className="bg-[#2a2d2f] border-gray-700"
                value={formData.montant ? (parseFloat(formData.montant) * (1 + parseFloat(formData.taux_tva || 0))).toFixed(2) : '0.00'}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={formData.statut} 
                onValueChange={(value) => setFormData({ ...formData, statut: value })}
              >
                <SelectTrigger className="bg-[#2a2d2f] border-gray-700">
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_payee">En attente</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-700 bg-[#2a2d2f] text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes ou commentaires supplémentaires..."
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 hover:bg-gray-800"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {initialFacture ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FactureFormDialog;
