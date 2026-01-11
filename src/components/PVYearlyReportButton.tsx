import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConsumptionData } from '@/types/energy';
import { formatNumber } from '@/lib/energyUtils';

interface PVYearlyReportButtonProps {
  data: ConsumptionData[];
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export const PVYearlyReportButton = ({ data }: PVYearlyReportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Get unique years from data
  const availableYears = [...new Set(data.map(d => d.year))].sort((a, b) => b - a);

  const generatePDF = () => {
    if (!selectedYear) return;

    const year = parseInt(selectedYear);
    const yearData = data.filter(d => d.year === year);
    
    // Create monthly data with all months
    const monthlyData: { month: string; pvSelfConsumption: number }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthEntry = yearData.find(d => {
        const date = new Date(d.date);
        return date.getMonth() === i;
      });
      
      monthlyData.push({
        month: MONTH_NAMES[i],
        pvSelfConsumption: monthEntry?.pvSelfConsumption ?? 0
      });
    }

    const totalSelfConsumption = monthlyData.reduce((sum, m) => sum + m.pvSelfConsumption, 0);

    // Generate PDF content using browser print
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PV Eigenverbrauch ${year}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #1a1a1a;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #22c55e;
          }
          .header h1 {
            font-size: 24px;
            color: #16a34a;
            margin-bottom: 8px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .summary {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: center;
          }
          .summary-label {
            font-size: 14px;
            color: #166534;
            margin-bottom: 8px;
          }
          .summary-value {
            font-size: 36px;
            font-weight: bold;
            color: #15803d;
          }
          .summary-unit {
            font-size: 18px;
            color: #22c55e;
            margin-left: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            background: #f8fafc;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
          }
          th:last-child {
            text-align: right;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f5f9;
          }
          td:last-child {
            text-align: right;
            font-variant-numeric: tabular-nums;
          }
          tr:nth-child(even) {
            background: #fafafa;
          }
          tr:hover {
            background: #f0fdf4;
          }
          .footer {
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>☀️ PV Eigenverbrauch Jahresübersicht</h1>
          <p>Kalenderjahr ${year}</p>
        </div>

        <div class="summary">
          <div class="summary-label">Gesamter PV Eigenverbrauch ${year}</div>
          <div class="summary-value">${formatNumber(totalSelfConsumption)}<span class="summary-unit">kWh</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Monat</th>
              <th>PV Eigenverbrauch (kWh)</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyData.map(m => `
              <tr>
                <td>${m.month}</td>
                <td>${formatNumber(m.pvSelfConsumption)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Erstellt am ${new Date().toLocaleDateString('de-DE')} • Energie-Controlling</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    setOpen(false);
  };

  if (availableYears.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">PV Jahresbericht</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PV Eigenverbrauch Jahresbericht</DialogTitle>
          <DialogDescription>
            Wählen Sie ein Jahr aus, um eine PDF-Übersicht des PV Eigenverbrauchs für Ihre Steuererklärung zu erstellen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Jahr auswählen</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Jahr wählen..." />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generatePDF} 
            disabled={!selectedYear}
            className="w-full gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
