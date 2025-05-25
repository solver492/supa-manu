import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { format, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';

const InvoiceViewDialog = ({ isOpen, onClose, invoice, onPrint, printRef }) => {
  if (!invoice) return null;
  
  const getStatusClass = (status) => {
    switch (status) {
      case "Payée": return "status-paid";
      case "En attente": return "status-pending";
      case "En retard": return "status-overdue";
      default: return "";
    }
  };

  // Use client name from the main invoice object (populated from join), fallback to nested clients object
  const clientName = invoice.clientNom || invoice.clients?.nom || 'Client Inconnu';
  const clientAddress = invoice.clients?.adresse || 'Adresse non disponible';
  const clientEmail = invoice.clients?.email || 'Email non disponible';
  const prestationType = invoice.prestations?.type_prestation || 'Détails non disponibles';
  const prestationId = invoice.prestation_id ? invoice.prestation_id.substring(0,8) + '...' : 'N/A';


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Facture N° {invoice.numero_facture || invoice.id}</DialogTitle>
          <DialogDescription>
            Détails de la facture pour {clientName}. Statut: <span className={getStatusClass(invoice.statut)}>{invoice.statut}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div ref={printRef} id="invoice-print-content" className="invoice-box my-4 p-6 bg-white rounded-lg text-gray-800">
          <style type="text/css">
            {`
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; color: #555; }
              .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
              .invoice-box table td { padding: 5px; vertical-align: top; }
              .invoice-box table tr td:nth-child(2), .invoice-box table tr td:nth-child(3) { text-align: right; }
              .invoice-box table tr.top table td { padding-bottom: 20px; }
              .invoice-box table tr.top table td.title { font-size: 30px; line-height: 30px; color: #333; }
              .invoice-box table tr.information table td { padding-bottom: 40px; }
              .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; text-align:left; }
              .invoice-box table tr.heading td:nth-child(2), .invoice-box table tr.heading td:nth-child(3) { text-align: right; }
              .invoice-box table tr.details td { padding-bottom: 20px; }
              .invoice-box table tr.item td { border-bottom: 1px solid #eee; text-align:left; }
              .invoice-box table tr.item td:nth-child(2),.invoice-box table tr.item td:nth-child(3) { text-align: right; }
              .invoice-box table tr.item.last td { border-bottom: none; }
              .invoice-box table tr.total td:nth-child(2), .invoice-box table tr.total td:nth-child(3) { border-top: 2px solid #eee; font-weight: bold; text-align: right; }
              .company-details, .client-details { margin-bottom: 20px; }
              .status-paid { color: green; font-weight: bold; } .status-pending { color: orange; font-weight: bold; } .status-overdue { color: red; font-weight: bold; }
              h1.main-title {color: #5E35B1; margin-bottom:0px;}
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0;}
                .invoice-box { box-shadow: none; border: none; margin: 0; padding:0; width: 100%;}
                .no-print { display: none !important; }
              }
            `}
          </style>
          <table cellPadding="0" cellSpacing="0">
            <tr className="top">
              <td colSpan="3">
                <table>
                  <tr>
                    <td className="title">
                      <h1 className="main-title">Mon Auxiliaire Déménagement</h1>
                    </td>
                    <td style={{textAlign: 'right'}}>
                      Facture #: {invoice.numero_facture || invoice.id}<br />
                      Date d'émission: {format(parseISO(invoice.date_emission), "dd/MM/yyyy", { locale: fr })}<br />
                      Date d'échéance: {invoice.date_echeance ? format(parseISO(invoice.date_echeance), "dd/MM/yyyy", { locale: fr }) : 'N/A'}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr className="information">
              <td colSpan="3">
                <table>
                  <tr>
                    <td className="company-details">
                      Mon Auxiliaire Déménagement SARL<br />
                      123 Rue de la Mobilité<br />
                      75000 Paris, France<br />
                      contact@auxiliaire-dem.fr
                    </td>
                    <td className="client-details" style={{textAlign: 'right'}}>
                      <strong>Facturé à:</strong><br />
                      {clientName}<br />
                      {clientAddress}<br />
                      {clientEmail}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr className="heading">
              <td>Description</td>
              <td style={{textAlign: 'right'}}>Prix U. HT</td>
              <td style={{textAlign: 'right'}}>Total HT</td>
            </tr>
            <tr className="item">
              <td>
                Prestation: {prestationType} (Réf: {prestationId})<br/>
                <small>Pour: {clientName}</small>
              </td>
              <td style={{textAlign: 'right'}}>{Number(invoice.montant_ht || 0).toFixed(2)} €</td>
              <td style={{textAlign: 'right'}}>{Number(invoice.montant_ht || 0).toFixed(2)} €</td>
            </tr>
            {/* Add more items here if needed */}
            <tr className="total">
              <td colSpan="2"></td>
              <td style={{textAlign: 'right'}}>Sous-total HT: {Number(invoice.montant_ht || 0).toFixed(2)} €</td>
            </tr>
            <tr className="total">
              <td colSpan="2"></td>
              <td style={{textAlign: 'right'}}>TVA ({Number(invoice.taux_tva || 0) * 100}%): {Number(invoice.montant_tva || 0).toFixed(2)} €</td>
            </tr>
            <tr className="total">
              <td colSpan="2"></td>
              <td style={{textAlign: 'right'}}><strong>Total TTC: {Number(invoice.montant_ttc || 0).toFixed(2)} €</strong></td>
            </tr>
          </table>
          {invoice.notes && (
            <div style={{ marginTop: '20px', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
          <div style={{marginTop: '30px', fontSize: '12px', textAlign: 'center'}}>
            Merci pour votre confiance.<br/>
            Conditions de paiement: 30 jours nets sauf accord contraire.
          </div>
        </div>

        <DialogFooter className="no-print">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button onClick={onPrint} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewDialog;