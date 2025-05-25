import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, KeyRound, Camera } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

const UserProfilePage = () => {
  const { toast } = useToast();
  const { user, updatePassword: updateAuthPasswordContext, loading: authLoading } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [username, setUsername] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchAndSetUserProfile = useCallback(async (authUser) => {
    if (!authUser) return;

    setEmail(authUser.email || '');
    setIsSuperAdmin(authUser.isSuperAdmin || false);
    setUsername(authUser.username || '');
    
    // Fetch additional details from 'profiles' table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', authUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching profile details:", error);
    }
    
    setFullName(profile?.full_name || authUser.username || (authUser.isSuperAdmin ? 'Super Admin Genesis' : 'Utilisateur'));
    setPhone(profile?.phone || '');
    setAvatarUrl(profile?.avatar_url || `https://avatar.vercel.sh/${authUser.email || authUser.username || 'user'}.png?size=128`);

  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      fetchAndSetUserProfile(user);
    }
  }, [user, authLoading, fetchAndSetUserProfile]);


  const handleAvatarChange = async () => {
    const newUrl = prompt("Entrez l'URL de la nouvelle image d'avatar:", avatarUrl);
    if (newUrl && user) {
      setIsSavingProfile(true);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: newUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour l'avatar: " + error.message, variant: "destructive" });
      } else {
        setAvatarUrl(newUrl);
        toast({ title: "Avatar mis à jour", description: "Votre nouvel avatar a été sauvegardé." });
      }
      setIsSavingProfile(false);
    }
  };
  
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);

    const profileUpdates = {
      full_name: fullName,
      phone: phone,
      updated_at: new Date().toISOString(),
      // username could be updated here if it's part of the profiles table and distinct from login identifier
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) {
      toast({ title: "Erreur de mise à jour", description: "Impossible de sauvegarder le profil: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour", description: "Vos informations de profil ont été sauvegardées." });
    }
    setIsSavingProfile(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas.", variant: "destructive" });
      setIsChangingPassword(false);
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erreur", description: "Le nouveau mot de passe doit comporter au moins 6 caractères.", variant: "destructive" });
      setIsChangingPassword(false);
      return;
    }

    const { success, error } = await updateAuthPasswordContext(newPassword);

    if (success) {
      toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été changé avec succès." });
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      toast({ title: "Erreur de modification", description: error || "Impossible de changer le mot de passe.", variant: "destructive" });
    }
    setIsChangingPassword(false);
  };

  if (authLoading && !user) {
    return <div className="flex justify-center items-center h-screen">Chargement du profil...</div>;
  }
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Utilisateur non trouvé. Veuillez vous reconnecter.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Utilisateur</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et paramètres de compte.</p>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-card dark:to-slate-800">
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour votre photo et vos détails personnels ici.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 text-2xl">
                  <AvatarImage src={avatarUrl} alt="Avatar utilisateur" />
                  <AvatarFallback>{fullName ? fullName.charAt(0).toUpperCase() : (username ? username.charAt(0).toUpperCase() : 'U')}</AvatarFallback>
                </Avatar>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background/80 group-hover:bg-background transition-opacity"
                  onClick={handleAvatarChange}
                  disabled={isSavingProfile}
                >
                  <Camera size={16} className="text-muted-foreground" />
                  <span className="sr-only">Changer la photo</span>
                </Button>
              </div>
              <div className="flex-grow text-center sm:text-left">
                 <h2 className="text-2xl font-semibold text-foreground">{fullName}</h2>
                 <p className="text-sm text-muted-foreground">{isSuperAdmin ? "Super Administrateur" : "Utilisateur Standard"}</p>
                 <p className="text-xs text-muted-foreground">Identifiant: {username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName"><User className="inline-block mr-2 h-4 w-4 text-primary" />Nom complet</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSavingProfile} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email"><Mail className="inline-block mr-2 h-4 w-4 text-primary" />Adresse e-mail</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone"><Phone className="inline-block mr-2 h-4 w-4 text-primary" />Numéro de téléphone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSavingProfile} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground" disabled={isSavingProfile}>
                {isSavingProfile ? "Sauvegarde en cours..." : "Sauvegarder les informations"}
              </Button>
            </div>
          </form>
            
          <Separator className="my-8" />

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Changer le mot de passe</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword"><KeyRound className="inline-block mr-2 h-4 w-4 text-primary" />Nouveau mot de passe</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isChangingPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword"><KeyRound className="inline-block mr-2 h-4 w-4 text-primary" />Confirmer nouveau mot de passe</Label>
                  <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={isChangingPassword} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isChangingPassword}>
                {isChangingPassword ? "Modification en cours..." : "Changer le mot de passe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;