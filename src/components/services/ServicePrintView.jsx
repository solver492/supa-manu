import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Phone, Mail, Calendar, Clock, Users, Euro } from 'lucide-react';

const ServicePrintView = React.forwardRef(({ service }, ref) => {
  if (!service) return null;

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
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
    <div ref={ref} className="bg-white p-6 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center">Fiche de Prestation</h1>
        <p className="text-sm text-gray-500 text-center">{service.id}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Colonne de gauche */}
        <div className="space-y-6">
          {/* Informations Client */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations Client
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{service.nom_client}</p>
              <p className="text-gray-600">{service.telephone_client}</p>
              <p className="text-gray-600">{service.email_client}</p>
            </div>
          </div>

          {/* Adresse */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse d'intervention
            </h2>
            <p>{service.adresse || 'Non spécifiée'}</p>
          </div>

          {/* Prix */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Prix de la prestation
            </h2>
            <p className="text-xl font-bold">{service.prix ? `${service.prix}€` : 'Non spécifié'}</p>
          </div>
        </div>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Détails de l'Intervention */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">
              Détails de l'Intervention
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Type de Prestation</p>
                <p className="font-medium">{service.type_prestation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de Prestation</p>
                <p className="font-medium">{formatDate(service.date_prestation)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Durée estimée</p>
                <p className="font-medium">{service.duree_estimee ? `${service.duree_estimee}h` : 'Non spécifiée'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">{formatStatus(service.statut)}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Équipe</p>
                  <div className="mt-1 space-y-1">
                    <p className="font-medium">{service.nombre_employes || 0} employé{service.nombre_employes > 1 ? 's' : ''} requis</p>
                    <p className="font-medium">{service.nombre_manutentionnaires || 0} manutentionnaire{service.nombre_manutentionnaires > 1 ? 's' : ''}</p>
                  </div>
                </div>
                {service.vehicules_requis && (
                  <div>
                    <p className="text-sm text-gray-500">Véhicules</p>
                    <p className="font-medium mt-1">{service.vehicules_requis}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description et Notes */}
      <div className="border rounded-lg p-4 mt-6">
        <h2 className="text-lg font-semibold mb-3">Informations détaillées</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{service.description || 'Aucune description'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Détails Supplémentaires</p>
            <p className="font-medium">{service.details_prestation || 'Aucun détail supplémentaire'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="font-medium">{service.notes || 'Aucune note'}</p>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-8 pt-4 border-t text-sm text-gray-500 text-center">
        <p>Fiche générée le {format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
      </div>
    </div>
  );
});

ServicePrintView.displayName = 'ServicePrintView';
export default ServicePrintView;