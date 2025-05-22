
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AthleteProfileProps {
  data: any[];
}

const AthleteProfile = ({ data }: AthleteProfileProps) => {
  if (!data || data.length === 0) return null;
  
  // Extract unique athletes and their data
  const athleteMap = new Map();
  
  data.forEach(item => {
    const athleteId = item["Profile ID"];
    const athleteName = item["Athlete Name"];
    
    if (athleteId && athleteName && !athleteMap.has(athleteId)) {
      // Extract latest weight
      const weight = item["Weight"];
      
      // Count tests for this athlete
      const tests = data.filter(d => d["Profile ID"] === athleteId);
      const testCount = new Set(tests.map(t => t["Test ID"])).size;
      
      athleteMap.set(athleteId, {
        id: athleteId,
        name: athleteName,
        weight,
        testCount,
        latestTestDate: item["Recorded Date"]
      });
    }
  });
  
  const athletes = Array.from(athleteMap.values());

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Athlete Profiles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Test Count</TableHead>
              <TableHead>Latest Test</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{athlete.name}</TableCell>
                <TableCell>{athlete.id}</TableCell>
                <TableCell>{athlete.weight}</TableCell>
                <TableCell>{athlete.testCount}</TableCell>
                <TableCell>{athlete.latestTestDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AthleteProfile;
