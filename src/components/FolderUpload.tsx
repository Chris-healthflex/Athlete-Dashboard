import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FolderUploadProps {
  onFilesLoaded: (data: any[]) => void;
}

const FolderUpload = ({ onFilesLoaded }: FolderUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleParse = async (files: FileList) => {
    setIsProcessing(true);
    const allData: any[] = [];
    const filePromises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.csv')) {
        console.warn(`Skipping non-CSV file: ${file.name}`);
        continue;
      }

      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result;
            if (typeof text !== "string") {
              throw new Error("Invalid file content");
            }

            // Split the text into lines and filter out empty lines
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
              console.warn(`File ${file.name} has no data rows`);
              resolve();
              return;
            }

            // Parse headers (first line)
            const headers = lines[0].split(',').map(header => header.trim());
            
            // Parse data rows
            const parsedData = lines.slice(1).map(row => {
              const values = row.split(',').map(value => value.trim());
              
              // Ensure we have the correct number of values
              if (values.length !== headers.length) {
                console.warn(`Row has ${values.length} values but expected ${headers.length} in file ${file.name}`);
                while (values.length < headers.length) values.push('');
                values.length = headers.length;
              }
              
              const rowObj = headers.reduce((obj, header, i) => {
                obj[header] = values[i] || '';
                return obj;
              }, {} as Record<string, string>);

              // Add source file information
              rowObj['Source File'] = file.name;
              return rowObj;
            });

            // Validate required columns
            const requiredColumns = ['Test Type', 'Limb', 'Result Name', 'Value', 'Repeat', 'Athlete Name'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            
            if (missingColumns.length > 0) {
              console.warn(`File ${file.name} is missing required columns: ${missingColumns.join(', ')}`);
              resolve();
              return;
            }

            // Validate data types and filter valid rows
            const validData = parsedData.filter(row => {
              const value = parseFloat(row['Value']);
              return !isNaN(value);
            });

            if (validData.length > 0) {
              allData.push(...validData);
            }

          } catch (error) {
            console.error(`Error parsing file ${file.name}:`, error);
          }
          resolve();
        };

        reader.onerror = () => {
          console.error(`Error reading file ${file.name}`);
          resolve();
        };

        reader.readAsText(file);
      });

      filePromises.push(promise);
    }

    // Wait for all files to be processed
    await Promise.all(filePromises);
    
    if (allData.length === 0) {
      toast({
        title: "No valid data found",
        description: "None of the CSV files contained valid data.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Files processed successfully",
        description: `Loaded ${allData.length} records from ${files.length} files.`
      });
      onFilesLoaded(allData);
    }
    
    setIsProcessing(false);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleParse(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-primary"
        onClick={() => document.getElementById("folderInput")?.click()}
      >
        <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Select folder with CSV files</h3>
        <p className="text-sm text-gray-500 mt-1">Click to browse</p>
        <input
          id="folderInput"
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          className="hidden"
          onChange={handleFolderSelect}
        />
        <Button variant="outline" className="mt-4" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Select Folder"}
        </Button>
      </div>
    </div>
  );
};

export default FolderUpload; 