
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "./FileUpload";
import DataSummary from "./DataSummary";
import Charts from "./Charts";
import DataTable from "./DataTable";
import AthleteProfile from "./AthleteProfile";
import ResultsSummary from "./ResultsSummary";

const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  const handleFileLoaded = (parsedData: any[]) => {
    setData(parsedData);
    setHasData(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Athlete Performance Dashboard</h1>
      
      {!hasData ? (
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Upload Your Data</h2>
            <p className="text-gray-500">
              Upload a CSV file containing athlete performance data to visualize insights and analytics.
            </p>
          </div>
          <FileUpload onFileLoaded={handleFileLoaded} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Data Overview</h2>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              onClick={() => {
                setData([]);
                setHasData(false);
              }}
            >
              Upload Different File
            </button>
          </div>
          
          <DataSummary data={data} />
          <ResultsSummary data={data} />
          
          <Tabs defaultValue="charts">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="athletes">Athletes</TabsTrigger>
              <TabsTrigger value="rawData">Raw Data</TabsTrigger>
            </TabsList>
            <TabsContent value="charts" className="mt-6">
              <Charts data={data} />
            </TabsContent>
            <TabsContent value="athletes">
              <AthleteProfile data={data} />
            </TabsContent>
            <TabsContent value="rawData">
              <DataTable data={data} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
