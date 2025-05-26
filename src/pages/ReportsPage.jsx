import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, Users, Truck, DollarSign, TrendingUp, Download, Settings2, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, subYears, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportCard = ({ title, value, icon, description, chartType, data }) => {
  let ChartIcon;
  let ChartComponent;

  switch (chartType) {
    case 'bar':
      ChartIcon = BarChartIcon;
      ChartComponent = (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
      break;
    case 'line':
      ChartIcon = LineChartIcon;
      ChartComponent = (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
      break;
    case 'pie':
      ChartIcon = PieChartIcon;
      ChartComponent = (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
      break;
    default:
      ChartIcon = TrendingUp;
      ChartComponent = null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-card to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {React.cloneElement(icon, { className: "h-5 w-5 text-primary" })}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-4 h-32">
            {data && data.length > 0 ? ChartComponent : (
              <div className="h-full bg-muted/50 dark:bg-muted/20 rounded-md flex items-center justify-center">
                <ChartIcon className="h-16 w-16 text-primary/30" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const reportTypes = [
  { value: "financial_summary", label: "Résumé Financier" },
  { value: "operational_efficiency", label: "Efficacité Opérationnelle" },
  { value: "customer_insights", label: "Aperçu Clientèle" },
  { value: "vehicle_utilization", label: "Utilisation Véhicules" },
];

const dataPointsOptions = {
  financial_summary: [
    { id: "revenue", label: "Revenus Totaux" }, 
    { id: "avg_invoice_value", label: "Valeur Moyenne Facture" },
    { id: "paid_invoices", label: "Factures Payées" }, 
    { id: "pending_invoices", label: "Factures en Attente" },
    { id: "overdue_invoices", label: "Factures en Retard" },
    { id: "monthly_growth", label: "Croissance Mensuelle" }
  ],
  operational_efficiency: [
    { id: "completed_services", label: "Prestations Terminées" }, 
    { id: "pending_services", label: "Prestations en Cours" },
    { id: "cancelled_services", label: "Prestations Annulées" },
    { id: "avg_service_duration", label: "Durée Moyenne Prestation" },
    { id: "services_per_team", label: "Prestations par Équipe" }, 
    { id: "services_status_distribution", label: "Répartition Statuts Prestations" }
  ],
  customer_insights: [
    { id: "total_customers", label: "Nombre Total de Clients" }, 
    { id: "new_customers_period", label: "Nouveaux Clients (Période)" },
    { id: "active_customers", label: "Clients Actifs" },
    { id: "customer_satisfaction", label: "Satisfaction Client (Simulée)" },
    { id: "repeat_customers", label: "Clients Récurrents" }
  ],
  vehicle_utilization: [
    { id: "total_vehicles", label: "Nombre Total de Véhicules" }, 
    { id: "available_vehicles", label: "Véhicules Disponibles" },
    { id: "vehicle_status_distribution", label: "Répartition Statuts Véhicules" },
    { id: "maintenance_due", label: "Véhicules en Maintenance" },
    { id: "utilization_rate", label: "Taux d'Utilisation" }
  ],
};

const timeRangeLabels = {
  last7days: "7 derniers jours",
  last30days: "30 derniers jours",
  currentMonth: "Mois en cours",
  lastQuarter: "Dernier trimestre (90j)",
  currentYear: "Année en cours",
  allTime: "Depuis toujours",
}

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("last30days");
  const [selectedReportType, setSelectedReportType] = useState(reportTypes[0].value);
  const [selectedDataPoints, setSelectedDataPoints] = useState([dataPointsOptions[reportTypes[0].value][0].id]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const { toast } = useToast();
  
  const [reportData, setReportData] = useState({
    financial: { 
      title: "Chiffre d'Affaires (Payé)", 
      value: "0 €", 
      icon: <DollarSign />, 
      description: "Chargement...", 
      chartType: 'line',
      data: []
    },
    operational: { 
      title: "Prestations Terminées", 
      value: "0", 
      icon: <Truck />, 
      description: "Chargement...", 
      chartType: 'bar',
      data: []
    },
    customer: { 
      title: "Total Clients", 
      value: "0", 
      icon: <Users />, 
      description: "Chargement...", 
      chartType: 'line',
      data: []
    },
    vehicles: { 
      title: "Véhicules Disponibles", 
      value: "0/0", 
      icon: <Truck />, 
      description: "Chargement...", 
      chartType: 'pie',
      data: []
    }
  });

  const [generatedReportDetails, setGeneratedReportDetails] = useState(null);


  const fetchDataForReports = useCallback(async () => {
    const now = new Date();
    let startDate;
    let endDate = now;

    switch (timeRange) {
        case 'last7days': startDate = subDays(now, 7); break;
        case 'last30days': startDate = subDays(now, 30); break;
        case 'currentMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
        case 'lastQuarter': startDate = subDays(now, 90); break;
        case 'currentYear': startDate = startOfYear(now); break;
        case 'allTime': startDate = new Date(2000,0,1); break;
        default: startDate = subDays(now, 30);
    }

    try {
        // Requêtes parallèles pour optimiser les performances
        const [invoicesResponse, servicesResponse, clientsResponse, vehiclesResponse, employeesResponse] = await Promise.all([
            // 1. Chiffre d'Affaires (Payé)
            supabase
                .from('factures')
                .select('montant_ttc, montant_ht, montant, taux_tva, statut, date_emission, numero_facture')
                .eq('statut', 'Payée')
                .gte('date_emission', startDate.toISOString())
                .lte('date_emission', endDate.toISOString()),
            
            // 2. Prestations
            supabase
                .from('prestations')
                .select('id, statut, date_prestation')
                .gte('date_prestation', startDate.toISOString())
                .lte('date_prestation', endDate.toISOString()),
            
            // 3. Clients
            supabase
                .from('clients')
                .select('id, nom, created_at')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString()),
            
            // 4. Véhicules
            supabase
                .from('vehicules')
                .select('id, statut, type'),
            
            // 5. Employés
            supabase
                .from('employes')
                .select('id, nom, poste')
        ]);

        // Vérification des erreurs
        if (invoicesResponse.error) throw invoicesResponse.error;
        if (servicesResponse.error) throw servicesResponse.error;
        if (clientsResponse.error) throw clientsResponse.error;
        if (vehiclesResponse.error) throw vehiclesResponse.error;
        if (employeesResponse.error) throw employeesResponse.error;

        console.log("Invoices data:", invoicesResponse.data);
        console.log("Services data:", servicesResponse.data);
        console.log("Clients data:", clientsResponse.data);
        console.log("Vehicles data:", vehiclesResponse.data);

        // Calculs financiers
        const totalRevenue = invoicesResponse.data?.reduce((sum, inv) => {
            console.log("Processing invoice:", inv);
            let amount = 0;
            
            // Essayer différents champs de montant dans l'ordre de priorité
            if (inv.montant_ttc) {
                amount = typeof inv.montant_ttc === 'string' ? 
                    parseFloat(inv.montant_ttc.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
                    parseFloat(inv.montant_ttc);
            } else if (inv.montant_ht) {
                // Utiliser montant_ht + TVA
                const montantHT = typeof inv.montant_ht === 'string' ? 
                    parseFloat(inv.montant_ht.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
                    parseFloat(inv.montant_ht);
                const tauxTVA = parseFloat(inv.taux_tva || 0.20);
                amount = montantHT * (1 + tauxTVA);
            } else if (inv.montant) {
                // Si pas de montant_ttc ni montant_ht, calculer à partir du montant (HT)
                const montantHT = typeof inv.montant === 'string' ? 
                    parseFloat(inv.montant.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
                    parseFloat(inv.montant);
                const tauxTVA = parseFloat(inv.taux_tva || 0.20);
                amount = montantHT * (1 + tauxTVA);
            }
            
            console.log("Calculated amount:", amount);
            console.log("Invoice fields:", { montant_ttc: inv.montant_ttc, montant_ht: inv.montant_ht, montant: inv.montant, taux_tva: inv.taux_tva });
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0) || 0;
        
        console.log("Total revenue calculated:", totalRevenue);

        // Calculs opérationnels
        const completedServices = servicesResponse.data?.filter(s => s.statut === 'Terminée').length || 0;
        const totalServices = servicesResponse.data?.length || 0;
        
        // Calculs clients
        const totalClientsAll = await supabase.from('clients').select('id', { count: 'exact', head: true });
        const totalClients = totalClientsAll.count || 0;
        const newClientsInPeriod = clientsResponse.data?.length || 0;

        // Calculs véhicules
        const totalVehicles = vehiclesResponse.data?.length || 0;
        const availableVehicles = vehiclesResponse.data?.filter(v => v.statut === 'Disponible').length || 0;

        // Fallback: essayer de récupérer toutes les factures si aucune payée n'est trouvée
        let allInvoicesForChart = invoicesResponse.data;
        if (!allInvoicesForChart || allInvoicesForChart.length === 0) {
            console.log("No paid invoices found, trying to get all invoices for chart...");
            const allInvoicesResponse = await supabase
                .from('factures')
                .select('montant_ttc, montant_ht, montant, taux_tva, statut, date_emission')
                .gte('date_emission', startDate.toISOString())
                .lte('date_emission', endDate.toISOString())
                .limit(10);
            allInvoicesForChart = allInvoicesResponse.data || [];
        }

        // Données pour les graphiques
        const revenueChartData = allInvoicesForChart?.reduce((acc, inv) => {
            const date = format(parseISO(inv.date_emission), 'dd/MM');
            
            // Même logique de calcul que pour le total
            let amount = 0;
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
            
            if (!isNaN(amount) && amount > 0) {
                const existing = acc.find(item => item.name === date);
                if (existing) {
                    existing.value += amount;
                } else {
                    acc.push({ name: date, value: amount });
                }
            }
            return acc;
        }, []).slice(-7) || [];
        
        console.log("Revenue chart data:", revenueChartData);

        const servicesChartData = servicesResponse.data?.reduce((acc, service) => {
            const date = format(parseISO(service.date_prestation), 'dd/MM');
            const existing = acc.find(item => item.name === date);
            if (existing) {
                existing.value += 1;
            } else {
                acc.push({ name: date, value: 1 });
            }
            return acc;
        }, []).slice(-7) || [];
        
        console.log("Services chart data:", servicesChartData);
        console.log("Completed services:", completedServices, "Total services:", totalServices);

        const newReportData = {
            financial: {
                title: "Chiffre d'Affaires (Payé)",
                value: `${totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                icon: <DollarSign />,
                description: `${invoicesResponse.data?.length || 0} factures payées (sur ${allInvoicesForChart?.length || 0} total) - ${timeRangeLabels[timeRange]?.toLowerCase()}`,
                chartType: 'line',
                data: revenueChartData
            },
            operational: {
                title: "Prestations Terminées",
                value: `${completedServices}/${totalServices}`,
                icon: <Truck />,
                description: `${((completedServices/totalServices)*100 || 0).toFixed(1)}% de réussite - ${timeRangeLabels[timeRange]?.toLowerCase()}`,
                chartType: 'bar',
                data: servicesChartData
            },
            customer: {
                title: "Total Clients",
                value: totalClients.toString(),
                icon: <Users />,
                description: `+${newClientsInPeriod} nouveaux clients - ${timeRangeLabels[timeRange]?.toLowerCase()}`,
                chartType: 'line',
                data: [
                    { name: 'Existants', value: totalClients - newClientsInPeriod },
                    { name: 'Nouveaux', value: newClientsInPeriod }
                ]
            },
            vehicles: {
                title: "Véhicules Disponibles",
                value: `${availableVehicles}/${totalVehicles}`,
                icon: <Truck />,
                description: `${((availableVehicles/totalVehicles)*100 || 0).toFixed(1)}% de disponibilité`,
                chartType: 'pie',
                data: [
                    { name: 'Disponibles', value: availableVehicles },
                    { name: 'Occupés', value: totalVehicles - availableVehicles }
                ]
            }
        };

        setReportData(newReportData);

    } catch (error) {
        console.error("Erreur détaillée:", error);
        toast({ 
            title: "Erreur de rapport", 
            description: error.message || "Impossible de charger les données pour les rapports.", 
            variant: "destructive"
        });
    }
  }, [timeRange, toast]);

  // Ajouter un effet pour surveiller les changements de timeRange
  useEffect(() => {
    console.log("Chargement des données...");
    fetchDataForReports().catch(error => {
        console.error("Erreur lors du chargement initial:", error);
    });
  }, [fetchDataForReports]);


  const handleDataPointChange = (pointId) => {
    setSelectedDataPoints(prev => 
      prev.includes(pointId) ? prev.filter(p => p !== pointId) : [...prev, pointId]
    );
  };
  
  const handlePrintReport = async () => {
     if (!generatedReportDetails) return;
     
     // Récupérer les données réelles pour les graphiques
     const now = new Date();
     let startDate;
     let endDate = now;
     switch (timeRange) {
         case 'last7days': startDate = subDays(now, 7); break;
         case 'last30days': startDate = subDays(now, 30); break;
         case 'currentMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
         case 'lastQuarter': startDate = subDays(now, 90); break;
         case 'currentYear': startDate = startOfYear(now); break;
         case 'allTime': startDate = new Date(2000,0,1); break;
         default: startDate = subDays(now, 30);
     }
     
     const printWindow = window.open('', '_blank');
     printWindow.document.write('<html><head><title>Rapport Personnalisé</title>');
     printWindow.document.write(`
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1, h2, h3 { color: #5E35B1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .report-header { text-align: center; margin-bottom: 30px; }
          .report-section { margin-bottom: 20px; page-break-inside: avoid; }
          .data-table { width: 100%; margin: 15px 0; }
          .data-table th { background-color: #5E35B1; color: white; }
          .chart-section { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .summary-box { background-color: #e8f4fd; padding: 10px; border-left: 4px solid #5E35B1; margin: 10px 0; }
           @media print { .no-print { display: none; } }
        </style>
     `);
     printWindow.document.write('</head><body>');
     printWindow.document.write('<div class="report-header">');
     printWindow.document.write(`<h1>Rapport Personnalisé</h1>`);
     printWindow.document.write(`<p>Type de rapport: ${generatedReportDetails.type}</p>`);
     printWindow.document.write(`<p>Période: ${timeRangeLabels[generatedReportDetails.period]}</p>`);
     printWindow.document.write(`<p>Généré le: ${generatedReportDetails.generatedAt}</p>`);
     printWindow.document.write('</div>');

     for (const point of generatedReportDetails.pointsDetails) {
        printWindow.document.write('<div class="report-section">');
        printWindow.document.write(`<h3>${point.label}</h3>`);
        printWindow.document.write(`<div class="summary-box"><strong>Valeur: ${point.value || 'N/A'}</strong></div>`);
        
        // Ajouter des données réelles selon le type de point
        try {
          if (selectedReportType === 'customer_insights') {
            if (point.id === 'total_customers') {
              const { data: clientsData } = await supabase
                .from('clients')
                .select('nom, created_at')
                .order('created_at', { ascending: false })
                .limit(10);
              
              if (clientsData && clientsData.length > 0) {
                printWindow.document.write('<div class="chart-section">');
                printWindow.document.write('<h4>Derniers clients ajoutés:</h4>');
                printWindow.document.write('<table class="data-table">');
                printWindow.document.write('<thead><tr><th>Nom du Client</th><th>Date d\'ajout</th></tr></thead>');
                printWindow.document.write('<tbody>');
                clientsData.forEach(client => {
                  const date = format(parseISO(client.created_at), "dd/MM/yyyy", { locale: fr });
                  printWindow.document.write(`<tr><td>${client.nom}</td><td>${date}</td></tr>`);
                });
                printWindow.document.write('</tbody></table></div>');
              }
            } else if (point.id === 'new_customers_period') {
              const { data: newClientsData } = await supabase
                .from('clients')
                .select('nom, created_at')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: false });
              
              if (newClientsData && newClientsData.length > 0) {
                printWindow.document.write('<div class="chart-section">');
                printWindow.document.write('<h4>Nouveaux clients sur la période:</h4>');
                printWindow.document.write('<table class="data-table">');
                printWindow.document.write('<thead><tr><th>Nom du Client</th><th>Date d\'ajout</th></tr></thead>');
                printWindow.document.write('<tbody>');
                newClientsData.forEach(client => {
                  const date = format(parseISO(client.created_at), "dd/MM/yyyy", { locale: fr });
                  printWindow.document.write(`<tr><td>${client.nom}</td><td>${date}</td></tr>`);
                });
                printWindow.document.write('</tbody></table></div>');
              }
            }
          } else if (selectedReportType === 'financial_summary') {
            if (point.id === 'revenue' || point.id === 'paid_invoices') {
              const { data: facturesData } = await supabase
                .from('factures')
                .select('numero_facture, montant_ttc, date_emission')
                .eq('statut', 'Payée')
                .gte('date_emission', startDate.toISOString())
                .lte('date_emission', endDate.toISOString())
                .order('date_emission', { ascending: false })
                .limit(10);
              
              if (facturesData && facturesData.length > 0) {
                printWindow.document.write('<div class="chart-section">');
                printWindow.document.write('<h4>Factures payées récentes:</h4>');
                printWindow.document.write('<table class="data-table">');
                printWindow.document.write('<thead><tr><th>N° Facture</th><th>Montant TTC</th><th>Date</th></tr></thead>');
                printWindow.document.write('<tbody>');
                facturesData.forEach(facture => {
                  const date = format(parseISO(facture.date_emission), "dd/MM/yyyy", { locale: fr });
                  const montant = typeof facture.montant_ttc === 'string' ? 
                    parseFloat(facture.montant_ttc.replace(',', '.')) : 
                    (facture.montant_ttc || 0);
                  printWindow.document.write(`<tr><td>${facture.numero_facture}</td><td>${montant.toFixed(2)} €</td><td>${date}</td></tr>`);
                });
                printWindow.document.write('</tbody></table></div>');
              }
            }
          } else if (selectedReportType === 'operational_efficiency') {
            if (point.id === 'completed_services' || point.id === 'pending_services') {
              const { data: prestationsData } = await supabase
                .from('prestations')
                .select('id, type_prestation, statut, date_prestation')
                .gte('date_prestation', startDate.toISOString())
                .lte('date_prestation', endDate.toISOString())
                .order('date_prestation', { ascending: false })
                .limit(10);
              
              if (prestationsData && prestationsData.length > 0) {
                printWindow.document.write('<div class="chart-section">');
                printWindow.document.write('<h4>Prestations récentes:</h4>');
                printWindow.document.write('<table class="data-table">');
                printWindow.document.write('<thead><tr><th>Type</th><th>Statut</th><th>Date</th></tr></thead>');
                printWindow.document.write('<tbody>');
                prestationsData.forEach(prestation => {
                  const date = format(parseISO(prestation.date_prestation), "dd/MM/yyyy", { locale: fr });
                  printWindow.document.write(`<tr><td>${prestation.type_prestation}</td><td>${prestation.statut}</td><td>${date}</td></tr>`);
                });
                printWindow.document.write('</tbody></table></div>');
              }
            }
          } else if (selectedReportType === 'vehicle_utilization') {
            if (point.id === 'total_vehicles' || point.id === 'available_vehicles') {
              const { data: vehiculesData } = await supabase
                .from('vehicules')
                .select('immatriculation, type, statut')
                .order('immatriculation', { ascending: true });
              
              if (vehiculesData && vehiculesData.length > 0) {
                printWindow.document.write('<div class="chart-section">');
                printWindow.document.write('<h4>État des véhicules:</h4>');
                printWindow.document.write('<table class="data-table">');
                printWindow.document.write('<thead><tr><th>Immatriculation</th><th>Type</th><th>Statut</th></tr></thead>');
                printWindow.document.write('<tbody>');
                vehiculesData.forEach(vehicule => {
                  printWindow.document.write(`<tr><td>${vehicule.immatriculation}</td><td>${vehicule.type}</td><td>${vehicule.statut}</td></tr>`);
                });
                printWindow.document.write('</tbody></table></div>');
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données pour l\'impression:', error);
          printWindow.document.write('<div class="chart-section">');
          printWindow.document.write('<p><em>Données non disponibles pour cette visualisation</em></p>');
          printWindow.document.write('</div>');
        }
        
        printWindow.document.write('</div>');
     }
     
     printWindow.document.write('<script>setTimeout(() => { window.print(); window.close(); }, 500);</script>');
     printWindow.document.write('</body></html>');
     printWindow.document.close();
  };

  const downloadReportAsCSV = () => {
    if (!generatedReportDetails) return;
    
    const csvContent = [
      ['Type de Rapport', 'Période', 'Généré le'],
      [generatedReportDetails.type, timeRangeLabels[generatedReportDetails.period], generatedReportDetails.generatedAt],
      [''],
      ['Données', 'Valeur'],
      ...generatedReportDetails.pointsDetails.map(point => [point.label, point.value])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_${generatedReportDetails.type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast({
      title: "Téléchargement réussi",
      description: "Le rapport CSV a été téléchargé avec succès.",
    });
  };

  const downloadReportAsExcel = () => {
    if (!generatedReportDetails) return;
    
    // Simulation d'un fichier Excel en format CSV avec en-têtes spécifiques
    const excelContent = [
      ['RAPPORT PERSONNALISÉ'],
      [''],
      ['Type de Rapport:', generatedReportDetails.type],
      ['Période:', timeRangeLabels[generatedReportDetails.period]],
      ['Généré le:', generatedReportDetails.generatedAt],
      [''],
      ['DONNÉES DÉTAILLÉES'],
      ['Métrique', 'Valeur'],
      ...generatedReportDetails.pointsDetails.map(point => [point.label, point.value])
    ].map(row => row.join('\t')).join('\n');

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_${generatedReportDetails.type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast({
      title: "Téléchargement réussi",
      description: "Le rapport Excel a été téléchargé avec succès.",
    });
  };

  const handleDownloadReport = () => {
    if (!generatedReportDetails) return;
    
    switch (exportFormat) {
      case 'pdf':
        handlePrintReport();
        break;
      case 'csv':
        downloadReportAsCSV();
        break;
      case 'xlsx':
        downloadReportAsExcel();
        break;
      default:
        toast({
          title: "Format non supporté",
          description: "Ce format d'export n'est pas encore disponible.",
          variant: "destructive"
        });
    }
  };

  const generateReport = async () => {
    if (!selectedReportType || selectedDataPoints.length === 0) {
      toast({ title: "Configuration incomplète", description: "Veuillez sélectionner un type et au moins un point de donnée.", variant: "destructive" });
      return;
    }

    const now = new Date();
    let startDate;
    let endDate = now;
    switch (timeRange) {
        case 'last7days': startDate = subDays(now, 7); break;
        case 'last30days': startDate = subDays(now, 30); break;
        case 'currentMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
        case 'lastQuarter': startDate = subDays(now, 90); break;
        case 'currentYear': startDate = startOfYear(now); break; 
        case 'allTime': startDate = new Date(2000,0,1); break;
        default: startDate = subDays(now, 30);
    }
    const sDate = startDate.toISOString().split('T')[0];
    const eDate = endDate.toISOString().split('T')[0];

    const pointsDetails = [];

    for (const pointId of selectedDataPoints) {
        const pointLabel = dataPointsOptions[selectedReportType]?.find(opt => opt.id === pointId)?.label || pointId;
        let value = 'N/A (Donnée non calculée)';

        try {
            if (selectedReportType === 'financial_summary') {
                switch (pointId) {
                    case 'revenue':
                        const { data: revenueData, error: revenueError } = await supabase
                            .from('factures')
                            .select('montant_ttc, montant, taux_tva')
                            .eq('statut', 'Payée')
                            .gte('date_emission', sDate)
                            .lte('date_emission', eDate);
                        if (!revenueError) {
                            const total = revenueData.reduce((sum, inv) => {
                                let amount = 0;
                                if (inv.montant_ttc) {
                                    amount = typeof inv.montant_ttc === 'string' ? 
                                        parseFloat(inv.montant_ttc.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
                                        parseFloat(inv.montant_ttc);
                                } else if (inv.montant) {
                                    const montantHT = typeof inv.montant === 'string' ? 
                                        parseFloat(inv.montant.replace(/[^0-9.,]/g, '').replace(',', '.')) : 
                                        parseFloat(inv.montant);
                                    const tauxTVA = parseFloat(inv.taux_tva || 0.20);
                                    amount = montantHT * (1 + tauxTVA);
                                }
                                return sum + (isNaN(amount) ? 0 : amount);
                            }, 0);
                            value = `${total.toFixed(2)} €`;
                        }
                        break;
                    case 'paid_invoices':
                        const { count: paidCount, error: paidError } = await supabase
                            .from('factures')
                            .select('*', {count: 'exact', head: true})
                            .eq('statut', 'Payée')
                            .gte('date_emission', sDate)
                            .lte('date_emission', eDate);
                        if (!paidError) value = `${paidCount} factures`;
                        break;
                    case 'pending_invoices':
                        const { count: pendingCount, error: pendingError } = await supabase
                            .from('factures')
                            .select('*', {count: 'exact', head: true})
                            .eq('statut', 'En Attente')
                            .gte('date_emission', sDate)
                            .lte('date_emission', eDate);
                        if (!pendingError) value = `${pendingCount} factures`;
                        break;
                }
            } else if (selectedReportType === 'operational_efficiency') {
                switch (pointId) {
                    case 'completed_services':
                        const { count: completedCount, error: completedError } = await supabase
                            .from('prestations')
                            .select('*', {count: 'exact', head: true})
                            .eq('statut', 'Terminée')
                            .gte('date_prestation', sDate)
                            .lte('date_prestation', eDate);
                        if (!completedError) value = `${completedCount} prestations`;
                        break;
                    case 'pending_services':
                        const { count: pendingServicesCount, error: pendingServicesError } = await supabase
                            .from('prestations')
                            .select('*', {count: 'exact', head: true})
                            .eq('statut', 'En Cours')
                            .gte('date_prestation', sDate)
                            .lte('date_prestation', eDate);
                        if (!pendingServicesError) value = `${pendingServicesCount} prestations`;
                        break;
                }
            } else if (selectedReportType === 'customer_insights') {
                switch (pointId) {
                    case 'total_customers':
                        const { count: totalCustomers, error: customersError } = await supabase
                            .from('clients')
                            .select('*', {count: 'exact', head: true});
                        if (!customersError) value = `${totalCustomers} clients`;
                        break;
                    case 'new_customers_period':
                        const { count: newCustomers, error: newCustomersError } = await supabase
                            .from('clients')
                            .select('*', {count: 'exact', head: true})
                            .gte('created_at', sDate)
                            .lte('created_at', eDate);
                        if (!newCustomersError) value = `${newCustomers} nouveaux clients`;
                        break;
                }
            } else if (selectedReportType === 'vehicle_utilization') {
                switch (pointId) {
                    case 'total_vehicles':
                        const { count: totalVehicles, error: vehiclesError } = await supabase
                            .from('vehicules')
                            .select('*', {count: 'exact', head: true});
                        if (!vehiclesError) value = `${totalVehicles} véhicules`;
                        break;
                    case 'available_vehicles':
                        const { count: availableVehicles, error: availableError } = await supabase
                            .from('vehicules')
                            .select('*', {count: 'exact', head: true})
                            .eq('statut', 'Disponible');
                        if (!availableError) value = `${availableVehicles} véhicules disponibles`;
                        break;
                }
            }
        } catch (error) {
            console.error(`Erreur calcul ${pointId}:`, error);
            value = 'Erreur de calcul';
        }
        
        pointsDetails.push({ id: pointId, label: pointLabel, value });
    }


    const currentReportDetails = {
      type: reportTypes.find(rt => rt.value === selectedReportType)?.label,
      pointsDetails: pointsDetails, // Store detailed points with values
      period: timeRange,
      format: exportFormat,
      generatedAt: format(new Date(), "dd/MM/yyyy HH:mm", {locale: fr}),
    };
    setGeneratedReportDetails(currentReportDetails);


    toast({
      title: `Rapport "${currentReportDetails.type}" généré`,
      description: `${currentReportDetails.pointsDetails.map(p => p.label).join(', ')} pour ${timeRangeLabels[currentReportDetails.period]}. Format: ${currentReportDetails.format}.`,
      duration: 10000,
      action: (
        <div className="flex flex-col space-y-2">
            <Button variant="outline" size="sm" onClick={handlePrintReport}>
                <Printer className="mr-2 h-4 w-4" /> Imprimer PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" /> Télécharger ({exportFormat.toUpperCase()})
            </Button>
        </div>
      )
    });
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Rapports et Statistiques</h1>
          <p className="text-muted-foreground">Analysez les performances de votre entreprise.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportCard {...reportData.financial} />
        <ReportCard {...reportData.operational} />
        <ReportCard {...reportData.customer} />
        {reportData.vehicles && <ReportCard {...reportData.vehicles} />}
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary"/>Rapport Personnalisé</CardTitle>
          <CardDescription>Configurez et générez des rapports spécifiques à vos besoins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="reportType" className="font-semibold">Type de Rapport</Label>
              <Select value={selectedReportType} onValueChange={(value) => { setSelectedReportType(value); setSelectedDataPoints([]); setGeneratedReportDetails(null); }}>
                <SelectTrigger id="reportType"><SelectValue placeholder="Choisir un type de rapport" /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map(rt => <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exportFormat" className="font-semibold">Format d'Export</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="exportFormat"><SelectValue placeholder="Choisir un format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (Impression)</SelectItem>
                  <SelectItem value="csv">CSV (Téléchargement)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedReportType && dataPointsOptions[selectedReportType] && (
            <div className="space-y-3">
              <Label className="font-semibold">Données à Inclure:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 p-4 border rounded-md bg-muted/20 dark:bg-muted/10">
                {dataPointsOptions[selectedReportType].map(point => (
                  <div key={point.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dp-${point.id}`}
                      checked={selectedDataPoints.includes(point.id)}
                      onCheckedChange={() => { handleDataPointChange(point.id); setGeneratedReportDetails(null); }}
                    />
                    <Label htmlFor={`dp-${point.id}`} className="text-sm font-normal cursor-pointer">{point.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={generateReport} className="w-full md:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
              <Download className="mr-2 h-4 w-4" /> Générer le Rapport
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;