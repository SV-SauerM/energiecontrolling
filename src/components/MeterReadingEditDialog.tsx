import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Droplets, Zap, Flame, Sun, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MeterReading } from '@/types/energy';

const formSchema = z.object({
  date: z.string().min(1, 'Datum ist erforderlich'),
  coldWater: z.coerce.number().min(0, 'Wert muss positiv sein'),
  gardenWater: z.coerce.number().min(0, 'Wert muss positiv sein'),
  electricityLight: z.coerce.number().min(0, 'Wert muss positiv sein'),
  heatingHT: z.coerce.number().min(0, 'Wert muss positiv sein'),
  heatingNT: z.coerce.number().min(0, 'Wert muss positiv sein'),
  pvYield: z.coerce.number().min(0, 'Wert muss positiv sein'),
  pvFeedIn: z.coerce.number().min(0, 'Wert muss positiv sein'),
});

type FormData = z.infer<typeof formSchema>;

interface MeterReadingEditDialogProps {
  reading: MeterReading;
  onSave: (data: Partial<MeterReading>) => void;
  onClose: () => void;
}

export const MeterReadingEditDialog = ({ reading, onSave, onClose }: MeterReadingEditDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: reading.date,
      coldWater: reading.coldWater,
      gardenWater: reading.gardenWater,
      electricityLight: reading.electricityLight,
      heatingHT: reading.heatingHT,
      heatingNT: reading.heatingNT,
      pvYield: reading.pvYield,
      pvFeedIn: reading.pvFeedIn,
    },
  });

  const onFormSubmit = (data: FormData) => {
    onSave(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Zählerstand bearbeiten
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Ablesedatum</Label>
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

          {/* Water Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-water">
              <Droplets className="w-4 h-4" />
              <span className="font-medium">Wasser (m³)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coldWater">Kaltwasser</Label>
                <Input
                  id="coldWater"
                  type="number"
                  step="0.01"
                  {...register('coldWater')}
                  className="bg-secondary font-mono"
                />
                {errors.coldWater && (
                  <p className="text-xs text-destructive">{errors.coldWater.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gardenWater">Gartenwasser</Label>
                <Input
                  id="gardenWater"
                  type="number"
                  step="0.01"
                  {...register('gardenWater')}
                  className="bg-secondary font-mono"
                />
                {errors.gardenWater && (
                  <p className="text-xs text-destructive">{errors.gardenWater.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Electricity Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-electricity">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Strom (kWh)</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="electricityLight">Strom Licht</Label>
              <Input
                id="electricityLight"
                type="number"
                step="0.1"
                {...register('electricityLight')}
                className="bg-secondary font-mono"
              />
              {errors.electricityLight && (
                <p className="text-xs text-destructive">{errors.electricityLight.message}</p>
              )}
            </div>
          </div>

          {/* Heating Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-heating">
              <Flame className="w-4 h-4" />
              <span className="font-medium">Heizung (kWh)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heatingHT">Hochtarif (HT)</Label>
                <Input
                  id="heatingHT"
                  type="number"
                  step="0.1"
                  {...register('heatingHT')}
                  className="bg-secondary font-mono"
                />
                {errors.heatingHT && (
                  <p className="text-xs text-destructive">{errors.heatingHT.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="heatingNT">Niedertarif (NT)</Label>
                <Input
                  id="heatingNT"
                  type="number"
                  step="0.1"
                  {...register('heatingNT')}
                  className="bg-secondary font-mono"
                />
                {errors.heatingNT && (
                  <p className="text-xs text-destructive">{errors.heatingNT.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Solar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-solar">
              <Sun className="w-4 h-4" />
              <span className="font-medium">Photovoltaik (kWh)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pvYield">PV Ertrag</Label>
                <Input
                  id="pvYield"
                  type="number"
                  step="0.1"
                  {...register('pvYield')}
                  className="bg-secondary font-mono"
                />
                {errors.pvYield && (
                  <p className="text-xs text-destructive">{errors.pvYield.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pvFeedIn">Einspeisung</Label>
                <Input
                  id="pvFeedIn"
                  type="number"
                  step="0.1"
                  {...register('pvFeedIn')}
                  className="bg-secondary font-mono"
                />
                {errors.pvFeedIn && (
                  <p className="text-xs text-destructive">{errors.pvFeedIn.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
