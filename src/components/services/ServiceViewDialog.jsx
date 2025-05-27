import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';
import { Users, MapPin, Calendar, Clock, Phone, Mail, FileText, Euro } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ServiceViewDialog = ({ isOpen, onClose, service }) => {
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (service?.client_id) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', service.client_id)
          .single();
          
        if (!error && data) {
          setClientData(data);
        }
      }
    };
    
    if (service?.client_id) {
      fetchClientData();
    }
  }, [service]);

  if (!service) return null;

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Non défini";
    return `${price}€`;
  };

  const formatStatus = (status) => {
    const statusMap = {
      en_attente: "En attente",
      confirmee: "Confirmée",
      en_cours: "En cours",
      terminee: "Terminée",
      annulee: "Annulée",
      reportee: "Reportée"
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{service.type_prestation}</span>
              <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                {formatStatus(service.statut)}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Client: {clientData?.nom || "Non spécifié"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informations Client */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Informations Client
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-primary/5 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Client (Site)</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {clientData?.nom || "Non spécifié"}
                  </p>
                  {clientData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {clientData.adresse || "Adresse non spécifiée"}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-primary/5 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Contact</h4>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="h-4 w-4" />
                      {service.telephone_client || "Non spécifié"}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="h-4 w-4" />
                      {service.email_client || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de l'Intervention */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Détails de l'Intervention
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-primary/5 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Type de Prestation</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {service.type_prestation}
                  </p>
                </div>

                <div className="p-3 bg-primary/5 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Date et Durée</h4>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="h-4 w-4" />
                      {formatDate(service.date_prestation)}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock className="h-4 w-4" />
                      Durée estimée : {service.duree_estimee ? `${service.duree_estimee}h` : 'Non spécifiée'}
                    </p>
                  </div>
                </div>


                <div className="p-3 bg-primary/5 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Équipe</h4>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Users className="h-4 w-4" />
                      {service.nombre_employes} employé{service.nombre_employes > 1 ? 's' : ''} requis
                    </p>
                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Users className="h-4 w-4" />
                      {service.nombre_manutentionnaires} manutentionnaire{service.nombre_manutentionnaires > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Adresse d'intervention
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {service.adresse || "Non spécifiée"}
            </p>
          </div>

          {/* Description et Notes */}
          <div className="space-y-3">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informations détaillées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {service.description || "Aucune description"}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Détails Supplémentaires</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {service.details_prestation || "Aucun détail supplémentaire"}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Notes</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {service.notes || "Aucune note"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              Prix de la prestation
            </h3>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(service.prix)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceViewDialog;
