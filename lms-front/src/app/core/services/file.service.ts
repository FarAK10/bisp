// core/services/file.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  getFileIcon(mimetype: string): string {
    const mimeMap: Record<string, string> = {
      'application/pdf': 'file-pdf',
      'application/msword': 'file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
      'application/vnd.ms-excel': 'file-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
      'application/vnd.ms-powerpoint': 'file-ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-ppt',
      'image/jpeg': 'file-image',
      'image/png': 'file-image',
      'image/gif': 'file-image',
      'text/plain': 'file-text',
      'application/json': 'file-text',
      'video/mp4': 'video-camera',
      'audio/mpeg': 'audio',
    };

    return mimeMap[mimetype] || 'file';
  }
}