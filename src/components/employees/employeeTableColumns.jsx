
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const employeeTableColumns = (onEdit, onDelete) => [
  {
    accessorKey: 'nom',
    header: 'Employé',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatar_url} alt={employee.nom} />
            <AvatarFallback>
              {employee.nom?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employee.nom}</div>
            <div className="text-sm text-muted-foreground">{employee.poste}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Contact',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{employee.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{employee.telephone}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'equipe',
    header: 'Équipe',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div>
          <div className="font-medium">{employee.equipe}</div>
          <div className="text-sm text-muted-foreground">
            {employee.nb_manutentionnaires_equipe} manutentionnaire(s)
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'disponibilite',
    header: 'Disponibilité',
    cell: ({ row }) => {
      const employee = row.original;
      const getStatusColor = (status) => {
        switch (status) {
          case 'Disponible':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          case 'Occupé':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
          case 'En congé':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
          case 'Arrêt maladie':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
      };

      return (
        <Badge variant="secondary" className={getStatusColor(employee.disponibilite)}>
          {employee.disponibilite}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'salaire_journalier',
    header: 'Salaire/jour',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="font-medium">
          {employee.salaire_journalier ? `${parseFloat(employee.salaire_journalier).toFixed(2)} €` : 'N/A'}
        </div>
      );
    },
  },
  {
    accessorKey: 'date_embauche',
    header: 'Date d\'embauche',
    cell: ({ row }) => {
      const employee = row.original;
      return employee.date_embauche ? (
        <div className="text-sm">
          {format(new Date(employee.date_embauche), 'dd/MM/yyyy', { locale: fr })}
        </div>
      ) : 'N/A';
    },
  },
  {
    accessorKey: 'actif',
    header: 'Statut',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <Badge variant={employee.actif ? 'default' : 'secondary'}>
          {employee.actif ? 'Actif' : 'Inactif'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(employee)}
            className="hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(employee)}
            className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
