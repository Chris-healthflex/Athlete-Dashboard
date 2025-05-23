import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, MultiSelect } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";

interface ResultsSummaryProps {
  data: any[];
  onTestTypeChange?: (testType: string) => void;
  onLimbChange?: (limb: string) => void;
  onDatesChange?: (dates: string[]) => void;
}

type SortMethod = "max" | "min" | "avg";

const ResultsSummary = ({ data, onTestTypeChange, onLimbChange, onDatesChange }: ResultsSummaryProps) => {
  const [selectedTestType, setSelectedTestType] = useState<string>("all_test_types");
  const [selectedResultName, setSelectedResultName] = useState<string>("all_results");
  const [selectedLimb, setSelectedLimb] = useState<string>("all_limbs");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState<SortMethod>("max");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [summaryValue, setSummaryValue] = useState<string | number>("N/A");
  const [previousAthlete, setPreviousAthlete] = useState<string>("");

  // Get the current athlete name from the first data item
  const currentAthlete = data[0]?.["Athlete Name"] || "";

  // Reset filters only when athlete changes
  useEffect(() => {
    if (previousAthlete && previousAthlete !== currentAthlete) {
      setSelectedTestType("all_test_types");
      setSelectedResultName("all_results");
      setSelectedLimb("all_limbs");
      setSelectedDates([]);
      if (onDatesChange) {
        onDatesChange([]);
      }
    }
    setPreviousAthlete(currentAthlete);
  }, [currentAthlete, previousAthlete, onDatesChange]);

  // Extract unique test types
  const testTypes = Array.from(new Set(data.map(item => item["Test Type"] || ""))).filter(Boolean);
  
  // Extract unique result names based on selected test type
  const resultNames = Array.from(new Set(
    data
      .filter(item => selectedTestType === "all_test_types" || item["Test Type"] === selectedTestType)
      .map(item => item["Result Name"] || "")
  )).filter(Boolean);
  
  // Extract unique limbs based on selected test type and result name
  const limbs = Array.from(new Set(
    data
      .filter(item => 
        (selectedTestType === "all_test_types" || item["Test Type"] === selectedTestType) && 
        (selectedResultName === "all_results" || item["Result Name"] === selectedResultName)
      )
      .map(item => item["Limb"] || "")
  )).filter(Boolean);

  // Extract unique dates and format them
  const dates = Array.from(new Set(
    data.map(item => {
      const date = new Date(item["Recorded UTC"]);
      return date.toLocaleDateString();
    })
  )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort dates in descending order

  // Handle test type change
  const handleTestTypeChange = (value: string) => {
    setSelectedTestType(value);
    if (onTestTypeChange) {
      onTestTypeChange(value === "all_test_types" ? "" : value);
    }
  };

  // Handle limb change
  const handleLimbChange = (value: string) => {
    setSelectedLimb(value);
    if (onLimbChange) {
      onLimbChange(value === "all_limbs" ? "" : value);
    }
  };

  useEffect(() => {
    // Filter data based on selections
    let filtered = [...data];
    
    if (selectedTestType !== "all_test_types") {
      filtered = filtered.filter(item => item["Test Type"] === selectedTestType);
    }
    
    if (selectedResultName !== "all_results") {
      filtered = filtered.filter(item => item["Result Name"] === selectedResultName);
    }
    
    if (selectedLimb !== "all_limbs") {
      filtered = filtered.filter(item => item["Limb"] === selectedLimb);
    }

    if (selectedDates.length > 0) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item["Recorded UTC"]);
        return selectedDates.includes(itemDate.toLocaleDateString());
      });
    }
    
    setFilteredData(filtered);
    
    // Calculate summary value based on sort method
    if (filtered.length > 0 && selectedResultName !== "all_results") {
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
  }, [data, selectedTestType, selectedResultName, selectedLimb, selectedDates, sortMethod]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Results Summary</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Type</label>
          <Select value={selectedTestType} onValueChange={handleTestTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all_test_types">All Test Types</SelectItem>
                {testTypes.map((testType, index) => (
                  <SelectItem key={index} value={testType}>{testType}</SelectItem>
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
                <SelectItem value="all_results">All Results</SelectItem>
                {resultNames.map((resultName, index) => (
                  <SelectItem key={index} value={resultName}>{resultName}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Limb</label>
          <Select value={selectedLimb} onValueChange={handleLimbChange}>
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Select 
            value={selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : "all_dates"}
            onValueChange={(value) => {
              if (value === "all_dates") {
                setSelectedDates([]);
                if (onDatesChange) {
                  onDatesChange([]);
                }
              } else {
                const newDates = selectedDates.includes(value)
                  ? selectedDates.filter(d => d !== value)
                  : [...selectedDates, value];
                setSelectedDates(newDates);
                if (onDatesChange) {
                  onDatesChange(newDates);
                }
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dates">
                {selectedDates.length === 0 
                  ? "All Dates" 
                  : `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all_dates">All Dates</SelectItem>
                {dates.map((date, index) => (
                  <SelectItem 
                    key={index} 
                    value={date}
                    className={selectedDates.includes(date) ? "bg-accent" : undefined}
                  >
                    {date}
                  </SelectItem>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Result Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{selectedResultName === "all_results" ? "All" : selectedResultName}</div>
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
              <div className="text-xl font-bold">{selectedLimb === "all_limbs" ? "All" : selectedLimb}</div>
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
