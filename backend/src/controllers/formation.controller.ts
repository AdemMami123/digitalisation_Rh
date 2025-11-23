import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { 
  CreateFormationRequest, 
  UpdateFormationRequest, 
  FormationType 
} from '../types/formation.types';

/**
 * Create a new formation
 * POST /api/formations
 * Access: RH only
 */
export const createFormation = async (req: Request, res: Response): Promise<void> => {
  try {
    const formationData: CreateFormationRequest = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!formationData.titre || !formationData.description || !formationData.objectifs_pedagogiques) {
      res.status(400).json({
        success: false,
        message: 'Titre, description et objectifs pédagogiques sont requis.'
      });
      return;
    }

    if (!formationData.type || !Object.values(FormationType).includes(formationData.type)) {
      res.status(400).json({
        success: false,
        message: 'Type de formation invalide. Doit être PRESENTIELLE, EN_LIGNE ou HYBRIDE.'
      });
      return;
    }

    if (!formationData.duree || formationData.duree <= 0) {
      res.status(400).json({
        success: false,
        message: 'La durée doit être supérieure à 0.'
      });
      return;
    }

    if (!formationData.formateur) {
      res.status(400).json({
        success: false,
        message: 'Le formateur est requis.'
      });
      return;
    }

    if (!formationData.date_prevue) {
      res.status(400).json({
        success: false,
        message: 'La date prévue est requise.'
      });
      return;
    }

    // Validate that PRESENTIELLE or HYBRIDE has lieu
    if ((formationData.type === FormationType.PRESENTIELLE || formationData.type === FormationType.HYBRIDE) && !formationData.lieu) {
      res.status(400).json({
        success: false,
        message: 'Le lieu est requis pour les formations présentielles et hybrides.'
      });
      return;
    }

    // Validate that EN_LIGNE or HYBRIDE has lien
    if ((formationData.type === FormationType.EN_LIGNE || formationData.type === FormationType.HYBRIDE) && !formationData.lien) {
      res.status(400).json({
        success: false,
        message: 'Le lien est requis pour les formations en ligne et hybrides.'
      });
      return;
    }

    // Insert formation into database
    const { data, error } = await supabase
      .from('formations')
      .insert({
        titre: formationData.titre,
        description: formationData.description,
        objectifs_pedagogiques: formationData.objectifs_pedagogiques,
        type: formationData.type,
        duree: formationData.duree,
        formateur: formationData.formateur,
        date_prevue: formationData.date_prevue,
        lieu: formationData.lieu || null,
        lien: formationData.lien || null,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Formation creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la formation.'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Formation créée avec succès.',
      formation: data
    });
  } catch (error) {
    console.error('Create formation error:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de la formation.'
    });
  }
};

/**
 * Get all formations
 * GET /api/formations
 * Access: Authenticated users
 */
export const getFormations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .order('date_prevue', { ascending: true });

    if (error) {
      console.error('Formations fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des formations.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      formations: data || []
    });
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des formations.'
    });
  }
};

/**
 * Get a single formation by ID
 * GET /api/formations/:id
 * Access: Authenticated users
 */
export const getFormationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({
        success: false,
        message: 'Formation non trouvée.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      formation: data
    });
  } catch (error) {
    console.error('Get formation error:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de la formation.'
    });
  }
};

/**
 * Update a formation
 * PUT /api/formations/:id
 * Access: RH only
 */
export const updateFormation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateFormationRequest = req.body;

    // Check if formation exists
    const { data: existingFormation, error: fetchError } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingFormation) {
      res.status(404).json({
        success: false,
        message: 'Formation non trouvée.'
      });
      return;
    }

    // Validate type if provided
    if (updateData.type && !Object.values(FormationType).includes(updateData.type)) {
      res.status(400).json({
        success: false,
        message: 'Type de formation invalide.'
      });
      return;
    }

    // Validate duree if provided
    if (updateData.duree !== undefined && updateData.duree <= 0) {
      res.status(400).json({
        success: false,
        message: 'La durée doit être supérieure à 0.'
      });
      return;
    }

    // Determine final type (existing or updated)
    const finalType = updateData.type || existingFormation.type;

    // Validate lieu for PRESENTIELLE/HYBRIDE
    if ((finalType === FormationType.PRESENTIELLE || finalType === FormationType.HYBRIDE)) {
      const finalLieu = updateData.lieu !== undefined ? updateData.lieu : existingFormation.lieu;
      if (!finalLieu) {
        res.status(400).json({
          success: false,
          message: 'Le lieu est requis pour les formations présentielles et hybrides.'
        });
        return;
      }
    }

    // Validate lien for EN_LIGNE/HYBRIDE
    if ((finalType === FormationType.EN_LIGNE || finalType === FormationType.HYBRIDE)) {
      const finalLien = updateData.lien !== undefined ? updateData.lien : existingFormation.lien;
      if (!finalLien) {
        res.status(400).json({
          success: false,
          message: 'Le lien est requis pour les formations en ligne et hybrides.'
        });
        return;
      }
    }

    // Update formation
    const { data, error } = await supabase
      .from('formations')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Formation update error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la formation.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Formation mise à jour avec succès.',
      formation: data
    });
  } catch (error) {
    console.error('Update formation error:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour de la formation.'
    });
  }
};

/**
 * Delete a formation
 * DELETE /api/formations/:id
 * Access: RH only
 */
export const deleteFormation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if formation exists
    const { data: existingFormation, error: fetchError } = await supabase
      .from('formations')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingFormation) {
      res.status(404).json({
        success: false,
        message: 'Formation non trouvée.'
      });
      return;
    }

    // Delete formation
    const { error } = await supabase
      .from('formations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Formation deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la formation.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Formation supprimée avec succès.'
    });
  } catch (error) {
    console.error('Delete formation error:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression de la formation.'
    });
  }
};
