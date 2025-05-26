import React, { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Users, DollarSign, Box } from 'lucide-react';
import { format, parseISO, setHours, setMinutes, isValid } from "date-fns";
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const serviceTypes = ["Déménagement Particulier", "Transfert Entreprise", "Garde-meuble", "Location Monte-Meuble", "Autre"];
const serviceStatusOptions = ["Planifiée", "Confirmée", "En cours", "Terminée", "Annulée", "Reportée"];

const ServiceFormDialog = ({ isOpen, onClose, onSubmit, service: initialService }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_id: '',
    type_prestation: serviceTypes[0],
    description: '',
    date_prestation: new Date().toISOString(),
    time_prestation: '09:00',
    statut: 'en_attente',
    adresse: '',
    nom_client: '',
    telephone_client: '',
    email_client: '',
    details_prestation: '',
    prix: '',
    duree_estimee: 4,
    nombre_employes: 2,
    nombre_manutentionnaires: 0,
    vehicules_requis: [],
    notes: ''
  });

  const [clients, setClients] = useState([]);
  // const [employees, setEmployees] = useState([]); // For team assignment
  // const [vehicles, setVehicles] = useState([]); // For vehicle assignment

  const fetchRelatedData = useCallback(async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id, nom').order('nom');
      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Add fetching for employees (chefs d'equipe) and vehicles if those features are ready
    } catch (error) {
      console.error("Error fetching related data for service form:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de charger les clients.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchRelatedData();
      if (initialService) {
        const serviceDate = initialService.date_prestation && isValid(parseISO(initialService.date_prestation)) ? parseISO(initialService.date_prestation) : new Date();
        setFormData({
          client_id: initialService.client_id || '',
          type_prestation: initialService.type_prestation || serviceTypes[0],
          description: initialService.description || '',
          date_prestation: serviceDate.toISOString(),
          time_prestation: format(serviceDate, "HH:mm"),
          statut: initialService.statut || 'en_attente',
          adresse: initialService.adresse || '',
          nom_client: initialService.nom_client || '',
          telephone_client: initialService.telephone_client || '',
          email_client: initialService.email_client || '',
          details_prestation: initialService.details_prestation || '',
          prix: initialService.prix || '',
          duree_estimee: initialService.duree_estimee || 4,
          nombre_employes: initialService.nombre_employes || 2,
          nombre_manutentionnaires: initialService.nombre_manutentionnaires || 0,
          vehicules_requis: initialService.vehicules_requis || [],
          notes: initialService.notes || ''
        });
      } else {
        setFormData({
          client_id: '',
          type_prestation: serviceTypes[0],
          description: '',
          date_prestation: new Date().toISOString(),
          time_prestation: '09:00',
          statut: 'en_attente',
          adresse: '',
          nom_client: '',
          telephone_client: '',
          email_client: '',
          details_prestation: '',
          prix: '',
          duree_estimee: 4,
          nombre_employes: 2,
          nombre_manutentionnaires: 0,
          vehicules_requis: [],
          notes: ''
        });
      }
    }
  }, [initialService, isOpen, fetchRelatedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate) => {
    if (selectedDate && isValid(selectedDate)) {
      setFormData(prev => ({ ...prev, date_prestation: selectedDate.toISOString() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let combinedDateTime = new Date();
    if (formData.date_prestation && isValid(parseISO(formData.date_prestation))) {
        combinedDateTime = parseISO(formData.date_prestation);
    }
    
    const [hours, minutes] = formData.time_prestation.split(':');
    combinedDateTime = setHours(combinedDateTime, parseInt(hours, 10));
    combinedDateTime = setMinutes(combinedDateTime, parseInt(minutes, 10));
    
    const payload = {
      client_id: formData.client_id || null,
      type_prestation: formData.type_prestation,
      description: formData.description || null,
      date_prestation: combinedDateTime.toISOString(),
      statut: formData.statut,
      adresse: formData.adresse || null,
      nom_client: formData.nom_client || null,
      telephone_client: formData.telephone_client || null,
      email_client: formData.email_client || null,
      details_prestation: formData.details_prestation || null,
      prix: formData.prix ? parseFloat(formData.prix) : null,
      duree_estimee: formData.duree_estimee ? parseInt(formData.duree_estimee) : null,
      nombre_employes: formData.nombre_employes ? parseInt(formData.nombre_employes) : null,
      nombre_manutentionnaires: formData.nombre_manutentionnaires ? parseInt(formData.nombre_manutentionnaires) : null,
      vehicules_requis: formData.vehicules_requis || [],
      notes: formData.notes || null
    };
    
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialService ? "Modifier la Prestation" : "Planifier une Nouvelle Prestation"}</DialogTitle>
          <DialogDescription>
            {initialService ? "Modifiez les détails de la prestation." : "Remplissez les détails pour planifier une nouvelle prestation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select name="client_id" value={formData.client_id} onValueChange={(value) => handleSelectChange('client_id', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom_client">Nom du Client</Label>
              <Input
                id="nom_client"
                name="nom_client"
                value={formData.nom_client}
                onChange={handleChange}
                placeholder="Nom du client"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone_client">Téléphone</Label>
              <Input
                id="telephone_client"
                name="telephone_client"
                value={formData.telephone_client}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_client">Email</Label>
              <Input
                id="email_client"
                name="email_client"
                type="email"
                value={formData.email_client}
                onChange={handleChange}
                placeholder="Email du client"
              />
            </div>

            <div>
              <Label htmlFor="type_prestation">Type de Prestation *</Label>
              <Select name="type_prestation" value={formData.type_prestation} onValueChange={(value) => handleSelectChange('type_prestation', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description de la prestation</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ex: Déménagement appartement T3, 2ème étage sans ascenseur..."
              />
            </div>

            <div>
              <Label htmlFor="date_prestation">Date de la Prestation *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_prestation && isValid(parseISO(formData.date_prestation)) ? format(parseISO(formData.date_prestation), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.date_prestation && isValid(parseISO(formData.date_prestation)) ? parseISO(formData.date_prestation) : new Date()} onSelect={handleDateChange} initialFocus locale={fr} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time_prestation">Heure de Début *</Label>
              <Input id="time_prestation" name="time_prestation" type="time" value={formData.time_prestation} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Adresse complète"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duree_estimee">Durée Estimée (heures)</Label>
              <Input
                id="duree_estimee"
                name="duree_estimee"
                type="number"
                value={formData.duree_estimee}
                onChange={handleChange}
                min="1"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="nombre_employes"><Users className="inline-block mr-2 h-4 w-4 text-primary" />Nombre d'employés requis</Label>
              <Input
                id="nombre_employes"
                name="nombre_employes"
                type="number"
                value={formData.nombre_employes}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_manutentionnaires"><Users className="inline-block mr-2 h-4 w-4 text-primary" />Nombre de manutentionnaires</Label>
              <Input
                id="nombre_manutentionnaires"
                name="nombre_manutentionnaires"
                type="number"
                value={formData.nombre_manutentionnaires}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prix">Prix (€)</Label>
              <Input
                id="prix"
                name="prix"
                type="number"
                value={formData.prix}
                onChange={handleChange}
                min="0"
                step="10"
              />
            </div>

            <div>
              <Label htmlFor="statut">Statut *</Label>
              <Select name="statut" value={formData.statut} onValueChange={(value) => handleSelectChange('statut', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                <SelectContent>
                  {serviceStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="details_prestation">Détails Supplémentaires</Label>
              <Textarea
                id="details_prestation"
                name="details_prestation"
                value={formData.details_prestation}
                onChange={handleChange}
                placeholder="Détails supplémentaires sur la prestation..."
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes internes..."
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{initialService ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;