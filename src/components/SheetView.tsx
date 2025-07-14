import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { allSheets } from '@/lib/sheets-data';

export default function SheetView() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">DSA Sheets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allSheets.map(sheet => (
          <a href={sheet.url} target="_blank" rel="noopener noreferrer" key={sheet.name}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{sheet.name}</CardTitle>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
} 