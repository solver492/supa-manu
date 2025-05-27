import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Truck, KeyRound, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { success, error, user: loggedInUser } = await login(identifier, password);

    if (success && loggedInUser) {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${loggedInUser.username || loggedInUser.email} !`,
      });
      navigate('/');
    } else {
      toast({
        title: "Erreur de connexion",
        description: error || "Identifiant ou mot de passe incorrect.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-purple-600 to-indigo-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <Card className="w-full max-w-md shadow-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 p-6 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness:150}}
              className="mx-auto mb-4"
            >
              <Truck className="h-16 w-16 text-primary mx-auto" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-foreground">Mon Auxiliaire Déménagement</CardTitle>
            <CardDescription className="text-muted-foreground">Connectez-vous pour accéder à votre espace</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Identifiant ou E-mail</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="votre_email@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-base pr-10"
                  />
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    <span className="sr-only">{showPassword ? "Cacher" : "Montrer"} le mot de passe</span>
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full text-lg py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800">
            <p className="text-xs text-muted-foreground text-center w-full">
              © {new Date().getFullYear()} Mon Auxiliaire Déménagement. Tous droits réservés.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;