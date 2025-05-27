import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, Users, Truck, DollarSign, TrendingUp, Download, Settings2, Printer, BarChart2 } from 'lucide-react';
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

const ManpowerDistributionWidget = ({ data, timeRange }) => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const itemsPerPage = 10;

  if (!data?.data || !data.data.length) {
    return (
      <Card className="col-span-full h-[400px]">
        <CardHeader>
          <CardTitle>Distribution Manutentionnaires</CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Users className="h-16 w-16 text-primary/30 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(data.data.length / itemsPerPage);
  const paginatedData = data.data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Card className="col-span-full h-[400px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Distribution Manutentionnaires</CardTitle>
            <CardDescription>
              {data.totalManpower} manutentionnaires répartis sur {data.totalSites} sites
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareMode(!isCompareMode)}
            >
              {isCompareMode ? (
                <BarChart2 className="h-4 w-4 mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {isCompareMode ? "Vue Barres" : "Vue Comparative"}
            </Button>
            <Select 
              value={selectedSite} 
              onValueChange={setSelectedSite}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Tous les sites</SelectItem>
                {data.data.map(item => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name} ({item.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {isCompareMode ? (
              <LineChart data={selectedSite ? paginatedData.filter(d => d.name === selectedSite) : paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background p-2 rounded-lg border shadow-lg">
                          <p className="font-bold">{data.name}</p>
                          <p>{data.value} manutentionnaires</p>
                          <p className="text-xs text-muted-foreground">
                            {((data.value / data.totalManpower) * 100).toFixed(1)}% du total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            ) : (
              <BarChart data={selectedSite ? paginatedData.filter(d => d.name === selectedSite) : paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background p-2 rounded-lg border shadow-lg">
                          <p className="font-bold">{data.name}</p>
                          <p>{data.value} manutentionnaires</p>
                          <p className="text-xs text-muted-foreground">
                            {((data.value / data.totalManpower) * 100).toFixed(1)}% du total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {paginatedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      opacity={selectedSite ? (entry.name === selectedSite ? 1 : 0.3) : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Précédent
            </Button>
            <span className="flex items-center px-2">
              Page {currentPage + 1} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const reportTypes = [
  { value: "financial_summary", label: "Résumé Financier" },
  { value: "operational_efficiency", label: "Efficacité Opérationnelle" },
  { value: "customer_insights", label: "Aperçu Clientèle" },
  { value: "vehicle_utilization", label: "Utilisation Véhicules" },
  { value: "manpower_distribution", label: "Distribution des Manutentionnaires" },
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
  manpower_distribution: [
    { id: "manpower_by_client", label: "Manutentionnaires par Site Client" },
    { id: "total_manpower", label: "Total des Manutentionnaires" },
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
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('last30days');
  const [reportData, setReportData] = useState({
    financial: null,
    operational: null,
    customer: null,
    vehicles: null,
    manpower: null
  });
  const [loading, setLoading] = useState({
    financial: true,
    operational: true,
    customer: true,
    vehicles: true,
    manpower: true
  });

  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedDataPoints, setSelectedDataPoints] = useState([]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [generatedReportDetails, setGeneratedReportDetails] = useState(null);

  const handleDataPointChange = useCallback((pointId) => {
    setSelectedDataPoints(current => 
      current.includes(pointId) 
        ? current.filter(id => id !== pointId)
        : [...current, pointId]
    );
  }, []);

  useEffect(() => {
    const fetchManpowerData = async () => {
      try {
        setLoading(prev => ({ ...prev, manpower: true }));
        const now = new Date();
        let startDate;
        let endDate = now;
        
        switch (timeRange) {
          case 'last7days': startDate = subDays(now, 7); break;
          case 'last30days': startDate = subDays(now, 30); break;
          case 'currentMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
          case 'lastQuarter': startDate = subDays(now, 90); break;
          case 'currentYear': startDate = startOfYear(now); break;
          case 'allTime': startDate = new Date(2000, 0, 1); break;
          default: startDate = subDays(now, 30);
        }

        // 1. D'abord, récupérer tous les sites clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, nom')
          .order('nom');  // Trier par nom

        if (clientsError) throw clientsError;

        console.log('Sites clients trouvés:', clientsData);

        // 2. Ensuite, récupérer toutes les prestations
        const { data: prestationsData, error: prestationsError } = await supabase
          .from('prestations')
          .select(`
            nombre_manutentionnaires,
            client_id,
            date_prestation,
            clients (
              id,
              nom
            )
          `);  // Enlever le filtre de date pour voir toutes les prestations

        if (prestationsError) {
          console.error('Erreur prestations:', prestationsError);
          throw prestationsError;
        }

        console.log('Prestations trouvées:', prestationsData);

        // 3. Créer un map pour tous les sites clients avec leurs stats
        const clientManpowerMap = {};
        
        // Initialiser TOUS les sites clients avec 0 manutentionnaires
        clientsData.forEach(client => {
          clientManpowerMap[client.id] = {
            name: client.nom,
            total: 0,
            count: 0
          };
        });

        // Debug: afficher le map initial
        console.log('Map initial:', clientManpowerMap);

        // Ajouter les manutentionnaires pour chaque prestation
        prestationsData.forEach(p => {
          if (p.client_id) {
            if (!clientManpowerMap[p.client_id]) {
              console.warn(`Client ID ${p.client_id} non trouvé dans la table clients`);
              return;
            }
            
            console.log(`Ajout prestation pour ${clientManpowerMap[p.client_id].name}:`, {
              manutentionnaires: p.nombre_manutentionnaires,
              date: p.date_prestation
            });
            
            // Toujours incrémenter le compteur de prestations
            clientManpowerMap[p.client_id].count += 1;
            
            // Ajouter les manutentionnaires si présents
            if (p.nombre_manutentionnaires) {
              clientManpowerMap[p.client_id].total += p.nombre_manutentionnaires;
            }
          }
        });

        // Debug: afficher le map final
        console.log('Map final:', clientManpowerMap);

        // 4. Convertir en format pour le graphique - GARDER TOUS LES SITES
        const chartData = Object.entries(clientManpowerMap)
          .map(([_, data]) => ({
            name: data.name,
            value: data.total,
            average: data.count > 0 ? data.total / data.count : 0,
            totalServices: data.count
          }))
          .sort((a, b) => b.value - a.value);

        console.log('Données du graphique:', chartData);

        setReportData(prev => ({
          ...prev,
          manpower: {
            data: chartData,
            totalManpower: chartData.reduce((acc, item) => acc + item.value, 0),
            totalSites: chartData.length
          }
        }));
      } catch (error) {
        console.error('Error fetching manpower data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de distribution des manutentionnaires",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, manpower: false }));
      }
    };

    const fetchOtherData = async () => {
      try {
        setLoading(prev => ({ 
          ...prev, 
          financial: true,
          operational: true,
          customer: true,
          vehicles: true
        }));

        const now = new Date();
        let startDate;
        let endDate = now;
        
        switch (timeRange) {
          case 'last7days': startDate = subDays(now, 7); break;
          case 'last30days': startDate = subDays(now, 30); break;
          case 'currentMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
          case 'lastQuarter': startDate = subDays(now, 90); break;
          case 'currentYear': startDate = startOfYear(now); break;
          case 'allTime': startDate = new Date(2000, 0, 1); break;
          default: startDate = subDays(now, 30);
        }

        // Requêtes parallèles pour optimiser les performances
        const [invoicesResponse, servicesResponse, clientsResponse, vehiclesResponse] = await Promise.all([
          // 1. Chiffre d'Affaires
          supabase
            .from('factures')
            .select('montant_ttc, montant_ht, date_emission')
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
            .select('id, created_at'),
          
          // 4. Véhicules
          supabase
            .from('vehicules')
            .select('id, statut')
        ]);

        // Traitement des données financières
        const revenueData = invoicesResponse.data?.reduce((acc, inv) => {
          const date = format(parseISO(inv.date_emission), 'dd/MM');
          const amount = parseFloat(inv.montant_ttc || inv.montant_ht || 0);
          
          const existing = acc.find(item => item.name === date);
          if (existing) {
            existing.value += amount;
          } else {
            acc.push({ name: date, value: amount });
          }
          return acc;
        }, []) || [];

        const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);

        // Traitement des données des prestations
        const completedServices = servicesResponse.data?.filter(s => s.statut === 'Terminée').length || 0;
        const totalServices = servicesResponse.data?.length || 0;

        const servicesData = servicesResponse.data?.reduce((acc, service) => {
          const date = format(parseISO(service.date_prestation), 'dd/MM');
          const existing = acc.find(item => item.name === date);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({ name: date, value: 1 });
          }
          return acc;
        }, []) || [];

        // Traitement des données clients
        const totalClients = clientsResponse.data?.length || 0;
        const newClients = clientsResponse.data?.filter(
          c => parseISO(c.created_at) >= startDate
        ).length || 0;

        // Traitement des données véhicules
        const totalVehicles = vehiclesResponse.data?.length || 0;
        const availableVehicles = vehiclesResponse.data?.filter(v => v.statut === 'Disponible').length || 0;

        setReportData(prev => ({
          ...prev,
          financial: {
            title: "Chiffre d'Affaires",
            value: `${totalRevenue.toLocaleString('fr-FR')} €`,
            icon: <DollarSign />,
            description: `${invoicesResponse.data?.length || 0} factures - ${timeRangeLabels[timeRange]?.toLowerCase()}`,
            chartType: "line",
            data: revenueData.slice(-7)
          },
          operational: {
            title: "Prestations Terminées",
            value: `${completedServices}/${totalServices}`,
            icon: <TrendingUp />,
            description: `${((completedServices/totalServices)*100 || 0).toFixed(1)}% de réussite`,
            chartType: "bar",
            data: servicesData.slice(-7)
          },
          customer: {
            title: "Total Clients",
            value: totalClients.toString(),
            icon: <Users />,
            description: `+${newClients} nouveaux clients`,
            chartType: "line",
            data: [
              { name: 'Existants', value: totalClients - newClients },
              { name: 'Nouveaux', value: newClients }
            ]
          },
          vehicles: {
            title: "Véhicules Disponibles",
            value: `${availableVehicles}/${totalVehicles}`,
            icon: <Truck />,
            description: `${((availableVehicles/totalVehicles)*100 || 0).toFixed(1)}% de disponibilité`,
            chartType: "pie",
            data: [
              { name: 'Disponibles', value: availableVehicles },
              { name: 'Occupés', value: totalVehicles - availableVehicles }
            ]
          }
        }));
      } catch (error) {
        console.error('Error fetching other data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger certaines données du tableau de bord",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ 
          ...prev, 
          financial: false,
          operational: false,
          customer: false,
          vehicles: false
        }));
      }
    };

    // Lancer les deux fetchs en parallèle
    fetchManpowerData();
    fetchOtherData();
  }, [timeRange, toast]);

  useEffect(() => {
    // Écouter les changements dans la table prestations
    const channel = supabase
      .channel('prestations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'prestations'
        },
        (payload) => {
          // Recharger les données quand il y a un changement
          generateReport();
        }
      )
      .subscribe();

    // Nettoyage quand le composant est démonté
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);  // Exécuter une seule fois au montage du composant

  const generateReport = useCallback(async () => {
    if (!selectedReportType || selectedDataPoints.length === 0) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un type et au moins un point de donnée.",
        variant: "destructive"
      });
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
      case 'allTime': startDate = new Date(2000, 0, 1); break;
      default: startDate = subDays(now, 30);
    }

    const pointsDetails = [];

    for (const pointId of selectedDataPoints) {
      const pointLabel = dataPointsOptions[selectedReportType]?.find(opt => opt.id === pointId)?.label || pointId;
      let value = 'N/A';

      try {
        if (selectedReportType === 'manpower_distribution') {
          const { data: prestationsData, error: prestationsError } = await supabase
            .from('prestations')
            .select(`
              nombre_manutentionnaires,
              client_id,
              clients (
                id,
                nom
              )
            `)
            .gte('date_prestation', startDate.toISOString())
            .lte('date_prestation', endDate.toISOString());

          if (!prestationsError && prestationsData) {
            const clientManpowerMap = prestationsData.reduce((acc, p) => {
              // S'assurer que le client existe
              if (!p.clients) return acc;
              
              const clientName = p.clients.nom;
              if (!acc[clientName]) {
                acc[clientName] = {
                  total: 0,
                  count: 0
                };
              }
              
              // Incrémenter le compteur de prestations
              acc[clientName].count += 1;
              
              // Ajouter les manutentionnaires si présents
              if (p.nombre_manutentionnaires) {
                acc[clientName].total += p.nombre_manutentionnaires;
              }
              
              return acc;
            }, {});

            // Transformer les données pour le graphique
            const chartData = Object.entries(clientManpowerMap)
              .map(([name, data]) => ({
                name,
                value: data.total,
                average: data.total / data.count,
                totalServices: data.count
              }))
              .sort((a, b) => b.value - a.value);  // Trier par nombre de manutentionnaires

            if (pointId === 'manpower_by_client') {
              value = `${chartData.length} sites, ${chartData.reduce((acc, item) => acc + item.value, 0)} manutentionnaires`;
            }
          }
        }
        // Ajouter d'autres types de rapports ici si nécessaire
      } catch (error) {
        console.error(`Erreur calcul ${pointId}:`, error);
        value = 'Erreur de calcul';
      }

      pointsDetails.push({ id: pointId, label: pointLabel, value });
    }

    const currentReportDetails = {
      type: reportTypes.find(rt => rt.value === selectedReportType)?.label,
      pointsDetails: pointsDetails,
      period: timeRange,
      format: exportFormat,
      generatedAt: format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })
    };

    setGeneratedReportDetails(currentReportDetails);

    toast({
      title: `Rapport "${currentReportDetails.type}" généré`,
      description: `${currentReportDetails.pointsDetails.map(p => p.label).join(', ')} pour ${timeRangeLabels[currentReportDetails.period]}`,
      duration: 5000
    });
  }, [selectedReportType, selectedDataPoints, timeRange, exportFormat, toast]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground"></h1>
        <p className="text-muted-foreground"></p>
      </div>
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
        {reportData.financial && <ReportCard {...reportData.financial} />}
        {reportData.operational && <ReportCard {...reportData.operational} />}
        {reportData.customer && <ReportCard {...reportData.customer} />}
        {reportData.vehicles && <ReportCard {...reportData.vehicles} />}
      </div>
      
      {/* Widget Manutentionnaires */}
      <div className="grid gap-4">
        {reportData.manpower && (
          <ManpowerDistributionWidget 
            data={reportData.manpower}
            timeRange={timeRange}
          />
        )}
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