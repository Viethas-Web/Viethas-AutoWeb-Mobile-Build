import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileManagerService, FileItem } from './file-manager.service';
import { finalize } from 'rxjs/operators';

type SortField = 'name' | 'size' | 'mtime';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-folders-manager',
  templateUrl: './folders-manager.component.html',
  styleUrls: ['./folders-manager.component.scss'],
})
export class FoldersManagerComponent implements OnInit {
  fileList: FileItem[] = [];
  displayList: FileItem[] = [];
  currentPath: string[] = ['Root'];

  sortField: SortField = 'name';
  sortOrder: SortOrder = 'asc';

  searchText: string = '';
  selectedFile: FileItem | null = null;
  loading: boolean = false;

  // For create folder modal
  newFolderName: string = '';
  @ViewChild('createFolderModal', { static: false })
  createFolderModal!: TemplateRef<any>;
  editingFileContent: string = '';
  editingFilePath: string = '';
  @ViewChild('editFileModal', { static: false })
  editFileModal!: TemplateRef<any>;
  duplicateItemName: string = '';
  duplicateItemType: 'file' | 'folder' = 'file';
  duplicateAction: 'replace' | 'rename' | 'skip' = 'rename';
  @ViewChild('duplicateFileModal', { static: false })
  duplicateFileModal!: TemplateRef<any>;
  constructor(
    private fileManagerService: FileManagerService,
    private nzContextMenuService: NzContextMenuService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit() {
    this.loadFiles();
  }

  /**
   * Load files from server
   */
  loadFiles() {
    this.loading = true;
    const path = this.getCurrentPath();

    this.fileManagerService
      .browse(path)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (files) => {
          this.fileList = files;
          this.updateDisplayList();
        },
        error: (error) => {
          this.message.error('Không thể tải danh sách file: ' + error.message);
        },
      });
  }

  /**
   * Get current path as string
   */
  getCurrentPath(): string {
    return this.currentPath.slice(1).join('/');
  }

  /**
   * Create new folder
   */
  createNewFolder() {
    this.newFolderName = '';

    this.modal.create({
      nzTitle: 'Tạo thư mục mới',
      nzContent: this.createFolderModal,
      nzOnOk: () => {
        const folderName = this.newFolderName.trim();

        if (!folderName) {
          this.message.warning('Vui lòng nhập tên thư mục');
          return false;
        }

        const path = this.getCurrentPath();
        const newPath = path ? `${path}/${folderName}` : folderName;

        return new Promise((resolve, reject) => {
          this.fileManagerService.create(newPath, false).subscribe({
            next: () => {
              this.message.success('Đã tạo thư mục thành công');
              this.loadFiles();
              resolve(true);
            },
            error: (error) => {
              this.message.error('Lỗi tạo thư mục: ' + error.message);
              reject(error);
            },
          });
        });
      },
    });
  }

  /**
   * Sort files
   */
  sortBy(field: SortField) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }

    this.updateDisplayList();
  }

  /**
   * Update display list with search and sort
   */
  private updateDisplayList() {
    this.displayList = [...this.fileList];

    // Filter by search
    if (this.searchText) {
      this.displayList = this.displayList.filter((item) =>
        item.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Sort
    this.displayList.sort((a, b) => {
      // Folders always on top
      if (a.type === 'dir' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'dir') return 1;

      let comparison = 0;

      switch (this.sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'mtime':
          comparison =
            new Date(a.mtime).getTime() - new Date(b.mtime).getTime();
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Context menu
   */
  contextMenu(
    $event: MouseEvent,
    menu: NzDropdownMenuComponent,
    item: FileItem
  ): void {
    this.selectedFile = item;
    this.nzContextMenuService.create($event, menu);
  }

  /**
   * Rename file/folder
   */
  renameFile(item: FileItem) {
    item.isEditing = true;
  }

  confirmRename(item: FileItem, newName: string) {
    if (!newName || !newName.trim()) {
      item.isEditing = false;
      return;
    }

    const newNameTrimmed = newName.trim();
    if (newNameTrimmed === item.name) {
      item.isEditing = false;
      return;
    }

    this.fileManagerService.rename(item.path, newNameTrimmed).subscribe({
      next: () => {
        this.message.success('Đã đổi tên thành công');
        item.isEditing = false;
        this.loadFiles();
      },
      error: (error) => {
        this.message.error('Lỗi đổi tên: ' + error.message);
        item.isEditing = false;
      },
    });
  }

  cancelRename(item: FileItem) {
    item.isEditing = false;
  }

  /**
   * View file details
   */
  viewFile(item: FileItem) {
    this.modal.info({
      nzTitle: 'Thông tin File',
      nzContent: `
        <p><strong>Tên:</strong> ${item.name}</p>
        <p><strong>Loại:</strong> ${
          item.type === 'dir' ? 'Thư mục' : 'File'
        }</p>
        <p><strong>Kích thước:</strong> ${this.formatFileSize(item.size)}</p>
        <p><strong>Ngày tạo:</strong> ${new Date(item.mtime).toLocaleString(
          'vi-VN'
        )}</p>
        <p><strong>Đường dẫn:</strong> ${item.path}</p>
      `,
      nzOkText: 'Đóng',
    });
  }

  /**
   * Delete file/folder
   */
  deleteFile(item: FileItem) {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa "${item.name}"?`,
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.fileManagerService.remove(item.path).subscribe({
          next: () => {
            this.message.success('Đã xóa thành công');
            this.loadFiles();
          },
          error: (error) => {
            this.message.error('Lỗi xóa: ' + error.message);
          },
        });
      },
    });
  }

  /**
   * Edit file content
   */
  editFile(item: FileItem) {
    if (item.type === 'dir') {
      this.message.warning('Không thể chỉnh sửa thư mục');
      return;
    }

    this.loading = true;
    this.fileManagerService.getFileContent(item.path).subscribe({
      next: (content) => {
        this.loading = false;
        this.editingFileContent = content;
        this.editingFilePath = item.path;

        this.modal.create({
          nzTitle: `${item.name}`,
          nzContent: this.editFileModal,
          nzWidth: 900,
          nzOkText: 'Lưu',
          nzCancelText: 'Hủy',
          nzOnOk: () => {
            return new Promise((resolve, reject) => {
              this.fileManagerService
                .editFile(this.editingFilePath, this.editingFileContent)
                .subscribe({
                  next: () => {
                    this.message.success('Đã lưu thay đổi');
                    resolve(true);
                  },
                  error: (error) => {
                    this.message.error('Lỗi lưu file: ' + error.message);
                    reject(error);
                  },
                });
            });
          },
        });
      },
      error: (error) => {
        this.loading = false;
        this.message.error('Không thể đọc file: ' + error.message);
      },
    });
  }

  /**
   * Open folder
   */
  openFolder(item: FileItem) {
    if (item.type === 'dir') {
      this.currentPath.push(item.name);
      this.loadFiles();
    }
  }

  /**
   * Navigate back
   */
  navigateBack() {
    if (this.currentPath.length > 1) {
      this.currentPath.pop();
      this.loadFiles();
    }
  }

  /**
   * Navigate to specific path
   */
  navigateToPath(index: number) {
    if (index < this.currentPath.length - 1) {
      this.currentPath = this.currentPath.slice(0, index + 1);
      this.loadFiles();
    }
  }

  /**
   * Search
   */
  onSearch() {
    this.updateDisplayList();
  }

  /**
   * Extract ZIP file
   */
  extractZip(item: FileItem) {
    if (!item.name.toLowerCase().endsWith('.zip')) {
      this.message.warning('Chỉ hỗ trợ giải nén file ZIP');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Giải nén file',
      nzContent: `Bạn có muốn giải nén "${item.name}"?`,
      nzOkText: 'Giải nén',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.fileManagerService.extract(item.path).subscribe({
          next: () => {
            this.message.success('Đã giải nén thành công');
            this.loadFiles();
          },
          error: (error) => {
            this.message.error('Lỗi giải nén: ' + error.message);
          },
        });
      },
    });
  }

  /**
   * Helper methods
   */
  formatFileSize(bytes: number): string {
    if (!bytes && bytes !== 0) return '';
    return this.fileManagerService.formatFileSize(bytes);
  }

  getFileIcon(item: FileItem): string {
    if (item.type === 'dir') return 'folder';

    const ext = this.fileManagerService.getFileExtension(item.name);
    const iconMap: { [key: string]: string } = {
      pdf: 'file-pdf',
      doc: 'file-word',
      docx: 'file-word',
      xls: 'file-excel',
      xlsx: 'file-excel',
      ppt: 'file-ppt',
      pptx: 'file-ppt',
      jpg: 'file-image',
      jpeg: 'file-image',
      png: 'file-image',
      gif: 'file-image',
      zip: 'file-zip',
      rar: 'file-zip',
      txt: 'file-text',
    };

    return iconMap[ext] || 'file';
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return '';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  /**
   * Check if file exists in current directory
   */
  private fileExists(fileName: string): boolean {
    return this.fileList.some(
      (item) => item.name === fileName && item.type === 'file'
    );
  }

  /**
   * Get new filename with number suffix
   */
  private getNewFileName(originalName: string): string {
    const lastDotIndex = originalName.lastIndexOf('.');
    const nameWithoutExt =
      lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension =
      lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '';

    let counter = 1;
    let newName = originalName;

    while (this.fileExists(newName)) {
      newName = `${nameWithoutExt} (${counter})${extension}`;
      counter++;
    }

    return newName;
  }

  

  /**
   * Handle file upload - Updated version
   */
  handleFileUpload(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const path = this.getCurrentPath();
    const fileArray = Array.from(files) as File[];
    let processedCount = 0;
    let successCount = 0;

    const processNextFile = (index: number) => {
      if (index >= fileArray.length) {
        // All files processed
        if (successCount > 0) {
          this.message.success(
            `Đã tải lên ${successCount}/${fileArray.length} file`
          );
          this.loadFiles();
        }
        // Reset input
        event.target.value = '';
        return;
      }

      const file = fileArray[index];

      this.uploadSingleFile(
        path,
        file,
        () => {
          // Success
          successCount++;
          processedCount++;
          processNextFile(index + 1);
        },
        (error) => {
          // Error
          this.message.error(`Lỗi tải file "${file.name}": ${error.message}`);
          processedCount++;
          processNextFile(index + 1);
        }
      );
    };

    // Start processing files sequentially
    processNextFile(0);
  }

  /**
   * Handle folder upload - With duplicate folder handling using shared modal
   */
  handleFolderUpload(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const folderName = files[0].webkitRelativePath.split('/')[0];
    const basePath = this.getCurrentPath();

    // Kiểm tra thư mục đã tồn tại chưa
    const folderExists = this.fileList.some(
      (item) => item.name === folderName && item.type === 'dir'
    );

    if (folderExists) {
      this.duplicateItemName = folderName;
      this.duplicateItemType = 'folder';
      this.duplicateAction = 'rename';

      this.modal.create({
        nzTitle: 'Thư mục đã tồn tại',
        nzContent: this.duplicateFileModal,
        nzWidth: 500,
        nzOkText: 'Xác nhận',
        nzCancelText: 'Hủy',
        nzOnOk: () => this.handleDuplicateFolderAction(folderName, basePath, files, event),
        nzOnCancel: () => {
          event.target.value = '';
        },
      });
    } else {
      // Không trùng → tạo mới và upload
      const newFolderPath = basePath ? `${basePath}/${folderName}` : folderName;
      this.createFolderAndUpload(newFolderPath, files, event);
    }
  }

  /**
   * Upload files in folder with subfolder structure (Promise-based)
   */
  private async uploadFolderFiles(
    files: FileList,
    folderPath: string,
    event: any
  ) {
    const fileArray = Array.from(files) as File[];

    // Extract all unique directory paths
    const directories = new Set<string>();
    fileArray.forEach((file) => {
      const relativePath = (file as any).webkitRelativePath;
      const filePathInFolder = relativePath.substring(
        relativePath.indexOf('/') + 1
      );
      const lastSlashIndex = filePathInFolder.lastIndexOf('/');

      if (lastSlashIndex > 0) {
        const dirPath = filePathInFolder.substring(0, lastSlashIndex);
        // Add all parent directories
        const parts = dirPath.split('/');
        let currentPath = '';
        parts.forEach((part) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          directories.add(currentPath);
        });
      }
    });

    // Create all directories first
    const dirArray = Array.from(directories).sort();

    for (const dir of dirArray) {
      const dirPath = `${folderPath}/${dir}`;
      try {
        await this.fileManagerService.create(dirPath, false).toPromise();
      } catch (error) {
        // Directory might already exist, continue
        console.warn(`Could not create directory ${dirPath}:`, error);
      }
    }

    // Now upload all files
    let successCount = 0;
    const totalFiles = fileArray.length;

    for (const file of fileArray) {
      const relativePath = (file as any).webkitRelativePath;
      const filePathInFolder = relativePath.substring(
        relativePath.indexOf('/') + 1
      );

      // Get directory path only (remove filename)
      const lastSlashIndex = filePathInFolder.lastIndexOf('/');
      const uploadPath =
        lastSlashIndex > 0
          ? `${folderPath}/${filePathInFolder.substring(0, lastSlashIndex)}`
          : folderPath;

      try {
        await this.fileManagerService.upload(uploadPath, file).toPromise();
        successCount++;
      } catch (error: any) {
        this.message.error(`Lỗi tải file "${file.name}": ${error.message}`);
      }
    }

    if (successCount > 0) {
      this.message.success(`Đã tải lên ${successCount}/${totalFiles} file`);
      this.loadFiles();
    }

    event.target.value = '';
  }

  private handleDuplicateFolderAction(
    folderName: string,
    basePath: string,
    files: FileList,
    event: any
  ) {
    return new Promise((resolve, reject) => {
      if (this.duplicateAction === 'skip') {
        this.message.info(`Đã bỏ qua thư mục: ${folderName}`);
        event.target.value = '';
        resolve(true);
        return;
      }

      let finalFolderPath: string;

      if (this.duplicateAction === 'rename') {
        const newFolderName = this.getNewFolderName(folderName);
        finalFolderPath = basePath ? `${basePath}/${newFolderName}` : newFolderName;
        this.message.info(`Tạo thư mục mới: ${newFolderName}`);
      } else if (this.duplicateAction === 'replace') {
        finalFolderPath = basePath ? `${basePath}/${folderName}` : folderName;
        // Xóa folder cũ trước
        this.fileManagerService.remove(finalFolderPath).subscribe({
          next: () => {
            this.createFolderAndUpload(finalFolderPath, files, event).then(resolve).catch(reject);
          },
          error: (err) => {
            this.message.error(`Không thể xóa thư mục cũ: ${err.message}`);
            reject(err);
          },
        });
        return;
      }

      // Tạo mới và upload
      this.createFolderAndUpload(finalFolderPath, files, event).then(resolve).catch(reject);
    });
  }

  private createFolderAndUpload(
    folderPath: string,
    files: FileList,
    event: any
  ): Promise<void> {
    return this.fileManagerService.create(folderPath, false).toPromise()
      .then(() => this.uploadFolderFiles(files, folderPath, event))
      .catch((error) => {
        this.message.error(`Không thể tạo thư mục: ${error.message}`);
        event.target.value = '';
        throw error;
      });
  }

  private getNewFolderName(originalName: string): string {
    let counter = 1;
    let newName = originalName;

    while (
      this.fileList.some(
        (item) => item.name === newName && item.type === 'dir'
      )
    ) {
      newName = `${originalName} (${counter})`;
      counter++;
    }

    return newName;
  }

  /**
   * Handle single file upload with duplicate check
   */
  private uploadSingleFile(
    path: string,
    file: File,
    onSuccess: () => void,
    onError: (error: any) => void
  ) {
    if (this.fileExists(file.name)) {
      this.duplicateItemName = file.name;
      this.duplicateItemType = 'file';
      this.duplicateAction = 'rename';

      const modal = this.modal.create({
        nzTitle: this.duplicateItemType === 'file' ? 'File đã tồn tại' : 'Thư mục đã tồn tại',
        nzContent: this.duplicateFileModal,
        nzWidth: 500,
        nzOkText: 'Xác nhận',
        nzCancelText: 'Hủy',
        nzOnOk: () => {
          return new Promise((resolve, reject) => {
            if (this.duplicateAction === 'skip') {
              this.message.info(`Đã bỏ qua: ${file.name}`);
              resolve(true);
              return;
            }

            let uploadFile = file;
            if (this.duplicateAction === 'rename') {
              const newFileName = this.getNewFileName(file.name);
              uploadFile = new File([file], newFileName, { type: file.type });
              this.message.info(`Đổi tên thành: ${newFileName}`);
            }

            this.fileManagerService.upload(path, uploadFile).subscribe({
              next: () => {
                onSuccess();
                resolve(true);
              },
              error: (error) => {
                onError(error);
                reject(error);
              },
            });
          });
        },
        nzOnCancel: () => {
          this.message.info(`Đã hủy tải file: ${file.name}`);
        },
      });
    } else {
      this.fileManagerService.upload(path, file).subscribe({
        next: onSuccess,
        error: onError,
      });
    }
  }
}
