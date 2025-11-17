export interface UploadImageResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export interface DeleteImageInput {
  publicId: string;
}
