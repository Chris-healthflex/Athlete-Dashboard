import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartsProps {
  data: any[];
  selectedTestType?: string;
  selectedLimb?: string;
}

const Charts = ({ data, selectedTestType, selectedLimb }: ChartsProps) => {
  const [selectedAthlete, setSelectedAthlete] = useState<string>("all_athletes");
  const [selectedMetric, setSelectedMetric] = useState<string>("all_metrics");
  
  if (!data || data.length === 0) return null;

  // Get unique athletes
  const athletes = [...new Set(data.map(item => item["Athlete Name"]))];
  
  // Get unique result names (metrics)
  const metrics = [...new Set(data.map(item => item["Result Name"]))].filter(Boolean);
  
  // Filter data for the selected athlete, metric, test type, and limb
  const filteredData = data.filter(item => {
    const athleteMatch = selectedAthlete === "all_athletes" || item["Athlete Name"] === selectedAthlete;
    const metricMatch = selectedMetric === "all_metrics" || item["Result Name"] === selectedMetric;
    const testTypeMatch = !selectedTestType || item["Test Type"] === selectedTestType;
    const limbMatch = !selectedLimb || item["Limb"] === selectedLimb;
    return athleteMatch && metricMatch && testTypeMatch && limbMatch;
  });
  
  // For a selected metric, we need to group by Test Type and Limb to ensure correct data representation
  const groupedMetricData = new Map();
  
  if (selectedMetric !== "all_metrics") {
    filteredData
      .filter(item => item["Result Name"] === selectedMetric && item["Value"] !== undefined && item["Value"] !== "")
      .forEach(item => {
        const key = `${item["Test Type"]}_${item["Limb"]}_${item["Repeat"] || 0}`;
        
        // For each test type and limb combination, we only keep one value per rep
        if (!groupedMetricData.has(key) || parseFloat(item["Value"]) > parseFloat(groupedMetricData.get(key)["Value"])) {
          groupedMetricData.set(key, item);
        }
      });
  }
  
  // Prepare data for bar chart - only include data for the selected metric
  const chartData = Array.from(groupedMetricData.values())
    .map((item, index) => ({
      name: `Rep ${item["Repeat"] || index + 1}`,
      value: parseFloat(item["Value"] || "0"),
      testType: item["Test Type"] || "",
      limb: item["Limb"] || "",
    }))
    .sort((a, b) => {
      const repA = parseInt(a.name.split(' ')[1]);
      const repB = parseInt(b.name.split(' ')[1]);
      return repA - repB;
    });
  
  // Calculate statistics if there's a selected metric
  const metricValues = chartData.map(item => item.value);
  const average = metricValues.length > 0
    ? (metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length).toFixed(1) 
    : "0";
  
  const min = metricValues.length > 0 ? Math.min(...metricValues).toFixed(1) : "0";
  const max = metricValues.length > 0 ? Math.max(...metricValues).toFixed(1) : "0";
  const range = metricValues.length > 0 ? `${min} - ${max}` : "N/A";
  
  // Calculate standard deviation if there are values
  let sd = "0";
  if (metricValues.length > 0) {
    const mean = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length;
    const squareDiffs = metricValues.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    sd = Math.sqrt(avgSquareDiff).toFixed(1);
  }
  
  // Calculate coefficient of variation (CV)
  const cv = metricValues.length > 0 && parseFloat(average) > 0 
    ? ((parseFloat(sd) / parseFloat(average)) * 100).toFixed(1) 
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
        <h2 className="text-xl font-bold">Performance Analytics</h2>
        <div className="flex flex-wrap gap-4">
          <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by athlete" />
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
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all_metrics">All Metrics</SelectItem>
                {metrics.map((metric, index) => (
                  <SelectItem key={index} value={metric}>{metric}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedMetric !== "all_metrics" && (
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h2 className="text-xl font-bold mb-4">{selectedMetric}</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Range</p>
              <p className="text-lg font-medium">{range}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-lg font-medium">{average}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CoV</p>
              <p className="text-lg font-medium">{cv}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SD</p>
              <p className="text-lg font-medium">{sd}</p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedMetric !== "all_metrics"
              ? `${selectedMetric} by Rep` 
              : "Metrics by Rep"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value}`, selectedMetric || "Value"]}
                  labelFormatter={(label: string) => `Rep ${label.split(' ')[1]}`}
                />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name={selectedMetric || "Value"} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
