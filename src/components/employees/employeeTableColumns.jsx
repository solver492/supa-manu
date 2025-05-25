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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, MoreHorizontal, MessageSquare } from 'lucide-react';

export const getEmployeeTableColumns = (onEdit, onDelete) => [
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
    accessorKey: "nom", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={row.original.avatar} alt={row.original.nom} />
          <AvatarFallback>{row.original.nom.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <span>{row.original.nom}</span>
      </div>
    )
  },
  { 
    accessorKey: "telephone", 
    header: "Téléphone",
    cell: ({ row }) => {
      const phone = row.original.telephone;
      if (!phone) return 'N/A';
      const whatsappLink = `https://wa.me/${phone.replace(/\s+/g, '')}`;
      return (
        <div className="flex items-center space-x-2">
          <span>{phone}</span>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" title="Contacter sur WhatsApp">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600">
              <MessageSquare size={16} />
            </Button>
          </a>
        </div>
      );
    }
  },
  { accessorKey: "poste", header: ({ column }) => <DataTableColumnHeader column={column} title="Poste" /> },
  { 
    accessorKey: "equipe", 
    header: "Équipe",
    cell: ({ row }) => row.original.poste === "Chef d'équipe" ? row.original.equipe || 'N/A' : 'N/A'
  },
  { 
    accessorKey: "nbManutentionnairesEquipe", 
    header: "Manut. Équipe",
    cell: ({ row }) => row.original.poste === "Chef d'équipe" ? row.original.nbManutentionnairesEquipe || 0 : 'N/A'
  },
  { accessorKey: "disponibilite", header: ({ column }) => <DataTableColumnHeader column={column} title="Disponibilité" /> },
  { 
    accessorKey: "salaireJournalier", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Salaire Journalier" />,
    cell: ({ row }) => `${row.original.salaireJournalier} €`
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(employee)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];