import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ChartsProps {
  data: any[];
  selectedTestType?: string;
  selectedLimb?: string;
  selectedDates?: string[];
}

const Charts = ({ data, selectedTestType, selectedLimb, selectedDates = [] }: ChartsProps) => {
  const [selectedAthlete, setSelectedAthlete] = useState<string>("all_athletes");
  const [selectedMetric, setSelectedMetric] = useState<string>("all_metrics");
  
  if (!data || data.length === 0) return null;

  // Get unique athletes
  const athletes = [...new Set(data.map(item => item["Athlete Name"]))];
  
  // Get unique result names (metrics)
  const metrics = [...new Set(data.map(item => item["Result Name"]))].filter(Boolean);
  
  // Filter data for the selected athlete, metric, test type, limb, and dates
  const filteredData = data.filter(item => {
    const athleteMatch = selectedAthlete === "all_athletes" || item["Athlete Name"] === selectedAthlete;
    const metricMatch = selectedMetric === "all_metrics" || item["Result Name"] === selectedMetric;
    const testTypeMatch = !selectedTestType || item["Test Type"] === selectedTestType;
    const limbMatch = !selectedLimb || item["Limb"] === selectedLimb;
    const dateMatch = selectedDates.length === 0 || selectedDates.includes(new Date(item["Recorded UTC"]).toLocaleDateString());
    return athleteMatch && metricMatch && testTypeMatch && limbMatch && dateMatch;
  });

  // Get all unique dates from the filtered data
  const uniqueDates = [...new Set(filteredData
    .filter(item => item["Result Name"] === selectedMetric)
    .map(item => new Date(item["Recorded UTC"]).toLocaleDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Prepare aggregate data by date - ensure we process all dates
  const aggregateData = uniqueDates.map(date => {
    const dateValues = filteredData
      .filter(item => 
        new Date(item["Recorded UTC"]).toLocaleDateString() === date &&
        item["Result Name"] === selectedMetric &&
        item["Value"] !== undefined &&
        item["Value"] !== ""
      )
      .map(item => parseFloat(item["Value"]));

    if (dateValues.length === 0) return null;

    return {
      date,
      values: dateValues,
      average: (dateValues.reduce((a, b) => a + b, 0) / dateValues.length).toFixed(1),
      maximum: Math.max(...dateValues).toFixed(1),
      minimum: Math.min(...dateValues).toFixed(1)
    };
  }).filter(Boolean);

  // Prepare data for the first chart (individual reps)
  const chartData = filteredData
    .filter(item => 
      item["Result Name"] === selectedMetric && 
      item["Value"] !== undefined && 
      item["Value"] !== ""
    )
    .map(item => ({
      name: `${new Date(item["Recorded UTC"]).toLocaleDateString()} - Rep ${item["Repeat"] || 1}`,
      value: parseFloat(item["Value"] || "0"),
      testType: item["Test Type"] || "",
      limb: item["Limb"] || "",
      date: new Date(item["Recorded UTC"]).toLocaleDateString(),
    }))
    .sort((a, b) => {
      // First sort by date
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // Then sort by rep number
      const repA = parseInt(a.name.split('Rep ')[1]);
      const repB = parseInt(b.name.split('Rep ')[1]);
      return repA - repB;
    });

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
      
      {selectedMetric !== "all_metrics" && aggregateData.length > 0 && (
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h2 className="text-xl font-bold mb-4">{selectedMetric}</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Range</p>
              <p className="text-lg font-medium">{`${aggregateData[0].minimum} - ${aggregateData[0].maximum}`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-lg font-medium">{aggregateData[0].average}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CoV</p>
              <p className="text-lg font-medium">
                {String(
                  ((Math.sqrt(
                    aggregateData[0].values.reduce(
                      (sum: number, val: number) => 
                        sum + Math.pow(val - Number(aggregateData[0].average), 2),
                      0
                    ) / aggregateData[0].values.length
                  ) / Number(aggregateData[0].average)) * 100
                ).toFixed(1)
                )}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SD</p>
              <p className="text-lg font-medium">
                {String(
                  Math.sqrt(
                    aggregateData[0].values.reduce(
                      (sum: number, val: number) => 
                        sum + Math.pow(val - Number(aggregateData[0].average), 2),
                      0
                    ) / aggregateData[0].values.length
                  ).toFixed(1)
                )}
              </p>
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
      
      {selectedMetric !== "all_metrics" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {`${selectedMetric} Statistics by Date`}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {aggregateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregateData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value}`, selectedMetric || "Value"]}
                  />
                  <Legend />
                  <Bar dataKey="maximum" fill="#82ca9d" name="Maximum" />
                  <Bar dataKey="average" fill="#8884d8" name="Average" />
                  <Bar dataKey="minimum" fill="#ffc658" name="Minimum" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available for the selected filters
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedMetric !== "all_metrics" && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Maximum</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead># of Reps</TableHead>
                    <TableHead>Standard Deviation</TableHead>
                    <TableHead>CoV (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregateData.map((dateStats) => {
                    // Calculate standard deviation
                    const mean = parseFloat(dateStats.average);
                    const squareDiffs = dateStats.values.map(value => {
                      const diff = value - mean;
                      return diff * diff;
                    });
                    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
                    const stdDev = Math.sqrt(avgSquareDiff).toFixed(1);
                    
                    // Calculate CoV
                    const cov = ((parseFloat(stdDev) / mean) * 100).toFixed(1);

                    return (
                      <TableRow key={dateStats.date}>
                        <TableCell>{dateStats.date}</TableCell>
                        <TableCell>{dateStats.maximum}</TableCell>
                        <TableCell>{dateStats.minimum}</TableCell>
                        <TableCell>{dateStats.average}</TableCell>
                        <TableCell>{`${dateStats.minimum} - ${dateStats.maximum}`}</TableCell>
                        <TableCell>{dateStats.values.length}</TableCell>
                        <TableCell>{stdDev}</TableCell>
                        <TableCell>{cov}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Charts;
