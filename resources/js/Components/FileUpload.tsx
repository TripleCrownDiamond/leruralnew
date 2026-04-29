import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { CheckCircle, FileText, Loader2, Upload, X } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile?: File | null;
    onRemove?: () => void;
    label?: string;
    accept?: string;
    maxSize?: number;
    className?: string;
    disabled?: boolean;
    showProgress?: boolean;
    uploadProgress?: number;
    isUploading?: boolean;
}

export default function FileUpload({
    onFileSelect,
    selectedFile,
    onRemove,
    label = 'Preuve de paiement',
    accept = 'image/*,.pdf,.doc,.docx',
    maxSize = 5,
    className = '',
    disabled = false,
    showProgress = false,
    uploadProgress = 0,
    isUploading = false,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generatePreview = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setPreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const validateFile = (file: File): boolean => {
        if (file.size > maxSize * 1024 * 1024) {
            setError(`Le fichier est trop volumineux. Taille maximale: ${maxSize}Mo`);
            return false;
        }

        const acceptedTypes = accept.split(',').map((type) => type.trim().toLowerCase());
        const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
        const mime = file.type.toLowerCase();

        const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith('.')) return extension === type;
            if (type.endsWith('/*')) return mime.startsWith(type.replace('/*', '/'));
            return mime === type;
        });

        if (!isAccepted) {
            setError(`Type de fichier non accepte. Formats acceptes: ${accept}`);
            return false;
        }

        setError(null);
        return true;
    };

    const processFile = (file: File) => {
        if (!validateFile(file)) return;
        generatePreview(file);
        onFileSelect(file);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = event.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onRemove?.();
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>}

            <div
                className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                    disabled
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                        : error
                            ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                            : selectedFile
                                ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                                : isDragging
                                    ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                {selectedFile ? (
                    <div className="relative h-full w-full p-4">
                        {isUploading && showProgress && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-black/50">
                                <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                                <div className="mb-2 h-2 w-full max-w-[200px] rounded-full bg-white/20">
                                    <div className="h-2 rounded-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                                <p className="text-xs text-white">Upload: {uploadProgress}%</p>
                            </div>
                        )}

                        {preview ? (
                            <div className="relative h-full w-full">
                                <img src={preview} alt="Preview" className="h-full w-full rounded-md object-contain" />
                                <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/50 p-2 text-xs text-white">
                                    <div className="flex items-center justify-between">
                                        <span className="truncate">{selectedFile.name}</span>
                                        <span>{formatFileSize(selectedFile.size)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center">
                                <FileText className="h-12 w-12 text-gray-400" />
                                <div className="mt-3 text-center">
                                    <p className="max-w-[200px] truncate text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                                </div>
                            </div>
                        )}

                        {!disabled && !isUploading && (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemove();
                                }}
                                className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-red-500 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        <div className="absolute left-2 top-2 rounded-full bg-green-500 p-1.5">
                            <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`mb-3 h-8 w-8 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Cliquez pour uploader</span> ou glissez-deposez
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{accept} (MAX. {maxSize}Mo)</p>
                    </div>
                )}

                <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} disabled={disabled} className="hidden" />
            </div>

            {error && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                    <span className="font-medium">Erreur:</span> {error}
                </p>
            )}

            {selectedFile && !error && (
                <p className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>Fichier pret: {selectedFile.name}</span>
                </p>
            )}
        </div>
    );
}