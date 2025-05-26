import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { User, Calendar, Euro, FileText } from 'lucide-react';

const FactureViewDialog = ({ isOpen, onClose, facture }) => {
  if (!facture) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  const formatStatus = (status) => {
    const statusMap = {
      'non_payee': "Non payée",
      'payee': "Payée",
      'annulee': "Annulée"
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Facture {facture.id}</span>
              <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                {formatStatus(facture.statut)}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Informations Client */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations Client
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                {facture.clients?.nom || "Client non spécifié"}
              </p>
            </div>
          </div>

          {/* Détails de la Facture */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Détails de la Facture
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Date d'émission</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(facture.date_emission)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-3">Montant</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Montant HT</span>
                    <span className="font-bold text-primary">
                      {formatMontant(parseFloat(facture.montant))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">TVA ({(parseFloat(facture.taux_tva || 0) * 100).toFixed(0)}%)</span>
                    <span className="font-bold text-primary">
                      {formatMontant(parseFloat(facture.montant || 0) * parseFloat(facture.taux_tva || 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium">Montant TTC</span>
                    <span className="text-lg font-bold text-primary flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {formatMontant(parseFloat(facture.montant || 0) * (1 + parseFloat(facture.taux_tva || 0)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prestation Associée */}
          {facture.prestations && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <h3 className="font-semibold">Prestation Associée</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Type : </span>
                  {facture.prestations.type_prestation}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date : </span>
                  {formatDate(facture.prestations.date_prestation)}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FactureViewDialog;
