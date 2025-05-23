import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "./FileUpload";
import FolderUpload from "./FolderUpload";
import DataSummary from "./DataSummary";
import Charts from "./Charts";
import DataTable from "./DataTable";
import ResultsSummary from "./ResultsSummary";
import { useToast } from "@/components/ui/use-toast";
import ErrorBoundary from "./ErrorBoundary";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [selectedLimb, setSelectedLimb] = useState<string>("");
  const [selectedAthlete, setSelectedAthlete] = useState<string>("all_athletes");
  const { toast } = useToast();

  const handleFileLoaded = (parsedData: any[]) => {
    console.log("Received data:", parsedData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      toast({
        title: "Error",
        description: "No valid data was loaded from the file.",
        variant: "destructive"
      });
      return;
    }
    setData(parsedData);
    setHasData(true);
  };

  // Get filtered data based on selected athlete
  const filteredData = data.filter(item => 
    selectedAthlete === "all_athletes" || item["Athlete Name"] === selectedAthlete
  );

  // Get unique athletes
  const athletes = [...new Set(data.map(item => item["Athlete Name"]))].filter(Boolean);

  useEffect(() => {
    console.log("Current state:", {
      hasData,
      dataLength: data.length,
      selectedTestType,
      selectedLimb,
      selectedAthlete
    });
  }, [data, hasData, selectedTestType, selectedLimb, selectedAthlete]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Athlete Performance Dashboard</h1>
      
      {!hasData ? (
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Upload Your Data</h2>
            <p className="text-gray-500 mb-4">
              Upload either a single CSV file or select a folder containing multiple CSV files.
            </p>
            <Tabs defaultValue="file">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="file">Single File</TabsTrigger>
                <TabsTrigger value="folder">Folder</TabsTrigger>
              </TabsList>
              <TabsContent value="file">
                <ErrorBoundary>
                  <FileUpload onFileLoaded={handleFileLoaded} />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="folder">
                <ErrorBoundary>
                  <FolderUpload onFilesLoaded={handleFileLoaded} />
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Data Overview</h2>
            <div className="flex items-center gap-4">
              <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select athlete" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all_athletes">All Athletes</SelectItem>
                    {athletes.map((athlete, index) => (
                      <SelectItem key={index} value={athlete}>{athlete}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => {
                  setData([]);
                  setHasData(false);
                  setSelectedTestType("");
                  setSelectedLimb("");
                  setSelectedAthlete("all_athletes");
                }}
              >
                Upload Different Files
              </button>
            </div>
          </div>
          
          {filteredData.length > 0 ? (
            <>
              <ErrorBoundary>
                <DataSummary data={filteredData} />
              </ErrorBoundary>
              
              {selectedAthlete === "all_athletes" ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Please select an athlete from the dropdown above to view detailed analysis and charts.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ErrorBoundary>
                    <ResultsSummary 
                      data={filteredData} 
                      onTestTypeChange={setSelectedTestType}
                      onLimbChange={setSelectedLimb}
                    />
                  </ErrorBoundary>
                  
                  <Tabs defaultValue="charts">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                      <TabsTrigger value="charts">Charts</TabsTrigger>
                      <TabsTrigger value="rawData">Raw Data</TabsTrigger>
                    </TabsList>
                    <TabsContent value="charts" className="mt-6">
                      <ErrorBoundary>
                        <Charts 
                          data={filteredData} 
                          selectedTestType={selectedTestType}
                          selectedLimb={selectedLimb}
                        />
                      </ErrorBoundary>
                    </TabsContent>
                    <TabsContent value="rawData">
                      <ErrorBoundary>
                        <DataTable data={filteredData} />
                      </ErrorBoundary>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              No data available for the selected athlete. Please select a different athlete or upload different files.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
