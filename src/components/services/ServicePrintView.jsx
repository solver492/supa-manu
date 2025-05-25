import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const ServicePrintView = React.forwardRef(({ service }, ref) => {
  if (!service) return null;

  return (
    <div ref={ref} className="p-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Fiche de Prestation</h1>
        <p className="text-sm text-gray-500">Mon Auxiliaire Déménagement</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">N° Prestation</h2>
          <p className="text-gray-700">{service.id || 'N/A'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">Date & Heure</h2>
          <p className="text-gray-700">{service.date ? format(parseISO(service.date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr }) : 'N/A'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">Client</h2>
          <p className="text-gray-700">{service.client || 'N/A'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">Type de Prestation</h2>
          <p className="text-gray-700">{service.type || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Adresses</h2>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            <h3 className="font-medium text-gray-600">Départ:</h3>
            <p className="text-gray-700">{service.adresseDepart || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-600">Arrivée:</h3>
            <p className="text-gray-700">{service.adresseArrivee || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">Volume Estimé</h2>
          <p className="text-gray-700">{service.volume ? `${service.volume} m³` : 'N/A'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">Prix Estimé</h2>
          <p className="text-gray-700">{service.prixEstime ? `${service.prixEstime} €` : 'N/A'}</p>
        </div>
         <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-1">Statut</h2>
          <p className="text-gray-700 font-medium">{service.statut || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Ressources Affectées</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          <div>
            <h3 className="font-medium text-gray-600">Équipe:</h3>
            <p className="text-gray-700">{service.equipe || 'Non assignée'}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-600">Véhicule:</h3>
            <p className="text-gray-700">{service.vehicule || 'Non assigné'}</p>
          </div>
           <div>
            <h3 className="font-medium text-gray-600">Manutentionnaires Requis:</h3>
            <p className="text-gray-700">{service.manutentionnairesRequis || 'N/A'}</p>
          </div>
        </div>
      </div>

      {service.notes && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Notes et Instructions</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{service.notes}</p>
        </div>
      )}

      <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        Fiche générée le {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}
      </div>
    </div>
  );
});

ServicePrintView.displayName = 'ServicePrintView';
export default ServicePrintView;