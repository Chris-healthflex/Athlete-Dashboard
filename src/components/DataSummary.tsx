
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSummaryProps {
  data: any[];
}

const DataSummary = ({ data }: DataSummaryProps) => {
  if (!data || data.length === 0) return null;
  
  // Extract unique athletes
  const uniqueAthletes = new Set(data.map(item => item["Athlete Name"] || "Unknown"));
  
  // Extract unique test types
  const uniqueTests = new Set(data.map(item => item["Test Type"] || "Unknown"));
  
  // Calculate average weight if available
  const weights = data
    .map(item => parseFloat(item["Weight"]))
    .filter(weight => !isNaN(weight));
  
  const averageWeight = weights.length > 0 
    ? (weights.reduce((sum, weight) => sum + weight, 0) / weights.length).toFixed(2)
    : "N/A";
  
  // Count total trials
  const totalTrials = new Set(data.map(item => item["Trial ID"])).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Athletes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueAthletes.size}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Test Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueTests.size}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageWeight}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Trials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTrials}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSummary;
