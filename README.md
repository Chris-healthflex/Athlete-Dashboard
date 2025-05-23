# Athlete Dashboard

A React-based dashboard for visualizing and analyzing CSV data with a focus on athlete performance metrics.

## Features

- CSV file and folder upload support
- Interactive data visualization with charts
- Filtering by athlete, test type, limb, and date
- Statistical analysis (max, min, average)
- Responsive design
- Real-time data updates

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Chris-healthflex/Athelete-Dashboard.git
cd Athelete-Dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

## Usage

1. Upload your CSV file(s) using either the single file upload or folder upload option
2. Select an athlete from the dropdown to view their data
3. Use the filters to analyze specific test types, limbs, and dates
4. View the data visualization in the charts tab
5. Access raw data in the data table view

## CSV Format Requirements

The CSV files should include the following columns:
- Athlete Name
- Test Type
- Limb
- Result Name
- Value
- Repeat
- Recorded UTC

## License

MIT
