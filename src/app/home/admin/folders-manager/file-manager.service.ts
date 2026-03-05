import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  vcode: number;
  msg: string;
  data?: T;
}

export interface FileItem {
  name: string;
  type: 'file' | 'dir';
  size: number;
  mtime: string;
  path: string;
  isEditing?: boolean;
}

export interface FileContent {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private apiUrl = window.location.hostname !== 'localhost' ? `${window.location.origin}/phps/filemanager.php` : 'https://domain07.webappgiare.vn/phps/filemanager.php';

  constructor(private http: HttpClient) {}

  /**
   * Browse - Liệt kê nội dung thư mục
   */
  browse(path: string = ''): Observable<FileItem[]> {
    return this.http.get<ApiResponse<FileItem[]>>(this.apiUrl, {
      params: { action: 'browse', path }
    }).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
        return response.data || [];
      })
    );
  }

  /**
   * New - Tạo file hoặc thư mục
   */
  create(path: string, isFile: boolean = false): Observable<void> {
    return this.http.get<ApiResponse>(this.apiUrl, {
      params: { 
        action: 'new', 
        path,
        isfile: isFile.toString()
      }
    }).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
      })
    );
  }

  /**
   * Remove - Xóa file hoặc thư mục
   */
  remove(path: string): Observable<void> {
    return this.http.get<ApiResponse>(this.apiUrl, {
      params: { action: 'remove', path }
    }).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
      })
    );
  }

  /**
   * Get - Lấy nội dung file
   */
  getFileContent(path: string): Observable<string> {
    return this.http.get<ApiResponse<FileContent[]>>(this.apiUrl, {
      params: { action: 'get', path }
    }).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
        return response.data?.[0]?.content || '';
      })
    );
  }

  /**
   * Edit - Cập nhật nội dung file
   */
  editFile(path: string, content: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse>(
      `${this.apiUrl}?action=edit&path=${encodeURIComponent(path)}`,
      { content },
      { headers }
    ).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
      })
    );
  }

  /**
   * Rename - Đổi tên file hoặc thư mục
   */
  rename(path: string, newName: string): Observable<void> {
    return this.http.get<ApiResponse>(this.apiUrl, {
      params: { 
        action: 'rename', 
        path,
        new_name: newName
      }
    }).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
      })
    );
  }

  /**
   * Upload - Tải file lên
   */
  upload(path: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse>(
      `${this.apiUrl}?action=upload&path=${encodeURIComponent(path)}`,
      formData
    ).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
      })
    );
  }

  /**
   * Extract - Giải nén file ZIP
   */
  extract(path: string): Observable<void> {
    return this.http.get<ApiResponse>(this.apiUrl, {
      params: { action: 'extract', path }
    }).pipe(
      map(response => {
        if (response.vcode !== 0) {
          throw new Error(this.getErrorMessage(response.vcode));
        }
      })
    );
  }

  /**
   * Helper: Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '-';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper: Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Helper: Get error message from vcode
   */
  getErrorMessage(vcode: number): string {
    const messages: { [key: number]: string } = {
      0: 'Thành công',
      1: 'Đường dẫn không hợp lệ',
      2: 'Thao tác thất bại',
      3: 'Tên trùng hoặc file đã tồn tại',
      4: 'Không hỗ trợ hoặc ghi thất bại',
      400: 'Sai định dạng content-type',
      405: 'Phương thức HTTP không hợp lệ'
    };
    
    return messages[vcode] || 'Lỗi không xác định';
  }
}