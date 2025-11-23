'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FormationType, Formation, UpdateFormationData } from '@/types/formation';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

function EditFormationContent() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateFormationData>({
    titre: '',
    description: '',
    objectifs_pedagogiques: '',
    type: FormationType.PRESENTIELLE,
    duree: 0,
    formateur: '',
    date_prevue: '',
    lieu: '',
    lien: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFormation();
  }, [formationId]);

  const loadFormation = async () => {
    try {
      const response = await apiClient<{ success: boolean; formation: Formation }>(
        API_ENDPOINTS.formations.get(formationId)
      );
      
      if (response.success && response.formation) {
        const formation = response.formation;
        setFormData({
          titre: formation.titre,
          description: formation.description,
          objectifs_pedagogiques: formation.objectifs_pedagogiques || '',
          type: formation.type,
          duree: formation.duree,
          formateur: formation.formateur,
          date_prevue: new Date(formation.date_prevue).toISOString().slice(0, 16),
          lieu: formation.lieu || '',
          lien: formation.lien || ''
        });
      }
    } catch (err) {
      alert('Erreur lors du chargement de la formation');
      router.push('/dashboard/formations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UpdateFormationData) => ({ ...prev, [name]: name === 'duree' ? parseFloat(value) : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre?.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.description?.trim()) newErrors.description = 'La description est requise';
    if (!formData.type) newErrors.type = 'Le type est requis';
    if (!formData.duree || formData.duree <= 0) newErrors.duree = 'La durée doit être supérieure à 0';
    if (!formData.formateur?.trim()) newErrors.formateur = 'Le formateur est requis';
    if (!formData.date_prevue) newErrors.date_prevue = 'La date est requise';

    // Type-specific validation
    if (formData.type === FormationType.PRESENTIELLE || formData.type === FormationType.HYBRIDE) {
      if (!formData.lieu?.trim()) {
        newErrors.lieu = 'Le lieu est requis pour les formations présentielles et hybrides';
      }
    }

    if (formData.type === FormationType.EN_LIGNE || formData.type === FormationType.HYBRIDE) {
      if (!formData.lien?.trim()) {
        newErrors.lien = 'Le lien est requis pour les formations en ligne et hybrides';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      const response = await apiClient<{ success: boolean; message: string }>(
        API_ENDPOINTS.formations.update(formationId),
        {
          method: 'PUT',
          body: JSON.stringify(formData)
        }
      );

      if (response.success) {
        router.push('/dashboard/formations');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/formations')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux formations
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Modifier la formation</CardTitle>
            <CardDescription>
              Modifiez les informations de la formation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  className={errors.titre ? 'border-red-500' : ''}
                />
                {errors.titre && <p className="text-sm text-red-500">{errors.titre}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Objectifs pédagogiques */}
              <div className="space-y-2">
                <Label htmlFor="objectifs_pedagogiques">Objectifs pédagogiques</Label>
                <Textarea
                  id="objectifs_pedagogiques"
                  name="objectifs_pedagogiques"
                  value={formData.objectifs_pedagogiques}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez les objectifs d'apprentissage..."
                />
              </div>

              {/* Type et Durée */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de formation *</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value={FormationType.PRESENTIELLE}>Présentielle</option>
                    <option value={FormationType.EN_LIGNE}>En ligne</option>
                    <option value={FormationType.HYBRIDE}>Hybride</option>
                  </select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duree">Durée (heures) *</Label>
                  <Input
                    id="duree"
                    name="duree"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.duree}
                    onChange={handleChange}
                    className={errors.duree ? 'border-red-500' : ''}
                  />
                  {errors.duree && <p className="text-sm text-red-500">{errors.duree}</p>}
                </div>
              </div>

              {/* Formateur et Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="formateur">Formateur *</Label>
                  <Input
                    id="formateur"
                    name="formateur"
                    value={formData.formateur}
                    onChange={handleChange}
                    className={errors.formateur ? 'border-red-500' : ''}
                  />
                  {errors.formateur && <p className="text-sm text-red-500">{errors.formateur}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_prevue">Date prévue *</Label>
                  <Input
                    id="date_prevue"
                    name="date_prevue"
                    type="datetime-local"
                    value={formData.date_prevue}
                    onChange={handleChange}
                    className={errors.date_prevue ? 'border-red-500' : ''}
                  />
                  {errors.date_prevue && <p className="text-sm text-red-500">{errors.date_prevue}</p>}
                </div>
              </div>

              {/* Lieu (conditionnel) */}
              {(formData.type === FormationType.PRESENTIELLE || formData.type === FormationType.HYBRIDE) && (
                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu *</Label>
                  <Input
                    id="lieu"
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleChange}
                    placeholder="Adresse ou salle de formation"
                    className={errors.lieu ? 'border-red-500' : ''}
                  />
                  {errors.lieu && <p className="text-sm text-red-500">{errors.lieu}</p>}
                </div>
              )}

              {/* Lien (conditionnel) */}
              {(formData.type === FormationType.EN_LIGNE || formData.type === FormationType.HYBRIDE) && (
                <div className="space-y-2">
                  <Label htmlFor="lien">Lien de formation *</Label>
                  <Input
                    id="lien"
                    name="lien"
                    type="url"
                    value={formData.lien}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={errors.lien ? 'border-red-500' : ''}
                  />
                  {errors.lien && <p className="text-sm text-red-500">{errors.lien}</p>}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/formations')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EditFormationPage() {
  return (
    <ProtectedRoute requiredRole="RH">
      <EditFormationContent />
    </ProtectedRoute>
  );
}
