import { useState } from 'react';
import {
  X,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { IFileTrashData } from '../../utils/file-manager';
import { v4 as uuidv4 } from 'uuid';
import { IFileData } from '../../types/file-manager.type';
import { Button } from '@/components/ui-kit/button';

interface PreviewProps {
  file: IFileTrashData | IFileData;
  onClose: () => void;
}

// Image Preview Component
const ImagePreview = ({ file, onClose }: Readonly<PreviewProps>) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const getPlaceholderImages = (fileName: string) => {
    const cleanName = fileName.split('.')[0];
    const svgString = [
      '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">',
      '  <rect width="100%" height="100%" fill="#e3f2fd"/>',
      '  <circle cx="400" cy="200" r="80" fill="#1976d2" opacity="0.3"/>',
      '  <circle cx="300" cy="350" r="60" fill="#42a5f5" opacity="0.4"/>',
      '  <circle cx="500" cy="380" r="70" fill="#90caf9" opacity="0.3"/>',
      '  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="#1976d2" text-anchor="middle" dy=".3em">',
      '    IMAGE PREVIEW',
      '  </text>',
      '  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="20" fill="#1976d2" text-anchor="middle" dy=".3em">',
      `    ${cleanName}`,
      '  </text>',
      '</svg>',
    ].join('\n');
    return [
      `https://source.unsplash.com/800x600/?nature,abstract&sig=${cleanName}`,
      `https://dummyimage.com/800x600/4a90e2/ffffff&text=${encodeURIComponent(cleanName)}`,
      `data:image/svg+xml;base64,${btoa(svgString)}`,
    ];
  };

  const imageUrls = getPlaceholderImages(file.name);

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 bg-transparent bg-opacity-50 text-gray-50">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-5 h-5" />
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-gray-300">{file.size}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleZoomOut} className="p-2  hover:bg-opacity-20 rounded-lg">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-2  hover:bg-opacity-20 rounded-lg">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleRotate} className="p-2  hover:bg-opacity-20 rounded-lg">
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm  hover:bg-opacity-20 rounded-lg"
            >
              Reset
            </button>
            <button onClick={onClose} className="p-2  hover:bg-opacity-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {!imageError ? (
            <img
              src={imageUrls[currentImageIndex]}
              alt={file.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              onError={handleImageError}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">{file.name}</h3>
              <p className="text-gray-400">Image preview not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Video Preview Component
const VideoPreview = ({ file, onClose }: Readonly<PreviewProps>) => {
  const getPlaceholderVideo = () => {
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-transparent bg-opacity-50 text-gray-50">
          <div className="flex items-center space-x-3 ">
            <VideoIcon className="w-5 h-5" />
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-gray-300">{file.size}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2  hover:bg-opacity-20 rounded-lg text-gray-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <video
              className="w-full h-auto rounded-lg"
              poster={`https://via.placeholder.com/800x450/2c3e50/ffffff?text=${encodeURIComponent(file.name.split('.')[0])}`}
              controls
            >
              <track
                kind="captions"
                src="/path/to/captions.vtt"
                srcLang="en"
                label="English Captions"
                default
              />
              <track
                kind="subtitles"
                src="/path/to/subtitles-es.vtt"
                srcLang="es"
                label="Spanish Subtitles"
              />
              <source src={getPlaceholderVideo()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

// Audio Preview Component
const AudioPreview = ({ file, onClose }: Readonly<PreviewProps>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime] = useState(0);
  const [duration] = useState(180);
  const [randomHeight] = useState(Math.random() * 40 + 10);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleMute = () => setIsMuted(!isMuted);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Music className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">{file.size}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6">
          <div className="flex items-end space-x-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={uuidv4()}
                className={`bg-white rounded-full transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  width: '3px',
                  height: `${randomHeight}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button onClick={handleMute} className="p-2 hover:bg-gray-100 rounded-lg">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handlePlayPause}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-high-emphasis rounded-full"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Preview Component
const DocumentPreview = ({ file, onClose }: Readonly<PreviewProps>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      default:
        return '📄';
    }
  };

  const generateMockContent = () => {
    return `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(file.name)}</span>
            <div className="flex flex-col w-[50%] md:w-full">
              <h3 className="font-medium text-high-emphasis truncate">{file.name}</h3>
              <p className="text-sm text-medium-emphasis">{file.size}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="hidden md:flex text-sm text-medium-emphasis">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm"
            >
              <ChevronLeft className="md:hidden h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Previous</span>
            </Button>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="md:hidden h-4 w-4 md:ml-2" />
            </Button>
            <button onClick={onClose} className="p-2 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-bold mb-4">Document Preview - Page {currentPage}</h2>
              <div className="whitespace-pre-line text-high-emphasis leading-relaxed">
                {generateMockContent()}
              </div>
              {currentPage > 1 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    This is additional content for page {currentPage}. Each page contains different
                    sections of the document.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FilePreviewProps {
  file: IFileTrashData | IFileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreview = ({ file, isOpen, onClose }: Readonly<FilePreviewProps>) => {
  if (!isOpen || !file || file.fileType === 'Folder') {
    return null;
  }

  const commonProps = { file, onClose };

  switch (file.fileType) {
    case 'Image':
      return <ImagePreview {...commonProps} />;
    case 'Video':
      return <VideoPreview {...commonProps} />;
    case 'Audio':
      return <AudioPreview {...commonProps} />;
    case 'File':
      return <DocumentPreview {...commonProps} />;
    default:
      return null;
  }
};
