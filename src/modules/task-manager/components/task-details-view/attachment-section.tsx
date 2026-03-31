import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { TaskAttachments, FileType } from '../../types/task-manager.types';
import { Button } from '@/components/ui-kit/button';
import {
  Plus,
  Upload,
  File,
  ImageIcon,
  Loader2,
  FileText,
  Download,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui-kit/dialog';
import { Label } from '@/components/ui-kit/label';
import { Input } from '@/components/ui-kit/input';
import { useGetPreSignedUrlForUpload } from '@/lib/api/hooks/use-storage';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ModuleName } from '@/constant/modules.constants';

const getFileType = (file: File): FileType => {
  if (file.type.includes('pdf')) return 'pdf';
  if (file.type.includes('image')) return 'image';
  return 'other';
};

/**
 * AttachmentsSection Component
 *
 * A reusable component for managing task attachments. This component allows users to:
 * - Upload files via drag-and-drop or file selection
 * - View uploaded attachments with details such as name, size, and type
 * - Delete attachments
 * - Show more or fewer attachments in a paginated view
 *
 * Features:
 * - Drag-and-drop file upload with visual feedback
 * - File type and size validation
 * - Displays attachments in a grid layout
 * - Allows users to delete attachments
 * - Supports showing more or fewer attachments with a toggle button
 *
 * Props:
 * @param {string} taskId - The ID of the task
 * @param {string} taskItemId - The ID of the task item
 * @param {Attachment[]} attachments - The list of current attachments
 * @param {React.Dispatch<React.SetStateAction<Attachment[]>>} setAttachments - Callback to update the attachments list
 *
 * @example
 * // Basic usage
 * <AttachmentsSection
 *   taskId={taskId}
 *   taskItemId={task?.ItemId} // Pass the task's ItemId explicitly
 *   attachments={attachments}
 *   onAttachmentsChange={refetchAttachments}
 *   isLoading={isLoadingAttachments}
 * />
 */

interface AttachmentsSectionProps {
  taskId?: string;
  taskItemId?: string;
  attachments: TaskAttachments[];
  onAttachmentsChange: (attachments: TaskAttachments[]) => void;
  isLoading?: boolean;
}

const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const profile = localStorage.getItem('userProfile');
  return profile ? JSON.parse(profile) : null;
};

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';

