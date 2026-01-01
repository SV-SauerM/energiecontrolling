import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MeterReading } from '@/types/energy';
import { exportToCSV, downloadCSV, parseCSV, generateSampleCSV, CSVParseResult } from '@/lib/csvUtils';
import { toast } from '@/hooks/use-toast';

interface CSVImportExportProps {
  readings: MeterReading[];
  onImport: (readings: MeterReading[]) => void;
}

export const CSVImportExport = ({ readings, onImport }: CSVImportExportProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (readings.length === 0) {
      toast({
        title: 'Keine Daten',
        description: 'Es sind keine Zählerstände zum Exportieren vorhanden.',
        variant: 'destructive',
      });
      return;
    }

    const csv = exportToCSV(readings);
    const filename = `zaehlerstaende_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    
    toast({
      title: 'Export erfolgreich',
      description: `${readings.length} Einträge wurden exportiert.`,
    });
  };

  const handleExportTemplate = () => {
    const template = generateSampleCSV();
    downloadCSV(template, 'vorlage_zaehlerstaende.csv');
    
    toast({
      title: 'Vorlage heruntergeladen',
      description: 'Verwenden Sie diese als Vorlage für Ihren Import.',
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content);
      setParseResult(result);
      setPreviewDialogOpen(true);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || !parseResult.success) return;

    if (importMode === 'replace') {
      onImport(parseResult.readings);
      toast({
        title: 'Import erfolgreich',
        description: `${parseResult.readings.length} Einträge wurden importiert. Alte Daten wurden ersetzt.`,
      });
    } else {
      // Merge: Add new readings, update existing based on date
      const existingDates = new Set(readings.map(r => r.date));
      const newReadings = parseResult.readings.filter(r => !existingDates.has(r.date));
      const mergedReadings = [...readings, ...newReadings];
      onImport(mergedReadings);
      toast({
        title: 'Import erfolgreich',
        description: `${newReadings.length} neue Einträge wurden hinzugefügt. ${parseResult.readings.length - newReadings.length} Duplikate übersprungen.`,
      });
    }

    setPreviewDialogOpen(false);
    setParseResult(null);
    setImportDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Daten exportieren
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportTemplate} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Vorlage herunterladen
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setImportDialogOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Daten importieren
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              CSV importieren
            </DialogTitle>
            <DialogDescription>
              Importieren Sie Zählerstände aus einer CSV-Datei.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Info */}
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Unterstützte Formate:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Trennzeichen: Semikolon (;) oder Komma (,)</li>
                    <li>• Datum: YYYY-MM-DD, DD.MM.YYYY, MM/DD/YYYY</li>
                    <li>• Dezimalzahlen: Komma oder Punkt</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Import Mode */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Import-Modus:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={importMode === 'merge' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImportMode('merge')}
                  className="justify-start"
                >
                  Zusammenführen
                </Button>
                <Button
                  variant={importMode === 'replace' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setImportMode('replace')}
                  className="justify-start"
                >
                  Ersetzen
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {importMode === 'merge' 
                  ? 'Neue Einträge werden zu bestehenden Daten hinzugefügt.'
                  : 'Alle bestehenden Daten werden durch die importierten ersetzt.'}
              </p>
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              CSV-Datei auswählen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {parseResult?.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  Import-Vorschau
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Import-Fehler
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {parseResult && (
            <div className="space-y-4">
              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="font-medium text-destructive text-sm mb-2">Fehler:</p>
                  <ul className="text-sm space-y-1">
                    {parseResult.errors.map((error, i) => (
                      <li key={i} className="text-destructive/80">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <p className="font-medium text-warning text-sm mb-2">Warnungen:</p>
                  <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                    {parseResult.warnings.map((warning, i) => (
                      <li key={i} className="text-warning/80">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Info */}
              {parseResult.success && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                  <p className="font-medium text-success text-sm">
                    {parseResult.readings.length} Einträge erkannt
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zeitraum: {parseResult.readings[0]?.date} bis {parseResult.readings[parseResult.readings.length - 1]?.date}
                  </p>
                </div>
              )}

              {/* Preview Table */}
              {parseResult.success && parseResult.readings.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary sticky top-0">
                        <tr>
                          <th className="p-2 text-left">Datum</th>
                          <th className="p-2 text-right">Wasser</th>
                          <th className="p-2 text-right">Strom</th>
                          <th className="p-2 text-right">Heizung</th>
                          <th className="p-2 text-right">PV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.readings.slice(0, 10).map((reading, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-2 font-mono">{reading.date}</td>
                            <td className="p-2 text-right font-mono">{reading.coldWater + reading.gardenWater}</td>
                            <td className="p-2 text-right font-mono">{reading.electricityLight}</td>
                            <td className="p-2 text-right font-mono">{reading.heatingHT + reading.heatingNT}</td>
                            <td className="p-2 text-right font-mono">{reading.pvYield}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.readings.length > 10 && (
                    <div className="p-2 text-xs text-center text-muted-foreground bg-secondary/50">
                      ... und {parseResult.readings.length - 10} weitere Einträge
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewDialogOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Abbrechen
                </Button>
                {parseResult.success && (
                  <Button
                    className="flex-1"
                    onClick={handleConfirmImport}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Importieren
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
