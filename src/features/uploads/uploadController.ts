import { Request, Response } from 'express';
import { uploadService } from './uploadService';

export const uploadController = {
  // Subir una sola imagen
  async uploadSingleImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const result = await uploadService.uploadImage(req.file.buffer, req.file.mimetype);

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al subir imagen'
      });
    }
  },

  // Subir múltiples imágenes
  async uploadMultipleImages(req: Request, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron imágenes'
        });
      }

      const files = req.files.map(file => ({
        buffer: file.buffer,
        mimetype: file.mimetype
      }));

      const results = await uploadService.uploadMultipleImages(files);

      res.status(200).json({
        success: true,
        message: `${results.length} imagen(es) subida(s) exitosamente`,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al subir imágenes'
      });
    }
  },

  // Eliminar imagen
  async deleteImage(req: Request, res: Response) {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere publicId'
        });
      }

      await uploadService.deleteImage(publicId);

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar imagen'
      });
    }
  }
};
