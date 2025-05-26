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
    { id: "revenue", label: "Revenus Totaux" }, { id: "avg_invoice_value", label: "Valeur Moyenne Facture" },
    { id: "paid_invoices", label: "Factures Payées" }, {id: "pending_invoices", label: "Factures en Attente"}
  ],
  operational_efficiency: [
    { id: "completed_jobs", label: "Prestations Terminées" }, { id: "avg_job_duration", label: "Durée Moyenne Prestation (Simulée)" },
    { id: "jobs_per_team", label: "Prestations par Équipe (Top)" }, {id: "jobs_status_distribution", label: "Répartition Statuts Prestations"}
  ],
  customer_insights: [
    { id: "total_customers", label: "Nombre Total de Clients" }, { id: "new_customers_period", label: "Nouveaux Clients (Période)" },
  ],
  vehicle_utilization: [
    { id: "total_vehicles", label: "Nombre Total de Véhicules" }, {id: "vehicle_status_distribution", label: "Répartition Statuts Véhicules"}
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
        // 1. Chiffre d'Affaires (Payé)
        const { data: invoicesData, error: invoicesError } = await supabase
            .from('factures')
            .select('montant_ttc, statut')
            .eq('statut', 'Payée')
            .gte('date_emission', startDate.toISOString())
            .lte('date_emission', endDate.toISOString());
            
        if (invoicesError) {
            console.error("Erreur factures:", invoicesError);
            throw invoicesError;
        }

        const totalRevenue = invoicesData?.reduce((sum, inv) => {
            const amount = typeof inv.montant_ttc === 'string' ? 
                parseFloat(inv.montant_ttc.replace(',', '.')) : 
                (inv.montant_ttc || 0);
            return sum + amount;
        }, 0) || 0;

        // 2. Prestations Terminées
        const { data: servicesData, error: servicesError } = await supabase
            .from('prestations')
            .select('id, statut')
            .eq('statut', 'Terminée')
            .gte('date_prestation', startDate.toISOString())
            .lte('date_prestation', endDate.toISOString());
            
        if (servicesError) {
            console.error("Erreur prestations:", servicesError);
            throw servicesError;
        }

        const completedServices = servicesData?.length || 0;

        // 3. Total Clients
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('id');
            
        if (clientsError) {
            console.error("Erreur clients:", clientsError);
            throw clientsError;
        }

        const totalClients = clientsData?.length || 0;

        const newReportData = {
            financial: {
                title: "Chiffre d'Affaires (Payé)",
                value: `${totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                icon: <DollarSign />,
                description: `Sur ${timeRangeLabels[timeRange]?.toLowerCase() || 'la période'}`,
                chartType: 'line',
                data: []
            },
            operational: {
                title: "Prestations Terminées",
                value: completedServices.toString(),
                icon: <Truck />,
                description: `Sur ${timeRangeLabels[timeRange]?.toLowerCase() || 'la période'}`,
                chartType: 'bar',
                data: []
            },
            customer: {
                title: "Total Clients",
                value: totalClients.toString(),
                icon: <Users />,
                description: `Au ${format(now, "dd/MM/yyyy")}`,
                chartType: 'line',
                data: []
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
  
  const handlePrintReport = () => {
     if (!generatedReportDetails) return;
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
          .chart-placeholder { width: 80%; height: 200px; background-color: #f0f0f0; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-style: italic; color: #888; border: 1px dashed #ccc; }
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

     generatedReportDetails.pointsDetails.forEach(point => {
        printWindow.document.write('<div class="report-section">');
        printWindow.document.write(`<h3>${point.label}</h3>`);
        printWindow.document.write(`<p>Valeur: ${point.value || 'N/A'}</p>`);
        printWindow.document.write('<div class="chart-placeholder">Visualisation graphique pour ' + point.label + ' (Simulation)</div>');
        printWindow.document.write('</div>');
     });
     
     printWindow.document.write('<script>setTimeout(() => { window.print(); window.close(); }, 250);</script>');
     printWindow.document.write('</body></html>');
     printWindow.document.close();
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

        if (selectedReportType === 'financial_summary') {
            if (pointId === 'revenue') {
                const { data, error } = await supabase.from('factures').select('montant_ttc').eq('statut', 'Payée').gte('date_emission', sDate).lte('date_emission', eDate);
                if (!error) value = `${data.reduce((sum, inv) => sum + (inv.montant_ttc || 0), 0).toFixed(2)} €`;
            } else if (pointId === 'paid_invoices') {
                 const { count, error } = await supabase.from('factures').select('*', {count: 'exact', head:true}).eq('statut', 'Payée').gte('date_emission', sDate).lte('date_emission', eDate);
                 if(!error) value = `${count} factures`;
            }
        } else if (selectedReportType === 'operational_efficiency') {
             if (pointId === 'completed_services') {
                const { count, error } = await supabase.from('prestations').select('*', {count: 'exact', head:true}).eq('statut', 'Terminée').gte('date_prestation', sDate).lte('date_prestation', eDate);
                 if(!error) value = `${count} prestations`;
             }
        } else if (selectedReportType === 'customer_insights') {
            if (pointId === 'total_customers') {
                const { count, error } = await supabase.from('clients').select('*', {count: 'exact', head:true});
                if(!error) value = `${count} clients`;
            }
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
      duration: 7000,
      action: (
        <div className="flex flex-col space-y-2">
            <Button variant="outline" size="sm" onClick={handlePrintReport}>
                <Printer className="mr-2 h-4 w-4" /> Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert(`Simulation: Téléchargement du rapport en ${exportFormat.toUpperCase()}...`)}>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ReportCard {...reportData.financial} />
        <ReportCard {...reportData.operational} />
        <ReportCard {...reportData.customer} />
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
              <Label htmlFor="exportFormat" className="font-semibold">Format d'Export (Simulation)</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="exportFormat"><SelectValue placeholder="Choisir un format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (Impression)</SelectItem>
                  <SelectItem value="csv">CSV (Simulation)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX) (Simulation)</SelectItem>
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