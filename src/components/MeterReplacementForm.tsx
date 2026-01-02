import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import { MeterReplacement, METER_TYPE_LABELS } from '@/types/energy';

const formSchema = z.object({
  date: z.string().min(1, 'Datum ist erforderlich'),
  meterType: z.enum(['cold_water', 'garden_water', 'electricity_light', 'heating_ht', 'heating_nt', 'pv_yield', 'pv_feed_in'], {
    required_error: 'Bitte wählen Sie einen Zähler aus',
  }),
  oldFinalReading: z.coerce.number().min(0, 'Wert muss positiv sein'),
  newInitialReading: z.coerce.number().min(0, 'Wert muss positiv sein'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MeterReplacementFormProps {
  onSubmit: (data: Omit<MeterReplacement, 'id'>) => void;
}

export const MeterReplacementForm = ({ onSubmit }: MeterReplacementFormProps) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      oldFinalReading: 0,
      newInitialReading: 0,
      notes: '',
    },
  });

  const selectedMeterType = watch('meterType');

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      date: data.date,
      meterType: data.meterType,
      oldFinalReading: data.oldFinalReading,
      newInitialReading: data.newInitialReading,
      notes: data.notes || undefined,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Zählerwechsel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Zählerwechsel erfassen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Wechseldatum</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              className="bg-secondary"
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Meter Type */}
          <div className="space-y-2">
            <Label>Zähler</Label>
            <Select
              value={selectedMeterType}
              onValueChange={(value) => setValue('meterType', value as FormData['meterType'])}
            >
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Zähler auswählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.meterType && (
              <p className="text-sm text-destructive">{errors.meterType.message}</p>
            )}
          </div>

          {/* Old Final Reading */}
          <div className="space-y-2">
            <Label htmlFor="oldFinalReading">Alter Zähler - Endstand</Label>
            <Input
              id="oldFinalReading"
              type="number"
              step="0.01"
              {...register('oldFinalReading')}
              className="bg-secondary font-mono"
              placeholder="Letzter Stand des alten Zählers"
            />
            {errors.oldFinalReading && (
              <p className="text-xs text-destructive">{errors.oldFinalReading.message}</p>
            )}
          </div>

          {/* New Initial Reading */}
          <div className="space-y-2">
            <Label htmlFor="newInitialReading">Neuer Zähler - Anfangsstand</Label>
            <Input
              id="newInitialReading"
              type="number"
              step="0.01"
              {...register('newInitialReading')}
              className="bg-secondary font-mono"
              placeholder="Meist 0 bei neuem Zähler"
            />
            {errors.newInitialReading && (
              <p className="text-xs text-destructive">{errors.newInitialReading.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              className="bg-secondary"
              placeholder="z.B. Zählernummer, Grund für Wechsel..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
