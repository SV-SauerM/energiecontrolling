import { useState, useEffect } from 'react';
import { Pencil, Save, X, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { METER_TYPE_LABELS } from '@/types/energy';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MeterInfo {
  id: string;
  meterType: string;
  meterNumber: string | null;
}

export const MeterInfoManager = () => {
  const [meterInfo, setMeterInfo] = useState<MeterInfo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeterInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('meter_info')
          .select('*')
          .order('meter_type');

        if (error) throw error;

        setMeterInfo(
          (data || []).map((m) => ({
            id: m.id,
            meterType: m.meter_type,
            meterNumber: m.meter_number,
          }))
        );
      } catch (error) {
        console.error('Error fetching meter info:', error);
        toast.error('Fehler beim Laden der Zählerinformationen');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeterInfo();
  }, []);

  const startEdit = (meter: MeterInfo) => {
    setEditingId(meter.id);
    setEditValue(meter.meterNumber || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id: string, meterType: string) => {
    try {
      const { error } = await supabase
        .from('meter_info')
        .update({ meter_number: editValue || null })
        .eq('id', id);

      if (error) throw error;

      setMeterInfo((prev) =>
        prev.map((m) => (m.id === id ? { ...m, meterNumber: editValue || null } : m))
      );
      setEditingId(null);
      setEditValue('');
      toast.success('Zählernummer gespeichert');
    } catch (error) {
      console.error('Error updating meter info:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Laden...</div>;
  }

  return (
    <div className="energy-card">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Zählernummern</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Hinterlegen Sie hier die aktuellen Zählernummern Ihrer Zähler.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zähler</TableHead>
            <TableHead>Zählernummer</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meterInfo.map((meter) => (
            <TableRow key={meter.id}>
              <TableCell className="font-medium">
                {METER_TYPE_LABELS[meter.meterType] || meter.meterType}
              </TableCell>
              <TableCell>
                {editingId === meter.id ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Zählernummer eingeben"
                    className="max-w-[200px]"
                    autoFocus
                  />
                ) : (
                  <span className="font-mono">
                    {meter.meterNumber || <span className="text-muted-foreground">-</span>}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === meter.id ? (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveEdit(meter.id, meter.meterType)}
                    >
                      <Save className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => startEdit(meter)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
