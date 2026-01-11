import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useEnergyData } from '@/hooks/useEnergyData';
import { Skeleton } from '@/components/ui/skeleton';
import { MeterReadingEditDialog } from '@/components/MeterReadingEditDialog';
import { MeterReplacementForm } from '@/components/MeterReplacementForm';
import { MeterInfoManager } from '@/components/MeterInfoManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeterReading, METER_TYPE_LABELS } from '@/types/energy';
import { formatNumber } from '@/lib/energyUtils';

const DataManagement = () => {
  const {
    meterReadings,
    meterReplacements,
    isLoading,
    updateReading,
    deleteReading,
    addMeterReplacement,
    deleteMeterReplacement,
  } = useEnergyData();

  const [editingReading, setEditingReading] = useState<MeterReading | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Skeleton className="h-[400px] rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Dashboard
            </Button>
          </Link>
          <MeterReplacementForm onSubmit={addMeterReplacement} />
        </div>

        <Tabs defaultValue="readings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="readings">Zählerstände</TabsTrigger>
            <TabsTrigger value="replacements">Zählerwechsel</TabsTrigger>
            <TabsTrigger value="info">Zählernummern</TabsTrigger>
          </TabsList>

          <TabsContent value="readings">
            <div className="energy-card">
              <h2 className="text-xl font-semibold mb-4">Alle Zählerstände</h2>
              
              {meterReadings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Zählerstände vorhanden.
                </p>
              ) : (
                <div className="overflow-auto max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Kaltwasser</TableHead>
                        <TableHead className="text-right">Gartenwasser</TableHead>
                        <TableHead className="text-right">Strom</TableHead>
                        <TableHead className="text-right">Heizung HT</TableHead>
                        <TableHead className="text-right">Heizung NT</TableHead>
                        <TableHead className="text-right">PV Ertrag</TableHead>
                        <TableHead className="text-right">Einspeisung</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meterReadings.map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell className="font-medium">
                            {formatDate(reading.date)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.coldWater, 2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.gardenWater, 2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.electricityLight, 1)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.heatingHT, 1)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.heatingNT, 1)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.pvYield, 1)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(reading.pvFeedIn, 1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingReading(reading)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Zählerstand löschen?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Möchten Sie den Zählerstand vom {formatDate(reading.date)} wirklich löschen?
                                      Diese Aktion kann nicht rückgängig gemacht werden.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteReading(reading.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Löschen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="replacements">
            <div className="energy-card">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Zählerwechsel</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Hier können Sie Zählerwechsel dokumentieren. Bei einem Wechsel wird der Verbrauch korrekt berechnet,
                auch wenn der neue Zähler bei 0 beginnt.
              </p>
              
              {meterReplacements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Zählerwechsel dokumentiert.
                </p>
              ) : (
                <div className="overflow-auto max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Zähler</TableHead>
                        <TableHead className="text-right">Alter Endstand</TableHead>
                        <TableHead className="text-right">Neuer Anfangsstand</TableHead>
                        <TableHead>Notizen</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meterReplacements.map((replacement) => (
                        <TableRow key={replacement.id}>
                          <TableCell className="font-medium">
                            {formatDate(replacement.date)}
                          </TableCell>
                          <TableCell>
                            {METER_TYPE_LABELS[replacement.meterType]}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(replacement.oldFinalReading, 2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(replacement.newInitialReading, 2)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {replacement.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Zählerwechsel löschen?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Möchten Sie diesen Zählerwechsel wirklich löschen?
                                    Die Verbrauchsberechnung wird entsprechend angepasst.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMeterReplacement(replacement.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Löschen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <MeterInfoManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      {editingReading && (
        <MeterReadingEditDialog
          reading={editingReading}
          onSave={(data) => {
            updateReading(editingReading.id, data);
            setEditingReading(null);
          }}
          onClose={() => setEditingReading(null)}
        />
      )}
    </div>
  );
};

export default DataManagement;
