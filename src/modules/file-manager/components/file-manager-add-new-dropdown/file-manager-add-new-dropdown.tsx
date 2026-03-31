/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import { Plus, Upload, FolderPlus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui-kit/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { useTranslation } from 'react-i18next';

export const AddDropdownMenu = ({
  onFileUpload,
  onFolderCreate,
}: {
  onFileUpload?: (files: File[]) => void;
  onFolderCreate?: (folderName: string) => void;
}) => {
  const { t } = useTranslation();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  type UploadedFile = {
    id: number;
    name: string;
    size: string;
    file: File;
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [folderName, setFolderName] = useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleCreateFolder = () => {
    setIsCreateFolderModalOpen(true);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = useCallback((files: File[]) => {
    const newFiles = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop: React.DragEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver: React.DragEventHandler = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDragLeave: React.DragEventHandler = useCallback((event) => {
    event.preventDefault();
  }, []);

  const removeFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleUpload = () => {
    if (uploadedFiles.length > 0 && onFileUpload) {
      const filesToUpload = uploadedFiles.map((f) => f.file);
      onFileUpload(filesToUpload);
    }

    setIsUploadModalOpen(false);
    setUploadedFiles([]);
  };

  const handleCancel = () => {
    setIsUploadModalOpen(false);
    setUploadedFiles([]);
  };

  const handleCreateFolderSubmit = () => {
    if (folderName.trim() && onFolderCreate) {
      onFolderCreate(folderName.trim());
    }

    setIsCreateFolderModalOpen(false);
    setFolderName('');
  };

  const handleCreateFolderCancel = () => {
    setIsCreateFolderModalOpen(false);
    setFolderName('');
  };

  const handleFolderNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateFolder();
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="text-sm font-bold rounded">
            <Plus className="h-4 w-4 mr-1" />
            {t('ADD_NEW')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleFileUpload} className="cursor-pointer">
            <Upload className="h-4 w-4 mr-3" />
            File/Folder upload
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCreateFolder} className="cursor-pointer">
            <FolderPlus className="h-4 w-4 mr-3" />
            Create new folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Upload files</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="space-y-6">
            <button
              type="button"
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-16 text-center cursor-pointer w-full bg-transparent"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                const input = document.getElementById('file-input');
                if (input) input.click();
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg text-high-emphasis">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-sm text-medium-emphasis">
                    PDF, DOCX, JPG, PNG | Max size: 25MB per file
                  </p>
                </div>
                <Input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.txt,.doc,.xlsx,.xls,.pptx,.ppt"
                />
              </div>
            </button>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700">
                  Selected files ({uploadedFiles.length})
                </h4>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadedFiles.length === 0}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create new folder</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-sm font-medium">
                Name of the folder*
              </Label>
              <Input
                id="folder-name"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={handleFolderNameKeyDown}
                placeholder="Enter folder name"
                className="w-full"
                autoFocus
              />
              {folderName.trim() && (
                <p className="text-xs text-gray-500">
                  Folder will be created as: &quot;{folderName.trim()}&quot;
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCreateFolderCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolderSubmit}
                disabled={!folderName.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
