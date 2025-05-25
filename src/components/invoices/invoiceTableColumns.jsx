import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal, Download } from 'lucide-react';
import { format, parseISO } from "date-fns";
import { fr } from 'date-fns/locale';

export const getInvoiceTableColumns = (onView, onEdit, onDelete) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="N° Facture" /> },
  { accessorKey: "clientNom", header: ({ column }) => <DataTableColumnHeader column={column} title="Client" /> },
  { 
    accessorKey: "dateEmission", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date Émission" />,
    cell: ({ row }) => format(parseISO(row.original.dateEmission), "dd/MM/yyyy", { locale: fr })
  },
  { 
    accessorKey: "montantTTC", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Montant TTC" />,
    cell: ({ row }) => `${row.original.montantTTC.toFixed(2)} €`
  },
  { 
    accessorKey: "statut", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
    cell: ({ row }) => {
      const status = row.original.statut;
      let statusClass = "";
      switch(status) {
        case "Payée": statusClass = "text-green-600 dark:text-green-400"; break;
        case "En attente": statusClass = "text-orange-600 dark:text-orange-400"; break;
        case "En retard": statusClass = "text-red-600 dark:text-red-400"; break;
        default: statusClass = "text-muted-foreground";
      }
      return <span className={`font-semibold ${statusClass}`}>{status}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(invoice)}>
              <Eye className="mr-2 h-4 w-4" /> Visualiser
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(invoice)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView(invoice)}>
              <Download className="mr-2 h-4 w-4" /> Imprimer/Exporter
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(invoice)} className="text-red-600 focus:text-red-500 focus:bg-red-100/50 dark:focus:bg-red-900/50">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];