import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Palette, ShieldCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from '@/hooks/useTheme';

const AppSettingsPage = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSaveSettings = (section) => {
    toast({
      title: "Paramètres sauvegardés",
      description: `Les paramètres de la section "${section}" ont été mis à jour.`,
    });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Paramètres de l'Application</h1>
        <p className="text-muted-foreground">Configurez les préférences globales de l'application.</p>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-card dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary" />Notifications</CardTitle>
          <CardDescription>Gérez vos préférences de notification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="cursor-pointer">Notifications par e-mail</Label>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="appNotifications" className="cursor-pointer">Notifications dans l'application</Label>
            <Switch id="appNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="smsNotifications" className="cursor-pointer">Notifications par SMS (si applicable)</Label>
            <Switch id="smsNotifications" />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => handleSaveSettings("Notifications")} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-card dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Apparence</CardTitle>
          <CardDescription>Personnalisez l'apparence de l'application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Thème</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme" className="w-[180px]">
                <SelectValue placeholder="Choisir un thème" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="language">Langue</Label>
            <Select defaultValue="fr">
              <SelectTrigger id="language" className="w-[180px]">
                <SelectValue placeholder="Choisir une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">Anglais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => handleSaveSettings("Apparence")} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator />

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-card dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" />Sécurité et Confidentialité</CardTitle>
          <CardDescription>Gérez les paramètres de sécurité de votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
            <Label htmlFor="twoFactorAuth" className="cursor-pointer">Authentification à deux facteurs (2FA)</Label>
            <Switch id="twoFactorAuth" />
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="activityLog" className="cursor-pointer">Conserver l'historique d'activité</Label>
            <Switch id="activityLog" defaultChecked />
          </div>
          <Button variant="outline" onClick={() => toast({title: "Fonctionnalité en développement", description: "L'historique de connexion sera bientôt disponible."})}>Voir l'historique de connexion</Button>
          <div className="flex justify-end mt-4">
            <Button onClick={() => handleSaveSettings("Sécurité")} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default AppSettingsPage;