import { Request, Response, NextFunction } from 'express';

// Middleware temporal para validación básica hasta que instales class-validator
export function validateCreateProduct(req: Request, res: Response, next: NextFunction) {
  const { name, price, categoryId } = req.body;

  // Validaciones básicas
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'El nombre es requerido y debe ser un texto válido'
    });
  }

  if (name.length > 255) {
    return res.status(400).json({
      success: false,
      error: 'El nombre no puede exceder 255 caracteres'
    });
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'El precio es requerido y debe ser mayor a 0'
    });
  }

  if (!categoryId || typeof categoryId !== 'number' || categoryId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'La categoría es requerida y debe ser un ID válido'
    });
  }

  if (req.body.stock !== undefined && (typeof req.body.stock !== 'number' || req.body.stock < 0)) {
    return res.status(400).json({
      success: false,
      error: 'El stock debe ser un número no negativo'
    });
  }

  if (req.body.description && typeof req.body.description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'La descripción debe ser un texto'
    });
  }

  if (req.body.description && req.body.description.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'La descripción no puede exceder 1000 caracteres'
    });
  }

  next();
}

export function validateUpdateProduct(req: Request, res: Response, next: NextFunction) {
  const { name, price, categoryId, stock, description } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El nombre debe ser un texto válido'
      });
    }
    if (name.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'El nombre no puede exceder 255 caracteres'
      });
    }
  }

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'El precio debe ser mayor a 0'
    });
  }

  if (categoryId !== undefined && (typeof categoryId !== 'number' || categoryId <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'La categoría debe ser un ID válido'
    });
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({
      success: false,
      error: 'El stock debe ser un número no negativo'
    });
  }

  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'La descripción debe ser un texto'
    });
  }

  if (description !== undefined && description.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'La descripción no puede exceder 1000 caracteres'
    });
  }

  next();
}

export function validateUpdateStock(req: Request, res: Response, next: NextFunction) {
  const { stock } = req.body;

  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({
      success: false,
      error: 'El stock debe ser un número no negativo'
    });
  }

  next();
}