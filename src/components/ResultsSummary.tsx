
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";

interface ResultsSummaryProps {
  data: any[];
}

type SortMethod = "max" | "min" | "avg";

const ResultsSummary = ({ data }: ResultsSummaryProps) => {
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [selectedResultName, setSelectedResultName] = useState<string>("");
  const [selectedLimb, setSelectedLimb] = useState<string>("");
  const [sortMethod, setSortMethod] = useState<SortMethod>("max");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [summaryValue, setSummaryValue] = useState<string | number>("N/A");

  // Extract unique test types
  const testTypes = Array.from(new Set(data.map(item => item["Test Type"] || ""))).filter(Boolean);
  
  // Extract unique result names based on selected test type
  const resultNames = Array.from(new Set(
    data
      .filter(item => !selectedTestType || item["Test Type"] === selectedTestType)
      .map(item => item["Result Name"] || "")
  )).filter(Boolean);
  
  // Extract unique limbs based on selected test type and result name
  const limbs = Array.from(new Set(
    data
      .filter(item => 
        (!selectedTestType || item["Test Type"] === selectedTestType) && 
        (!selectedResultName || item["Result Name"] === selectedResultName)
      )
      .map(item => item["Limb"] || "")
  )).filter(Boolean);

  useEffect(() => {
    // Filter data based on selections
    let filtered = [...data];
    
    if (selectedTestType) {
      filtered = filtered.filter(item => item["Test Type"] === selectedTestType);
    }
    
    if (selectedResultName) {
      filtered = filtered.filter(item => item["Result Name"] === selectedResultName);
    }
    
    if (selectedLimb) {
      filtered = filtered.filter(item => item["Limb"] === selectedLimb);
    }
    
    setFilteredData(filtered);
    
    // Calculate summary value based on sort method
    if (filtered.length > 0 && selectedResultName) {
      const values = filtered
        .map(item => parseFloat(item["Value"]))
        .filter(value => !isNaN(value));
      
      if (values.length > 0) {
        if (sortMethod === "max") {
          setSummaryValue(Math.max(...values).toFixed(2));
        } else if (sortMethod === "min") {
          setSummaryValue(Math.min(...values).toFixed(2));
        } else if (sortMethod === "avg") {
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          setSummaryValue(average.toFixed(2));
        }
      } else {
        setSummaryValue("N/A");
      }
    } else {
      setSummaryValue("N/A");
    }
  }, [data, selectedTestType, selectedResultName, selectedLimb, sortMethod]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Results Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Type</label>
          <Select value={selectedTestType} onValueChange={setSelectedTestType}>
            <SelectTrigger>
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all_test_types">All Test Types</SelectItem>
                {testTypes.map((type, index) => (
                  <SelectItem key={index} value={type}>{type}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Result Name</label>
          <Select value={selectedResultName} onValueChange={setSelectedResultName}>
            <SelectTrigger>
              <SelectValue placeholder="Select result name" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all_result_names">All Result Names</SelectItem>
                {resultNames.map((name, index) => (
                  <SelectItem key={index} value={name}>{name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Limb</label>
          <Select value={selectedLimb} onValueChange={setSelectedLimb}>
            <SelectTrigger>
              <SelectValue placeholder="Select limb" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all_limbs">All Limbs</SelectItem>
                {limbs.map((limb, index) => (
                  <SelectItem key={index} value={limb}>{limb}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">Sort Method</h3>
          <ToggleGroup type="single" value={sortMethod} onValueChange={(value) => value && setSortMethod(value as SortMethod)}>
            <ToggleGroupItem value="max" aria-label="Sort by maximum">
              <SortDesc className="h-4 w-4 mr-1" />
              Max
            </ToggleGroupItem>
            <ToggleGroupItem value="min" aria-label="Sort by minimum">
              <SortAsc className="h-4 w-4 mr-1" />
              Min
            </ToggleGroupItem>
            <ToggleGroupItem value="avg" aria-label="Sort by average">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Avg
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Result Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{selectedResultName || "All"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Value ({sortMethod === "max" ? "Maximum" : sortMethod === "min" ? "Minimum" : "Average"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{summaryValue}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Limb</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{selectedLimb || "All"}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Showing {filteredData.length} results matching the selected filters</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;
