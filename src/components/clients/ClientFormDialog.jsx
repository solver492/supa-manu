import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ClientFormDialog = ({ isOpen, onClose, onSubmit, client }) => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    contact: '',
    telephone: '',
    email: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || '',
        adresse: client.adresse || '',
        contact: client.contact || '',
        telephone: client.telephone || '',
        email: client.email || '',
      });
    } else {
      setFormData({ nom: '', adresse: '', contact: '', telephone: '', email: '' });
    }
  }, [client, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{client ? "Modifier le Client" : "Ajouter un Nouveau Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Modifiez les informations du client." : "Remplissez les informations du nouveau client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">Nom</Label>
              <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adresse" className="text-right">Adresse</Label>
              <Input id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">Contact</Label>
              <Input id="contact" name="contact" value={formData.contact} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telephone" className="text-right">Téléphone</Label>
              <Input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">{client ? "Sauvegarder" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFormDialog;