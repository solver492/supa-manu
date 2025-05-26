import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const factureTableColumns = [
  {
    accessorKey: "id",
    header: "N° Facture",
  },
  {
    accessorKey: "client_nom",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.clients;
      return client ? client.nom : 'N/A';
    },
  },
  {
    accessorKey: "date_emission",
    header: "Date Émission",
    cell: ({ row }) => {
      return format(new Date(row.original.date_emission), 'dd/MM/yyyy', { locale: fr });
    },
  },
  {
    accessorKey: "montant",
    header: "Montant TTC",
    cell: ({ row }) => {
      const montantHT = parseFloat(row.original.montant);
      const tauxTVA = parseFloat(row.original.taux_tva);
      const montantTTC = montantHT * (1 + tauxTVA);
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montantTTC);
    },
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statutMap = {
        'non_payee': 'Non payée',
        'payee': 'Payée',
        'annulee': 'Annulée'
      };
      return statutMap[row.original.statut] || row.original.statut;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const facture = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => table.options.meta?.onEdit(facture)}
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => table.options.meta?.onView(facture)}
            >
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => table.options.meta?.onPrint(facture)}
            >
              Imprimer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => table.options.meta?.onDelete(facture)}
              className="text-red-600"
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
