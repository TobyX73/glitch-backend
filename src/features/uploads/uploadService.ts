import cloudinary from '../../config/cloudinary';
import { UploadImageResponse } from './uploadTypes';

export const uploadService = {
  // Subir imagen a Cloudinary desde buffer
  async uploadImage(buffer: Buffer, mimetype: string): Promise<UploadImageResponse> {
    try {
      // Convertir buffer a base64
      const b64 = Buffer.from(buffer).toString('base64');
      const dataURI = `data:${mimetype};base64,${b64}`;

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'glitch-products',
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Limitar tamaño máximo
          { quality: 'auto:good' } // Optimización automática
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      };
    } catch (error) {
      console.error('❌ Error completo de Cloudinary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al subir imagen: ${errorMessage}`);
    }
  },

  // Eliminar imagen de Cloudinary
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Error al eliminar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Subir múltiples imágenes
  async uploadMultipleImages(files: { buffer: Buffer; mimetype: string }[]): Promise<UploadImageResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file.buffer, file.mimetype));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Error al subir múltiples imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
};
