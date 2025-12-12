import React, { useRef, useState } from 'react';
import { UploadCloud, FileVideo, FileImage, FileText, X, Link as LinkIcon, Globe, File } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  icon: 'video' | 'image' | 'document';
  file: File | null;
  onFileSelect: (file: File | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  maxSizeMB: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  accept, 
  icon, 
  file, 
  onFileSelect, 
  url,
  onUrlChange,
  maxSizeMB 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    onUrlChange(''); // Clear URL if file is dropped
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size is ${maxSizeMB}MB.`);
      return;
    }
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUrlChange(val);
    if (val) {
      onFileSelect(null); // Clear file if URL is typed
      setError(null);
    }
  };

  const clearSelection = () => {
    onFileSelect(null);
    onUrlChange('');
    setError(null);
  };

  const hasContent = file || url;

  const renderIcon = (type: 'video' | 'image' | 'document', className: string) => {
    switch (type) {
      case 'video': return <FileVideo className={className} />;
      case 'image': return <FileImage className={className} />;
      case 'document': return <FileText className={className} />;
      default: return <File className={className} />;
    }
  };

  const placeholderText = icon === 'video' ? 'video/doc' : 'image/doc';

  return (
    <div className="flex flex-col gap-2 w-full">
      {!hasContent ? (
        <div className="flex flex-col gap-4">
          <div 
            className={`relative h-40 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group
              ${dragActive ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-slate-200 bg-slate-50/50 hover:border-accent/50 hover:bg-white'}
              ${error ? 'border-red-400 bg-red-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input 
              ref={inputRef}
              type="file" 
              className="hidden" 
              accept={accept} 
              onChange={handleChange}
            />
            
            <div className="p-3 rounded-full bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
              {renderIcon(icon, `w-6 h-6 text-secondary`)}
            </div>
            <p className="text-sm text-secondary font-semibold">Click or Drag File</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide font-medium">
               Max {maxSizeMB}MB
            </p>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Or via Link</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors" />
            </div>
            <input
              type="url"
              className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              placeholder={`Paste ${placeholderText} URL...`}
              value={url}
              onChange={handleUrlInput}
            />
          </div>
          {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center">{error}</p>}
        </div>
      ) : (
        <div className="relative h-64 rounded-2xl border border-secondary/10 bg-white flex flex-col items-center justify-center p-6 shadow-soft animate-pop">
          <button 
            onClick={clearSelection}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="p-6 rounded-full bg-gradient-to-br from-base to-white border border-secondary/5 mb-4 shadow-inner">
             {file ? renderIcon(icon, `w-10 h-10 text-secondary`) : <Globe className="w-10 h-10 text-accent" />}
          </div>
          
          {file ? (
            <>
              <p className="text-base text-secondary font-bold truncate max-w-full px-4 mb-1">{file.name}</p>
              <p className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <p className="text-sm text-secondary font-semibold truncate max-w-full px-4 text-center mb-1">{url}</p>
              <p className="text-xs text-slate-500 font-medium">External Resource</p>
            </>
          )}

          <div className="flex items-center gap-2 mt-6 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/50">
             <UploadCloud className="w-3.5 h-3.5" /> Ready to analyze
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;