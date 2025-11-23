'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, MapPin, Link as LinkIcon, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Formation, FormationType } from '@/types/formation';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function FormationsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await apiClient<{ success: boolean; formations: Formation[] }>(
        API_ENDPOINTS.formations.list
      );
      
      if (response.success) {
        setFormations(response.formations || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const response = await apiClient<{ success: boolean; message: string }>(
        API_ENDPOINTS.formations.delete(id),
        { method: 'DELETE' }
      );

      if (response.success) {
        setFormations(formations.filter(f => f.id !== id));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const getTypeLabel = (type: FormationType) => {
    switch (type) {
      case FormationType.PRESENTIELLE:
        return 'Présentielle';
      case FormationType.EN_LIGNE:
        return 'En ligne';
      case FormationType.HYBRIDE:
        return 'Hybride';
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: FormationType) => {
    switch (type) {
      case FormationType.PRESENTIELLE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case FormationType.EN_LIGNE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case FormationType.HYBRIDE:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestion des Formations</h1>
              <p className="text-muted-foreground">
                Gérez les formations internes de l'entreprise
              </p>
            </div>
            {user?.role === 'RH' && (
              <Button
                onClick={() => router.push('/dashboard/formations/create')}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Nouvelle Formation
              </Button>
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Formations List */}
        {formations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <GraduationCap className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Aucune formation</h3>
            <p className="text-muted-foreground mb-6">
              Commencez par créer votre première formation
            </p>
            {user?.role === 'RH' && (
              <Button
                onClick={() => router.push('/dashboard/formations/create')}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Créer une formation
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {formations.map((formation, index) => (
                <motion.div
                  key={formation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
                            formation.type
                          )}`}
                        >
                          {getTypeLabel(formation.type)}
                        </span>
                        {user?.role === 'RH' && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/formations/${formation.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(formation.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">{formation.titre}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {formation.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>{formation.formateur}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(formation.date_prevue)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formation.duree}h</span>
                      </div>
                      {formation.lieu && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{formation.lieu}</span>
                        </div>
                      )}
                      {formation.lien && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LinkIcon className="h-4 w-4" />
                          <a
                            href={formation.lien}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline line-clamp-1"
                          >
                            Lien de la formation
                          </a>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => router.push(`/dashboard/formations/${formation.id}`)}
                      >
                        Voir les détails
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormationsPage() {
  return (
    <ProtectedRoute>
      <FormationsContent />
    </ProtectedRoute>
  );
}
