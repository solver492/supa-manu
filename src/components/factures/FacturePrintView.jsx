import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const FacturePrintView = React.forwardRef(({ facture }, ref) => {
  if (!facture) return null;

  const formatDate = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      return format(new Date(year, month - 1, day), "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">FACTURE</h1>
        <p className="text-sm text-gray-500 text-center">N° {facture.id}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Informations de l'entreprise */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Mon Auxiliaire Déménagement</h2>
          <p className="text-sm text-gray-600">
            123 Rue du Déménagement<br />
            75000 Paris<br />
            Tél : 01 23 45 67 89<br />
            Email : contact@monauxiliaire.com
          </p>
        </div>

        {/* Informations du client */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Facturé à</h2>
          <p className="text-sm text-gray-600">
            {facture.client?.nom || "Client non spécifié"}<br />
            {facture.client?.adresse || ""}<br />
            {facture.client?.telephone || ""}<br />
            {facture.client?.email || ""}
          </p>
        </div>
      </div>

      {/* Détails de la facture */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Date d'émission</p>
            <p className="font-medium">{formatDate(facture.date_emission)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <p className="font-medium">{facture.statut === 'non_payee' ? 'Non payée' : facture.statut === 'payee' ? 'Payée' : 'Annulée'}</p>
          </div>
        </div>
      </div>

      {/* Détails de la prestation */}
      {facture.prestation && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Détails de la prestation</h3>
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">
                  {facture.prestation.type_prestation}<br />
                  <span className="text-sm text-gray-500">
                    Date de prestation : {formatDate(facture.prestation.date_prestation)}
                  </span>
                </td>
                <td className="text-right py-2">{formatMontant(facture.montant)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Total et TVA */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span>Sous-total HT</span>
          <span>{formatMontant(parseFloat(facture.montant))}</span>
        </div>
        {parseFloat(facture.taux_tva) > 0 && (
          <div className="flex justify-between items-center">
            <span>TVA ({(parseFloat(facture.taux_tva) * 100).toFixed(0)}%)</span>
            <span>{formatMontant(parseFloat(facture.montant) * parseFloat(facture.taux_tva))}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t">
          <span>Total TTC</span>
          <span>10</span>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-12 pt-8 border-t text-sm text-gray-500">
        <p className="text-center">
          Mon Auxiliaire Déménagement - SIRET : 123 456 789 00000<br />
          TVA non applicable, art. 293 B du CGI
        </p>
      </div>
    </div>
  );
});

FacturePrintView.displayName = 'FacturePrintView';
export default FacturePrintView;