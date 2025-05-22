
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartsProps {
  data: any[];
}

const Charts = ({ data }: ChartsProps) => {
  const [selectedAthlete, setSelectedAthlete] = useState<string>("");
  
  if (!data || data.length === 0) return null;

  // Get unique athletes
  const athletes = [...new Set(data.map(item => item["Athlete Name"]))];
  
  // Filter data for the selected athlete
  const filteredData = selectedAthlete 
    ? data.filter(item => item["Athlete Name"] === selectedAthlete) 
    : data;
  
  // Prepare data for progress chart (taking "Hop/Rep S" values over time)
  const progressData = filteredData
    .filter(item => item["Result Name"] === "Hop/Rep S")
    .map((item, index) => ({
      name: `Rep ${item["Repeat"] || index}`,
      value: parseFloat(item["Value"] || "0"),
      time: parseFloat(item["Time"] || "0")
    }))
    .sort((a, b) => a.time - b.time);
  
  // Prepare test type distribution data
  const testTypeCounts: Record<string, number> = {};
  filteredData.forEach(item => {
    const testType = item["Test Type"] || "Unknown";
    testTypeCounts[testType] = (testTypeCounts[testType] || 0) + 1;
  });
  
  const testTypeData = Object.entries(testTypeCounts).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Performance Analytics</h2>
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
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Progress</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {testTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={testTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No test type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Charts;
