
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileLoaded: (data: any[]) => void;
}

const FileUpload = ({ onFileLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleParse = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") return;
        
        // Parse CSV
        const headers = text.slice(0, text.indexOf('\n')).split(',');
        const rows = text.slice(text.indexOf('\n') + 1).split('\n');
        
        const parsedData = rows
          .filter(row => row.trim() !== '')
          .map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, i) => {
              obj[header.trim()] = values[i]?.trim() || '';
              return obj;
            }, {} as Record<string, string>);
          });
        
        onFileLoaded(parsedData);
        
        toast({
          title: "File uploaded successfully",
          description: `Loaded ${parsedData.length} records from the CSV file.`
        });
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Error parsing file",
          description: "The file format is incorrect or the file is corrupted.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleParse(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleParse(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-secondary/50" : "border-gray-300 hover:border-primary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Drag and drop your CSV file here</h3>
        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="outline" className="mt-4">
          Select CSV File
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
