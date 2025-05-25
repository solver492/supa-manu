
import React from 'react';
import { LayoutDashboard, Users, Truck, FileText, CalendarDays, BarChart3, Building2 } from 'lucide-react';

export const navLinks = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Sites Clients',
    path: '/sites-clients',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: 'Prestations',
    path: '/prestations',
    icon: <Truck className="h-5 w-5" />, 
  },
  {
    label: 'Employés',
    path: '/employes',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Véhicules',
    path: '/vehicules',
    icon: <Truck className="h-5 w-5" />, 
  },
  {
    label: 'Facturation',
    path: '/facturation',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Calendrier',
    path: '/calendrier',
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    label: 'Rapports',
    path: '/rapports',
    icon: <BarChart3 className="h-5 w-5" />,
  },
];
  