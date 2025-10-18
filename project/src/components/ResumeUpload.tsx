import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  onAnalyze: (text: string, fileName: string) => Promise<void>;
  isAnalyzing: boolean;
}

export default function ResumeUpload({ onAnalyze, isAnalyzing }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt');

    if (!isText && !validTypes.includes(file.type)) {
      alert('Please upload a text file (.txt). PDF and DOCX support coming soon!');
      return;
    }

    setFileName(file.name);

    try {
      const text = await extractTextFromFile(file);
      await onAnalyze(text, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept=".txt,text/plain"
          disabled={isAnalyzing}
        />

        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center ${isAnalyzing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 mb-4 animate-spin" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Analyzing Your Resume...
              </p>
              <p className="text-sm text-gray-500">
                Please wait while our AI analyzes your resume
              </p>
            </>
          ) : fileName ? (
            <>
              <FileText className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {fileName}
              </p>
              <p className="text-sm text-gray-500">
                Click or drag to upload a different file
              </p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Upload Your Resume
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supports: TXT files (PDF & DOCX coming soon)
              </p>
            </>
          )}
        </label>
      </div>

      {!isAnalyzing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> For best results, save your resume as a .txt file with clear sections for
            Contact Info, Summary, Experience, Skills, and Education.
          </p>
        </div>
      )}
    </div>
  );
}
