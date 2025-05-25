import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Truck, CalendarClock, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { format, isToday, parseISO, isPast, differenceInDays, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const demoKpiData = [
  { title: "Chiffre d'affaires (Mois)", value: "12,345 €", icon: <TrendingUp className="h-6 w-6 text-primary" />, trend: "+5.2%" },
  { title: "Nouveaux Clients", value: "23", icon: <Users className="h-6 w-6 text-green-500" />, trend: "+10" },
  { title: "Prestations Planifiées (Semaine)", value: "15", icon: <Truck className="h-6 w-6 text-blue-500" />, trend: "stable" },
  { title: "Factures en Attente", value: "8", icon: <FileText className="h-6 w-6 text-orange-500" />, trend: "2 nouvelles" },
];

const DashboardPage = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [kpiData, setKpiData] = useState(demoKpiData);
  const navigate = useNavigate();

  const loadDashboardData = useCallback(() => {
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    const storedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');

    const todayServices = storedServices
      .filter(service => isToday(parseISO(service.date)))
      .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    setDailyPlan(todayServices);

    const currentAlerts = [];

    storedVehicles.forEach(vehicle => {
      if (vehicle.prochaineMaintenance) {
        const maintenanceDate = parseISO(vehicle.prochaineMaintenance);
        if (isToday(maintenanceDate)) {
          currentAlerts.push({ id: `veh-maint-today-${vehicle.id}`, type: 'warning', message: `Maintenance pour ${vehicle.immatriculation} (${vehicle.type}) due aujourd'hui.` });
        } else if (isTomorrow(maintenanceDate)) {
          currentAlerts.push({ id: `veh-maint-tomorrow-${vehicle.id}`, type: 'info', message: `Maintenance pour ${vehicle.immatriculation} (${vehicle.type}) prévue demain.` });
        }
      }
    });

    storedInvoices.forEach(invoice => {
      if (invoice.statut === 'En retard') {
        currentAlerts.push({ id: `inv-late-${invoice.id}`, type: 'error', message: `Facture ${invoice.id} (${invoice.client}) en retard de paiement.` });
      } else if (invoice.statut === 'En attente' && isPast(parseISO(invoice.dateEcheance))) {
         const daysOverdue = differenceInDays(new Date(), parseISO(invoice.dateEcheance));
         if (daysOverdue > 0) {
            currentAlerts.push({ id: `inv-overdue-${invoice.id}`, type: 'warning', message: `Facture ${invoice.id} (${invoice.client}) échue depuis ${daysOverdue} jour(s).` });
         }
      }
    });
    
    if (isDemoMode) {
      setAlerts([
        { id: 'demo-warn-1', type: 'warning', message: "Véhicule DEMO-01 - Maintenance prévue demain (Mode Démo)." },
        { id: 'demo-err-1', type: 'error', message: "Facture #DEMO999 en retard (Mode Démo)." },
        { id: 'demo-ok-1', type: 'success', message: "Aucune nouvelle alerte critique (Mode Démo)." },
      ].sort((a,b) => {
        const order = { error: 0, warning: 1, success: 2, info: 3 };
        return order[a.type] - order[b.type];
      }));
      setKpiData(demoKpiData);
    } else {
      if(currentAlerts.length === 0) {
        currentAlerts.push({ id: 'real-ok-1', type: 'success', message: "Aucune alerte critique pour le moment." });
      }
      setAlerts(currentAlerts.sort((a,b) => {
        const order = { error: 0, warning: 1, success: 2, info: 3 };
        return order[a.type] - order[b.type];
      }));

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));


      const monthlyRevenue = storedInvoices
        .filter(inv => inv.statut === 'Payée' && parseISO(inv.dateEmission) >= startOfMonth)
        .reduce((sum, inv) => sum + inv.montantTTC, 0);
      
      const newClientsThisMonth = storedClients.length; // Simplified, assume all clients are new this month

      const servicesThisWeek = storedServices
        .filter(s => parseISO(s.date) >= startOfWeek && parseISO(s.date) <= new Date()).length;

      const pendingInvoices = storedInvoices.filter(inv => inv.statut === 'En attente' || inv.statut === 'En retard').length;

      setKpiData([
        { title: "Chiffre d'affaires (Mois)", value: `${monthlyRevenue.toFixed(2)} €`, icon: <TrendingUp className="h-6 w-6 text-primary" />, trend: "Données réelles" },
        { title: "Nouveaux Clients (Total)", value: `${newClientsThisMonth}`, icon: <Users className="h-6 w-6 text-green-500" />, trend: "Données réelles" },
        { title: "Prestations (Semaine en cours)", value: `${servicesThisWeek}`, icon: <Truck className="h-6 w-6 text-blue-500" />, trend: "Données réelles" },
        { title: "Factures en Attente", value: `${pendingInvoices}`, icon: <FileText className="h-6 w-6 text-orange-500" />, trend: "Données réelles" },
      ]);
    }
  }, [isDemoMode]);

  useEffect(() => {
    loadDashboardData();
    const intervalId = setInterval(loadDashboardData, 60000); // Refresh data every 60 seconds
    return () => clearInterval(intervalId);
  }, [loadDashboardData]);


  const getAlertIcon = (type) => {
    if (type === 'error') return <AlertTriangle className="h-5 w-5 mr-3 mt-1 text-red-500 flex-shrink-0" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 mr-3 mt-1 text-yellow-500 flex-shrink-0" />;
    if (type === 'success') return <CheckCircle2 className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />;
    if (type === 'info') return <AlertTriangle className="h-5 w-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />;
    return <AlertTriangle className="h-5 w-5 mr-3 mt-1 text-gray-500 flex-shrink-0" />;
  };

  const getAlertClasses = (type) => {
    if (type === 'error') return "bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300";
    if (type === 'warning') return "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300";
    if (type === 'success') return "bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300";
    if (type === 'info') return "bg-blue-100 border-l-4 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300";
    return "bg-gray-100 border-l-4 border-gray-500 text-gray-700 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300";
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Bienvenue sur votre tableau de bord Mon Auxiliaire Déménagement.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Switch
            id="demo-mode"
            checked={isDemoMode}
            onCheckedChange={setIsDemoMode}
          />
          <Label htmlFor="demo-mode" className="text-sm text-muted-foreground whitespace-nowrap">Mode Démo</Label>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title + (isDemoMode ? '-demo' : '-real')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-card to-slate-50 dark:from-card dark:to-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                {kpi.trend && <p className="text-xs text-muted-foreground pt-1">{kpi.trend}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center"><CalendarClock className="h-5 w-5 mr-2 text-primary" />Planning du Jour</CardTitle>
              <CardDescription>{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto max-h-96">
              {dailyPlan.length > 0 ? (
                <ul className="space-y-3">
                  {dailyPlan.map(service => (
                    <li key={service.id} className="flex justify-between items-center p-3 bg-muted/50 dark:bg-muted/20 rounded-md hover:bg-muted dark:hover:bg-muted/40 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">{service.client} - {service.type}</p>
                        <p className="text-xs text-muted-foreground">{service.equipe ? `Équipe: ${service.equipe}` : 'Équipe non assignée'}</p>
                      </div>
                      <span className="text-sm text-primary font-semibold">{format(parseISO(service.date), "HH:mm")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune prestation planifiée pour aujourd'hui.</p>
              )}
            </CardContent>
            <div className="p-6 pt-2 border-t">
             <Button onClick={() => navigate('/calendrier')} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">Voir le calendrier complet</Button>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle>Alertes et Notifications</CardTitle>
              <CardDescription>Informations importantes et rappels.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto max-h-96">
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`flex items-start p-3 rounded-md ${getAlertClasses(alert.type)}`}>
                      {getAlertIcon(alert.type)}
                      <p className="text-sm flex-1">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-muted-foreground text-center py-8">Aucune alerte pour le moment.</p>
              )}
            </CardContent>
             <div className="p-6 pt-2 border-t">
             <Button onClick={() => navigate('/prestations')} variant="outline" className="w-full">Gérer les prestations</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;