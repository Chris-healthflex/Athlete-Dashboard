import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AthleteProfileProps {
  data: any[];
}

const AthleteProfile = ({ data }: AthleteProfileProps) => {
  const athleteStats = useMemo(() => {
    const stats = new Map<string, {
      name: string;
      testTypes: Set<string>;
      totalTests: number;
      averagesByTest: Map<string, number>;
      progressData: any[];
      sourceFiles: Set<string>;
      lastTestDate?: string;
    }>();

    data.forEach(row => {
      const athleteName = row["Athlete Name"];
      if (!athleteName) return;

      if (!stats.has(athleteName)) {
        stats.set(athleteName, {
          name: athleteName,
          testTypes: new Set(),
          totalTests: 0,
          averagesByTest: new Map(),
          progressData: [],
          sourceFiles: new Set([row["Source File"]]),
        });
      }

      const athleteStats = stats.get(athleteName)!;
      athleteStats.testTypes.add(row["Test Type"]);
      athleteStats.totalTests++;
      athleteStats.sourceFiles.add(row["Source File"]);

      // Calculate averages by test type
      const testType = row["Test Type"];
      const value = parseFloat(row["Value"]);
      if (!isNaN(value)) {
        const currentAvg = athleteStats.averagesByTest.get(testType) || 0;
        const currentCount = athleteStats.averagesByTest.has(testType) ? 1 : 0;
        athleteStats.averagesByTest.set(
          testType,
          (currentAvg * currentCount + value) / (currentCount + 1)
        );
      }

      // Add to progress data
      athleteStats.progressData.push({
        testType: row["Test Type"],
        value: parseFloat(row["Value"]),
        repeat: parseInt(row["Repeat"]) || 0,
        limb: row["Limb"],
        sourceFile: row["Source File"]
      });
    });

    return Array.from(stats.values());
  }, [data]);

  if (athleteStats.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No athlete data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {athleteStats.map((athlete, index) => (
        <div key={index} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">{athlete.name}</h3>
            <div className="text-sm text-gray-500">
              Data from {athlete.sourceFiles.size} file(s)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{athlete.totalTests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{athlete.testTypes.size}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {Array.from(athlete.testTypes).join(", ")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(athlete.averagesByTest.entries()).map(([testType, avg], i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">{testType}:</span>
                      <span className="font-medium">{avg.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {athlete.progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={athlete.progressData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="repeat"
                      label={{ value: 'Repeat', position: 'bottom' }}
                    />
                    <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value: any) => [value, 'Value']}
                      labelFormatter={(label: any) => `Rep ${label}`}
                    />
                    <Legend />
                    {Array.from(athlete.testTypes).map((testType, index) => (
                      <Line
                        key={index}
                        type="monotone"
                        dataKey="value"
                        data={athlete.progressData.filter(d => d.testType === testType)}
                        name={testType}
                        stroke={`hsl(${index * 137.5}, 70%, 50%)`}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No progress data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default AthleteProfile;
