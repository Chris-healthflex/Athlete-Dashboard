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
    console.log("Starting to parse file:", file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        console.log("File content loaded, first 100 chars:", typeof text, text?.toString().substring(0, 100));
        
        if (typeof text !== "string") {
          throw new Error("Invalid file content");
        }
        
        // Split the text into lines and filter out empty lines
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        console.log("Number of lines after filtering:", lines.length);
        console.log("First line (headers):", lines[0]);
        
        if (lines.length < 2) {
          throw new Error("File must contain headers and at least one row of data");
        }

        // Parse headers (first line)
        const headers = lines[0].split(',').map(header => header.trim());
        console.log("Parsed headers:", headers);
        
        // Parse data rows
        const parsedData = lines.slice(1).map((row, index) => {
          const values = row.split(',').map(value => value.trim());
          console.log(`Row ${index + 1} values:`, values);
          
          // Ensure we have the correct number of values
          if (values.length !== headers.length) {
            console.warn(`Row ${index + 1} has ${values.length} values but expected ${headers.length}. Row: ${row}`);
            // Pad or truncate the values array to match headers length
            while (values.length < headers.length) values.push('');
            values.length = headers.length;
          }
          
          const rowObj = headers.reduce((obj, header, i) => {
            obj[header] = values[i] || '';
            return obj;
          }, {} as Record<string, string>);
          
          console.log(`Row ${index + 1} parsed object:`, rowObj);
          return rowObj;
        });

        // Validate required columns
        const requiredColumns = ['Test Type', 'Limb', 'Result Name', 'Value', 'Repeat'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        console.log("Missing required columns:", missingColumns);
        
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        // Validate data types
        const validData = parsedData.filter((row, index) => {
          const value = parseFloat(row['Value']);
          const isValid = !isNaN(value);
          if (!isValid) {
            console.warn(`Row ${index + 1} has invalid Value:`, row['Value']);
          }
          return isValid;
        });

        console.log("Number of valid rows:", validData.length);
        console.log("First valid row example:", validData[0]);

        if (validData.length === 0) {
          throw new Error("No valid data rows found");
        }

        console.log("Calling onFileLoaded with valid data");
        onFileLoaded(validData);
        
        toast({
          title: "File uploaded successfully",
          description: `Loaded ${validData.length} records from the CSV file.`
        });
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Error parsing file",
          description: error instanceof Error ? error.message : "The file format is incorrect or the file is corrupted.",
          variant: "destructive"
        });
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast({
        title: "Error reading file",
        description: "Failed to read the file. Please try again.",
        variant: "destructive"
      });
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
