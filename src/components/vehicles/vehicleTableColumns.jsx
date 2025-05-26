
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Disponible':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'En mission':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'En maintenance':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'Hors service':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'En réparation':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const getVehicleTableColumns = (onEdit, onDelete) => [
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
  { 
    accessorKey: "immatriculation", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Immatriculation" />,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("immatriculation")}</div>
    ),
  },
  { 
    accessorKey: "type", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" /> 
  },
  {
    accessorKey: "marque",
    header: "Marque",
    cell: ({ row }) => row.original.marque || "N/A",
  },
  {
    accessorKey: "modele", 
    header: "Modèle",
    cell: ({ row }) => row.original.modele || "N/A",
  },
  { 
    accessorKey: "etat", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="État" />,
    cell: ({ row }) => {
      const status = row.getValue("etat");
      return (
        <Badge className={getStatusBadgeColor(status)} variant="secondary">
          {status}
        </Badge>
      );
    },
  },
  { 
    accessorKey: "capacite", 
    header: "Capacité",
    cell: ({ row }) => row.getValue("capacite") || "N/A",
  },
  { 
    accessorKey: "prochaineMaintenance", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Proch. Maintenance" />,
    cell: ({ row }) => {
      const date = row.getValue("prochaineMaintenance");
      if (!date) return "N/A";
      
      const maintenanceDate = new Date(date);
      const today = new Date();
      const diffDays = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
      
      let textColor = "";
      if (diffDays < 0) {
        textColor = "text-red-600 font-medium"; // Maintenance en retard
      } else if (diffDays <= 7) {
        textColor = "text-orange-600 font-medium"; // Maintenance dans moins d'une semaine
      } else if (diffDays <= 30) {
        textColor = "text-yellow-600"; // Maintenance dans moins d'un mois
      }
      
      return (
        <span className={textColor}>
          {maintenanceDate.toLocaleDateString('fr-FR')}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicle = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(vehicle)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(vehicle)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
