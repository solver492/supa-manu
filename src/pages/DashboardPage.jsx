import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { TrendingUp, Users, Truck, CalendarClock, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { format, isToday, parseISO, isPast, differenceInDays, isTomorrow, startOfMonth, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadDashboardData = useCallback(async () => {
    if (isDemoMode) {
      // Mode démo - utiliser les données statiques
      setDailyPlan([]);
      setAlerts([
        { id: 'demo-warn-1', type: 'warning', message: "Véhicule DEMO-01 - Maintenance prévue demain (Mode Démo)." },
        { id: 'demo-err-1', type: 'error', message: "Facture #DEMO999 en retard (Mode Démo)." },
        { id: 'demo-ok-1', type: 'success', message: "Aucune nouvelle alerte critique (Mode Démo)." },
      ].sort((a,b) => {
        const order = { error: 0, warning: 1, success: 2, info: 3 };
        return order[a.type] - order[b.type];
      }));
      setKpiData(demoKpiData);
      return;
    }

    // Mode réel - utiliser Supabase
    setLoading(true);
    try {
      console.log('Chargement des données depuis Supabase...');

      // Récupérer les données en parallèle
      const [prestationsRes, clientsRes, vehiculesRes, facturesRes] = await Promise.allSettled([
        supabase.from('prestations').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('vehicules').select('*'),
        supabase.from('factures').select('*')
      ]);

      // Extraire les données ou utiliser des tableaux vides en cas d'erreur
      const prestations = prestationsRes.status === 'fulfilled' && !prestationsRes.value.error 
        ? prestationsRes.value.data || [] 
        : JSON.parse(localStorage.getItem('services') || '[]');

      const clients = clientsRes.status === 'fulfilled' && !clientsRes.value.error 
        ? clientsRes.value.data || [] 
        : JSON.parse(localStorage.getItem('clients') || '[]');

      const vehicules = vehiculesRes.status === 'fulfilled' && !vehiculesRes.value.error 
        ? vehiculesRes.value.data || [] 
        : JSON.parse(localStorage.getItem('vehicles') || '[]');

      const factures = facturesRes.status === 'fulfilled' && !facturesRes.value.error 
        ? facturesRes.value.data || [] 
        : JSON.parse(localStorage.getItem('invoices') || '[]');

      console.log('Données chargées:', { 
        prestations: prestations.length, 
        clients: clients.length, 
        vehicules: vehicules.length, 
        factures: factures.length 
      });

      // Planning du jour
      const today = new Date();
      const todayServices = prestations
        .filter(service => {
          const serviceDate = service.date_prestation || service.date;
          if (!serviceDate) return false;

          try {
            return isToday(parseISO(serviceDate));
          } catch (error) {
            console.warn('Date invalide:', serviceDate);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const dateA = parseISO(a.date_prestation || a.date);
            const dateB = parseISO(b.date_prestation || b.date);
            return dateA - dateB;
          } catch (error) {
            return 0;
          }
        });

      setDailyPlan(todayServices);

      // Générer les alertes
      const currentAlerts = [];

      // Alertes véhicules
      vehicules.forEach(vehicle => {
        const maintenanceField = vehicle.prochaine_maintenance || vehicle.prochaineMaintenance;
        if (maintenanceField) {
          try {
            const maintenanceDate = parseISO(maintenanceField);
            const immatriculation = vehicle.immatriculation || `ID-${vehicle.id}`;
            const type = vehicle.type || 'Véhicule';

            if (isToday(maintenanceDate)) {
              currentAlerts.push({ 
                id: `veh-maint-today-${vehicle.id}`, 
                type: 'warning', 
                message: `Maintenance pour ${immatriculation} (${type}) due aujourd'hui.` 
              });
            } else if (isTomorrow(maintenanceDate)) {
              currentAlerts.push({ 
                id: `veh-maint-tomorrow-${vehicle.id}`, 
                type: 'info', 
                message: `Maintenance pour ${immatriculation} (${type}) prévue demain.` 
              });
            }
          } catch (error) {
            console.warn('Date de maintenance invalide:', maintenanceField);
          }
        }
      });

      // Alertes factures
      factures.forEach(invoice => {
        const numero = invoice.numero || invoice.id;
        const client = invoice.nom_client || invoice.client || 'Client inconnu';

        if (invoice.statut === 'En retard') {
          currentAlerts.push({ 
            id: `inv-late-${invoice.id}`, 
            type: 'error', 
            message: `Facture ${numero} (${client}) en retard de paiement.` 
          });
        } else if (invoice.statut === 'En attente') {
          const echeanceField = invoice.date_echeance || invoice.dateEcheance;
          if (echeanceField) {
            try {
              const echeanceDate = parseISO(echeanceField);
              if (isPast(echeanceDate)) {
                const daysOverdue = differenceInDays(new Date(), echeanceDate);
                if (daysOverdue > 0) {
                  currentAlerts.push({ 
                    id: `inv-overdue-${invoice.id}`, 
                    type: 'warning', 
                    message: `Facture ${numero} (${client}) échue depuis ${daysOverdue} jour(s).` 
                  });
                }
              }
            } catch (error) {
              console.warn('Date d\'échéance invalide:', echeanceField);
            }
          }
        }
      });

      // Si aucune alerte, ajouter un message positif
      if (currentAlerts.length === 0) {
        currentAlerts.push({ 
          id: 'real-ok-1', 
          type: 'success', 
          message: "Aucune alerte critique pour le moment." 
        });
      }

      // Trier les alertes par priorité
      setAlerts(currentAlerts.sort((a,b) => {
        const order = { error: 0, warning: 1, success: 2, info: 3 };
        return order[a.type] - order[b.type];
      }));

      // Calculs de dates pour les filtres
      const monthStart = startOfMonth(new Date());
      const weekStart = startOfWeek(new Date(), { locale: fr });

      // Calculs financiers - utiliser la même logique que la page Rapports
      const paidInvoicesThisMonth = factures.filter(inv => {
        const isPaid = inv.statut === 'Payée' || inv.statut === 'Payé';
        const emissionField = inv.date_emission || inv.dateEmission || inv.date_creation;
        if (!isPaid || !emissionField) return false;

        try {
          return parseISO(emissionField) >= monthStart;
        } catch (error) {
          return false;
        }
      });

      const totalRevenue = paidInvoicesThisMonth.reduce((sum, inv) => {
        console.log("Processing invoice:", inv);
        let amount = 0;

        // Utiliser la même logique que dans ReportsPage
        if (inv.montant_ttc) {
          amount = typeof inv.montant_ttc === 'string' ? 
            parseFloat(inv.montant_ttc.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
            parseFloat(inv.montant_ttc);
        } else if (inv.montant_ht) {
          const montantHT = typeof inv.montant_ht === 'string' ? 
            parseFloat(inv.montant_ht.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
            parseFloat(inv.montant_ht);
          const tauxTVA = parseFloat(inv.taux_tva || 0.20);
          amount = montantHT * (1 + tauxTVA);
        } else if (inv.montant) {
          const montantHT = typeof inv.montant === 'string' ? 
            parseFloat(inv.montant.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
            parseFloat(inv.montant);
          const tauxTVA = parseFloat(inv.taux_tva || 0.20);
          amount = montantHT * (1 + tauxTVA);
        }

        console.log("Calculated amount:", amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      console.log("Total revenue calculated:", totalRevenue);
      console.log("Paid invoices this month:", paidInvoicesThisMonth.length);

      // Calculs clients
      const newClientsThisMonth = clients.filter(client => {
        const creationField = client.created_at || client.date_creation;
        if (!creationField) return false;

        try {
          return parseISO(creationField) >= monthStart;
        } catch (error) {
          return false;
        }
      }).length;

      // Calculs prestations
      const servicesThisWeek = prestations.filter(prestation => {
        const prestationField = prestation.date_prestation || prestation.date;
        if (!prestationField) return false;

        try {
          return parseISO(prestationField) >= weekStart;
        } catch (error) {
          return false;
        }
      }).length;

      // Calculs factures en attente
      const pendingInvoices = factures.filter(inv => 
        inv.statut === 'En attente' || inv.statut === 'Brouillon'
      ).length;

      setKpiData([
        { 
          title: "Chiffre d'affaires (Mois)", 
          value: `${totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`, 
          icon: <TrendingUp className="h-6 w-6 text-primary" />, 
          trend: `${paidInvoicesThisMonth.length} factures payées ce mois` 
        },
        { 
          title: "Nouveaux Clients (Mois)", 
          value: `${newClientsThisMonth}`, 
          icon: <Users className="h-6 w-6 text-green-500" />, 
          trend: `Total clients: ${clients.length}` 
        },
        { 
          title: "Prestations (Semaine)", 
          value: `${servicesThisWeek}`, 
          icon: <Truck className="h-6 w-6 text-blue-500" />, 
          trend: `Total: ${prestations.length}` 
        },
        { 
          title: "Factures en Attente", 
          value: `${pendingInvoices}`, 
          icon: <FileText className="h-6 w-6 text-orange-500" />, 
          trend: `Total factures: ${factures.length}` 
        },
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);

      // En cas d'erreur complète, essayer de récupérer depuis localStorage
      try {
        const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
        const storedClients = JSON.parse(localStorage.getItem('clients') || '[]');
        const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
        const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');

        setDailyPlan([]);
        setAlerts([{ 
          id: 'error-connection', 
          type: 'error', 
          message: "Connexion à la base de données impossible. Données locales utilisées." 
        }]);

        setKpiData([
          { title: "Chiffre d'affaires (Mois)", value: "0 €", icon: <TrendingUp className="h-6 w-6 text-primary" />, trend: "Données non disponibles" },
          { title: "Nouveaux Clients", value: storedClients.length.toString(), icon: <Users className="h-6 w-6 text-green-500" />, trend: "Données locales" },
          { title: "Prestations (Semaine)", value: storedServices.length.toString(), icon: <Truck className="h-6 w-6 text-blue-500" />, trend: "Données locales" },
          { title: "Factures en Attente", value: storedInvoices.length.toString(), icon: <FileText className="h-6 w-6 text-orange-500" />, trend: "Données locales" },
        ]);
      } catch (localStorageError) {
        console.error('Erreur localStorage:', localStorageError);
        setDailyPlan([]);
        setAlerts([{ 
          id: 'error-critical', 
          type: 'error', 
          message: "Erreur critique lors du chargement des données." 
        }]);
        setKpiData([
          { title: "Chiffre d'affaires (Mois)", value: "0 €", icon: <TrendingUp className="h-6 w-6 text-primary" />, trend: "Erreur de chargement" },
          { title: "Nouveaux Clients", value: "0", icon: <Users className="h-6 w-6 text-green-500" />, trend: "Erreur de chargement" },
          { title: "Prestations (Semaine)", value: "0", icon: <Truck className="h-6 w-6 text-blue-500" />, trend: "Erreur de chargement" },
          { title: "Factures en Attente", value: "0", icon: <FileText className="h-6 w-6 text-orange-500" />, trend: "Erreur de chargement" },
        ]);
      }

      toast({
        title: "Problème de connexion",
        description: "Certaines données peuvent ne pas être à jour.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, toast]);

  useEffect(() => {
    loadDashboardData();
    // Rafraîchir les données toutes les 5 minutes
    const intervalId = setInterval(loadDashboardData, 300000);
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
              <CardTitle className="flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-primary" />
                Planning du Jour
              </CardTitle>
              <CardDescription>{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : dailyPlan.length > 0 ? (
                <ul className="space-y-3">
                  {dailyPlan.map(service => (
                    <li key={service.id} className="flex justify-between items-center p-3 bg-muted/50 dark:bg-muted/20 rounded-md hover:bg-muted dark:hover:bg-muted/40 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">
                          {service.nom_client || service.client || 'Client non défini'} - {service.type_prestation || service.type || 'Service'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.equipe_assignee || service.equipe ? 
                            `Équipe: ${service.equipe_assignee || service.equipe}` : 
                            'Équipe non assignée'
                          }
                        </p>
                        {(service.adresse_depart || service.adresse) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Départ: {service.adresse_depart || service.adresse}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-primary font-semibold">
                        {(() => {
                          try {
                            return format(parseISO(service.date_prestation || service.date), "HH:mm");
                          } catch (error) {
                            return "Heure non définie";
                          }
                        })()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune prestation planifiée pour aujourd'hui.</p>
              )}
            </CardContent>
            <div className="p-6 pt-2 border-t">
             <Button onClick={() => navigate('/calendrier')} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
               Voir le calendrier complet
             </Button>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : alerts.length > 0 ? (
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
             <Button onClick={() => navigate('/prestations')} variant="outline" className="w-full">
               Gérer les prestations
             </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;