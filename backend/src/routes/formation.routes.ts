import { Router } from 'express';
import {
  createFormation,
  getFormations,
  getFormationById,
  updateFormation,
  deleteFormation
} from '../controllers/formation.controller';
import { authenticate, requireRH } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/formations
 * @desc    Create a new formation
 * @access  Private (RH only)
 */
router.post('/', authenticate, requireRH, createFormation);

/**
 * @route   GET /api/formations
 * @desc    Get all formations
 * @access  Private (authenticated users)
 */
router.get('/', authenticate, getFormations);

/**
 * @route   GET /api/formations/:id
 * @desc    Get a single formation by ID
 * @access  Private (authenticated users)
 */
router.get('/:id', authenticate, getFormationById);

/**
 * @route   PUT /api/formations/:id
 * @desc    Update a formation
 * @access  Private (RH only)
 */
router.put('/:id', authenticate, requireRH, updateFormation);

/**
 * @route   DELETE /api/formations/:id
 * @desc    Delete a formation
 * @access  Private (RH only)
 */
router.delete('/:id', authenticate, requireRH, deleteFormation);

export default router;
