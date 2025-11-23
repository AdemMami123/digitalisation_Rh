'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { FormationType, CreateFormationData } from '@/types/formation';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function CreateFormationContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateFormationData>({
    titre: '',
    description: '',
    objectifs_pedagogiques: '',
    type: FormationType.PRESENTIELLE,
    duree: 0,
    formateur: '',
    date_prevue: '',
    lieu: '',
    lien: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (!formData.objectifs_pedagogiques.trim()) {
      newErrors.objectifs_pedagogiques = 'Les objectifs pédagogiques sont requis';
    }
    if (formData.duree <= 0) {
      newErrors.duree = 'La durée doit être supérieure à 0';
    }
    if (!formData.formateur.trim()) {
      newErrors.formateur = 'Le formateur est requis';
    }
    if (!formData.date_prevue) {
      newErrors.date_prevue = 'La date prévue est requise';
    }

    // Validate based on type
    if ((formData.type === FormationType.PRESENTIELLE || formData.type === FormationType.HYBRIDE) && !formData.lieu?.trim()) {
      newErrors.lieu = 'Le lieu est requis pour les formations présentielles et hybrides';
    }
    if ((formData.type === FormationType.EN_LIGNE || formData.type === FormationType.HYBRIDE) && !formData.lien?.trim()) {
      newErrors.lien = 'Le lien est requis pour les formations en ligne et hybrides';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data - remove optional fields if not needed based on type
      const submitData: CreateFormationData = {
        ...formData,
        lieu: (formData.type === FormationType.PRESENTIELLE || formData.type === FormationType.HYBRIDE) ? formData.lieu : undefined,
        lien: (formData.type === FormationType.EN_LIGNE || formData.type === FormationType.HYBRIDE) ? formData.lien : undefined,
      };

      const response = await apiClient<{ success: boolean; message: string }>(
        API_ENDPOINTS.formations.create,
        {
          method: 'POST',
          body: JSON.stringify(submitData),
        }
      );

      if (response.success) {
        router.push('/dashboard/formations');
      } else {
        setError(response.message || 'Erreur lors de la création');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateFormationData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-4xl font-bold mb-2">Créer une Formation</h1>
          <p className="text-muted-foreground">
            Ajoutez une nouvelle formation au catalogue
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informations de la formation</CardTitle>
              <CardDescription>
                Remplissez tous les champs requis pour créer la formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="titre">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => handleChange('titre', e.target.value)}
                    className={errors.titre ? 'border-destructive' : ''}
                    placeholder="Ex: Formation React Avancé"
                  />
                  {errors.titre && (
                    <p className="text-sm text-destructive">{errors.titre}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                    className={`flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.description ? 'border-destructive' : ''}`}
                    placeholder="Décrivez la formation..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Objectifs pédagogiques */}
                <div className="space-y-2">
                  <Label htmlFor="objectifs_pedagogiques">
                    Objectifs Pédagogiques <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="objectifs_pedagogiques"
                    value={formData.objectifs_pedagogiques}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('objectifs_pedagogiques', e.target.value)}
                    className={`flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.objectifs_pedagogiques ? 'border-destructive' : ''}`}
                    placeholder="Listez les objectifs pédagogiques..."
                    rows={4}
                  />
                  {errors.objectifs_pedagogiques && (
                    <p className="text-sm text-destructive">{errors.objectifs_pedagogiques}</p>
                  )}
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type de Formation <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value as FormationType)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value={FormationType.PRESENTIELLE}>Présentielle</option>
                    <option value={FormationType.EN_LIGNE}>En ligne</option>
                    <option value={FormationType.HYBRIDE}>Hybride</option>
                  </select>
                </div>

                {/* Durée et Formateur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duree">
                      Durée (heures) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="duree"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.duree || ''}
                      onChange={(e) => handleChange('duree', parseFloat(e.target.value) || 0)}
                      className={errors.duree ? 'border-destructive' : ''}
                      placeholder="Ex: 8"
                    />
                    {errors.duree && (
                      <p className="text-sm text-destructive">{errors.duree}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formateur">
                      Formateur <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="formateur"
                      value={formData.formateur}
                      onChange={(e) => handleChange('formateur', e.target.value)}
                      className={errors.formateur ? 'border-destructive' : ''}
                      placeholder="Ex: Jean Dupont"
                    />
                    {errors.formateur && (
                      <p className="text-sm text-destructive">{errors.formateur}</p>
                    )}
                  </div>
                </div>

                {/* Date prévue */}
                <div className="space-y-2">
                  <Label htmlFor="date_prevue">
                    Date Prévue <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date_prevue"
                    type="datetime-local"
                    value={formData.date_prevue}
                    onChange={(e) => handleChange('date_prevue', e.target.value)}
                    className={errors.date_prevue ? 'border-destructive' : ''}
                  />
                  {errors.date_prevue && (
                    <p className="text-sm text-destructive">{errors.date_prevue}</p>
                  )}
                </div>

                {/* Lieu (conditional) */}
                {(formData.type === FormationType.PRESENTIELLE || formData.type === FormationType.HYBRIDE) && (
                  <div className="space-y-2">
                    <Label htmlFor="lieu">
                      Lieu <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lieu"
                      value={formData.lieu}
                      onChange={(e) => handleChange('lieu', e.target.value)}
                      className={errors.lieu ? 'border-destructive' : ''}
                      placeholder="Ex: Salle de conférence A, Bâtiment principal"
                    />
                    {errors.lieu && (
                      <p className="text-sm text-destructive">{errors.lieu}</p>
                    )}
                  </div>
                )}

                {/* Lien (conditional) */}
                {(formData.type === FormationType.EN_LIGNE || formData.type === FormationType.HYBRIDE) && (
                  <div className="space-y-2">
                    <Label htmlFor="lien">
                      Lien <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lien"
                      type="url"
                      value={formData.lien}
                      onChange={(e) => handleChange('lien', e.target.value)}
                      className={errors.lien ? 'border-destructive' : ''}
                      placeholder="Ex: https://meet.google.com/xxx-yyyy-zzz"
                    />
                    {errors.lien && (
                      <p className="text-sm text-destructive">{errors.lien}</p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Créer la formation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function CreateFormationPage() {
  return (
    <ProtectedRoute requiredRole="RH">
      <CreateFormationContent />
    </ProtectedRoute>
  );
}
