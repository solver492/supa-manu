
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Phone, Mail } from 'lucide-react';
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
            <div className="text-sm text-muted-foreground">{employee.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'poste',
    header: 'Poste',
    cell: ({ row }) => {
      const poste = row.getValue('poste');
      return (
        <Badge variant="outline" className="font-medium">
          {poste}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'equipe',
    header: 'Équipe',
    cell: ({ row }) => {
      const equipe = row.getValue('equipe');
      return (
        <Badge variant="secondary">
          {equipe}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'telephone',
    header: 'Contact',
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1" />
            {employee.telephone}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-3 w-3 mr-1" />
            {employee.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'disponibilite',
    header: 'Disponibilité',
    cell: ({ row }) => {
      const disponibilite = row.getValue('disponibilite');
      const variant = disponibilite === 'Disponible' ? 'default' : 
                    disponibilite === 'Occupé' ? 'destructive' : 'secondary';
      return (
        <Badge variant={variant}>
          {disponibilite}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'salaire_journalier',
    header: 'Salaire/jour',
    cell: ({ row }) => {
      const salaire = row.getValue('salaire_journalier');
      return salaire ? `${parseFloat(salaire).toFixed(2)} €` : 'Non défini';
    },
  },
  {
    accessorKey: 'date_embauche',
    header: 'Date d\'embauche',
    cell: ({ row }) => {
      const date = row.getValue('date_embauche');
      if (!date) return 'Non définie';
      try {
        return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
      } catch {
        return 'Date invalide';
      }
    },
  },
  {
    accessorKey: 'actif',
    header: 'Statut',
    cell: ({ row }) => {
      const actif = row.getValue('actif');
      return (
        <Badge variant={actif ? 'default' : 'secondary'}>
          {actif ? 'Actif' : 'Inactif'}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(employee)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