export function AttachmentsSection({
  taskId,
  taskItemId,
  attachments = [],
  onAttachmentsChange,
  isLoading = false,
}: Readonly<AttachmentsSectionProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [pendingTaskId] = useState(() => uuidv4());
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [userProfile, setUserProfile] = useState(getCurrentUser());
  const { mutate: getPreSignedUrl } = useGetPreSignedUrlForUpload();
  const [isUploading, setIsUploading] = useState(false);

  const effectiveTaskId = taskItemId ?? taskId ?? pendingTaskId;

  useEffect(() => {
    setUserProfile(getCurrentUser());
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFileToStorage = async (url: string, fileToUpload: File) => {
    const response = await fetch(url, {
      method: 'PUT',
      body: fileToUpload,
      headers: {
        'Content-Type': fileToUpload.type,
        'x-ms-blob-type': 'BlockBlob',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return {
      uploadUrl: url.split('?')[0],
      fileSize: fileToUpload.size,
      fileName: fileToUpload.name,
      fileType: fileToUpload.type,
    };
  };

  const handleUploadSuccess = (data: any, file: File, resolve: any) => {
    if (!data.isSuccess || !data.uploadUrl || !data.fileId) {
      console.error('Failed to get presigned URL:', data);
      resolve(null);
      return;
    }

    uploadFileToStorage(data.uploadUrl, file)
      .then((uploadResult) => {
        resolve({
          fileId: data.fileId ?? '',
          uploadUrl: uploadResult.uploadUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileType: uploadResult.fileType,
        });
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        resolve(null);
      });
  };

  const handleUploadError = (error: any, resolve: any) => {
    console.error('Error getting presigned URL:', error);
    resolve(null);
  };

  const processFileUpload = (file: File) => {
    return new Promise<{
      fileId: string;
      uploadUrl: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    } | null>((resolve) => {
      getPreSignedUrl(
        {
          name: file.name,
          projectKey: projectKey,
          itemId: '',
          metaData: '',
          accessModifier: 'Public',
          configurationName: 'Default',
          parentDirectoryId: '',
          tags: '',
          moduleName: ModuleName.DefaultConstruct,
        },
        {
          onSuccess: (data) => handleUploadSuccess(data, file, resolve),
          onError: (error) => handleUploadError(error, resolve),
        }
      );
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!effectiveTaskId) return;

      const handleFileUpload = async () => {
        setIsUploading(true);
        try {
          const uploadPromises = acceptedFiles.map(async (file) => {
            const result = await processFileUpload(file);
            if (!result) {
              throw new Error(`Failed to upload file: ${file.name}`);
            }

            return {
              ItemId: result.fileId,
              FileName: result.fileName,
              FileSize: formatFileSize(result.fileSize),
              FileType: getFileType(file),
              FileUrl: result.uploadUrl,
            } as TaskAttachments;
          });

          const newAttachments = await Promise.all(uploadPromises);
          const validNewAttachments = newAttachments.filter(Boolean);

          if (validNewAttachments.length > 0) {
            onAttachmentsChange([...attachments, ...validNewAttachments]);
          }

          setIsDialogOpen(false);
        } catch (error) {
          console.error('Error uploading files:', error);
          handleError(error);
        } finally {
          setIsUploading(false);
        }
      };

      handleFileUpload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      effectiveTaskId,
      onAttachmentsChange,
      t,
      userProfile?.fullName,
      handleError,
      getPreSignedUrl,
      attachments,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: true,
    disabled: isLoading || isUploading,
    noClick: !effectiveTaskId || isUploading,
    noKeyboard: !effectiveTaskId || isUploading,
  });

  const handleDeleteAttachment = (attachmentId: string) => {
    const updatedAttachments = attachments.filter(
      (attachment) => attachment.ItemId !== attachmentId
    );
    onAttachmentsChange(updatedAttachments);
  };

  const handleDownload = async (attachment: TaskAttachments) => {
    try {
      if (!attachment.FileUrl) {
        throw new Error('No file URL available for download');
      }

      const fileExtension = attachment.FileName.split('.').pop()?.toLowerCase() ?? '';

      const response = await fetch(attachment.FileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.FileName.endsWith(`.${fileExtension}`)
        ? attachment.FileName
        : `${attachment.FileName}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Error downloading file:', error);
      handleError(error);
    }
  };

  const getFileIcon = (type: string) => {
    const iconContainerClass =
      'flex-shrink-0 flex items-center justify-center w-12 h-10 rounded-[7px]';

    switch (type) {
      case 'pdf':
        return (
          <div className={`${iconContainerClass} bg-primary-50`}>
            <FileText className="h-5 w-5 text-primary" />
          </div>
        );
      case 'image':
        return (
          <div className={`${iconContainerClass} bg-error-background`}>
            <ImageIcon className="h-5 w-5 text-error" />
          </div>
        );
      default:
        return (
          <div className={`${iconContainerClass} bg-primary-50`}>
            <File className="h-5 w-5 text-primary" />
          </div>
        );
    }
  };

  const attachmentRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < attachments.length; i += 2) {
      rows.push(attachments.slice(i, i + 2));
    }
    return rows;
  }, [attachments]);

  const visibleRows = useMemo(
    () => (showMore ? attachmentRows : attachmentRows.slice(0, 2)),
    [showMore, attachmentRows]
  );

  const renderEmptyState = () => (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer border-gray-300 hover:border-primary/50"
    >
      <Input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-10 w-10 text-gray-400" />
        <p className="text-sm font-medium">{t('DRAG_AND_DROP_FILES_HERE')}</p>
        <p className="text-xs text-gray-500">
          PDF, DOCX, JPG, PNG | {t('MAX_SIZE')}: 25MB {t('PER_FILE')}
        </p>
      </div>
    </div>
  );

  const renderAttachmentList = () => (
    <div>
      {visibleRows.map((row, rowIndex) => (
        <div
          key={`${row.length}-${rowIndex}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2"
        >
          {row.map((attachment) => (
            <div key={attachment.ItemId} className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.FileType)}
                <div>
                  <p className="text-sm font-medium">{attachment.FileName}</p>
                  <p className="text-xs text-gray-500">{attachment.FileSize}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-medium-emphasis hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(attachment);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-error hover:text-error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAttachment(attachment.ItemId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {attachments.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-sm font-semibold border"
          onClick={() => setShowMore(!showMore)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          {showMore ? t('SHOW_LESS') : t('SHOW_MORE')}
        </Button>
      )}
    </div>
  );

  const renderAttachmentContent = () => {
    if (attachments.length === 0) {
      return renderEmptyState();
    }
    return renderAttachmentList();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Label className="text-high-emphasis text-base font-semibold">{t('ATTACHMENTS')}</Label>
        {attachments.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sm flex items-center gap-1 text-green-600"
              >
                <Plus className="h-4 w-4" />
                {t('ADD')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[672px]">
              <DialogHeader>
                <DialogTitle>{t('UPLOAD_ATTACHMENTS')}</DialogTitle>
              </DialogHeader>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  {isLoading || isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400" />
                      {isDragActive ? (
                        <p>{t('DROP_FILES_HERE')}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium">{t('DRAG_AND_DROP_FILES_HERE')}</p>
                          <p className="text-xs text-gray-500">
                            {t('UPLOAD_ANY_FILE_TYPE_MAX_SIZE')}: 25MB
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {renderAttachmentContent()}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
