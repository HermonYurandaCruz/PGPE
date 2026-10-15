import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';

export interface UploadedFileSimulated {
  id: string;
  nome: string;
  tamanhoBytes: number;
  tipoMime: string;
  dataUpload: string;
  descricao?: string;
}

@Component({
  selector: 'app-upload-dropzone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-3">
      <!-- Dropzone -->
      <div
        (click)="fileInput.click()"
        (dragover)="$event.preventDefault(); isDragOver.set(true)"
        (dragleave)="isDragOver.set(false)"
        (drop)="onFileDrop($event)"
        class="border-[1.5px] border-dashed rounded-[12px] p-6 text-center cursor-pointer transition-colors bg-[#FCFCFB] hover:bg-[#F7F7F6]"
        [class]="isDragOver() ? 'border-[#1A1A1A] bg-[#F1F1EF]' : 'border-[#D9D8D3] hover:border-[#8E8D88]'"
      >
        <input
          #fileInput
          type="file"
          class="hidden"
          [multiple]="multiple()"
          (change)="onFileInputChange($event)"
        />
        <div class="w-10 h-10 rounded-full bg-[#F1F1EF] mx-auto flex items-center justify-center text-[#6B6A66] mb-2.5">
          <span class="mat-icon text-[22px]">cloud_upload</span>
        </div>
        <p class="text-[13px] font-medium text-[#1A1A1A] mb-0.5">
          Arraste ficheiros ou clique para carregar
        </p>
        <p class="text-[11px] text-[#8E8D88]">
          Formatos aceites: PDF, DOCX, XLSX, DWG até 25 MB
        </p>
      </div>

      <!-- File List -->
      @if (files().length > 0) {
        <div class="space-y-2">
          @for (file of files(); track file.id) {
            <div class="h-12 px-3 border border-[#E6E5E1] rounded-[10px] bg-white flex items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-full bg-[#E8EEFD] text-[#3B6FE0] flex items-center justify-center shrink-0">
                  <span class="mat-icon text-[15px]">description</span>
                </div>
                <div class="min-w-0">
                  <div class="text-[13px] font-medium text-[#1A1A1A] truncate">
                    {{ file.nome }}
                  </div>
                  <div class="text-[11px] text-[#8E8D88] tnum">
                    {{ formatFileSize(file.tamanhoBytes) }} • {{ file.tipoMime }}
                  </div>
                </div>
              </div>

              <button
                type="button"
                (click)="removeFile(file.id); $event.stopPropagation()"
                class="w-7 h-7 rounded-md flex items-center justify-center text-[#8E8D88] hover:text-[#D64545] hover:bg-[#FDE8E8] transition-colors"
                title="Remover ficheiro"
              >
                <span class="mat-icon text-[16px]">delete</span>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AppUploadDropzone {
  files = input<UploadedFileSimulated[]>([]);
  multiple = input<boolean>(true);
  filesChanged = output<UploadedFileSimulated[]>();

  isDragOver = signal(false);

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFileList(Array.from(input.files));
      input.value = '';
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.addFileList(Array.from(event.dataTransfer.files));
    }
  }

  private addFileList(fileList: File[]): void {
    const newItems: UploadedFileSimulated[] = fileList.map(f => ({
      id: 'doc-' + Math.random().toString(36).substring(2, 9),
      nome: f.name,
      tamanhoBytes: f.size,
      tipoMime: f.type || 'application/pdf',
      dataUpload: new Date().toISOString()
    }));

    if (this.multiple()) {
      this.filesChanged.emit([...this.files(), ...newItems]);
    } else {
      this.filesChanged.emit([newItems[0]]);
    }
  }

  removeFile(id: string): void {
    const updated = this.files().filter(f => f.id !== id);
    this.filesChanged.emit(updated);
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
