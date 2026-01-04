import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Droplets, Zap, Flame, Sun, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MeterReading } from '@/types/energy';
import { useMeterInfo } from '@/hooks/useMeterInfo';

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

interface MeterReadingFormProps {
  onSubmit: (data: Omit<MeterReading, 'id'>) => void;
  defaultValues?: Partial<MeterReading>;
}

export const MeterReadingForm = ({ onSubmit, defaultValues }: MeterReadingFormProps) => {
  const [open, setOpen] = useState(false);
  const { meterInfo } = useMeterInfo();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      coldWater: defaultValues?.coldWater ?? 0,
      gardenWater: defaultValues?.gardenWater ?? 0,
      electricityLight: defaultValues?.electricityLight ?? 0,
      heatingHT: defaultValues?.heatingHT ?? 0,
      heatingNT: defaultValues?.heatingNT ?? 0,
      pvYield: defaultValues?.pvYield ?? 0,
      pvFeedIn: defaultValues?.pvFeedIn ?? 0,
    },
  });

  const getMeterLabel = (type: string, name: string) => {
    const number = meterInfo[type];
    return number ? `${name} (${number})` : name;
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      date: data.date,
      coldWater: data.coldWater,
      gardenWater: data.gardenWater,
      electricityLight: data.electricityLight,
      heatingHT: data.heatingHT,
      heatingNT: data.heatingNT,
      pvYield: data.pvYield,
      pvFeedIn: data.pvFeedIn,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Neuer Zählerstand
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Zählerstand erfassen
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
                <Label htmlFor="coldWater">{getMeterLabel('cold_water', 'Kaltwasser')}</Label>
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
                <Label htmlFor="gardenWater">{getMeterLabel('garden_water', 'Gartenwasser')}</Label>
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
              <Label htmlFor="electricityLight">{getMeterLabel('electricity_light', 'Strom Licht')}</Label>
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
                <Label htmlFor="heatingHT">{getMeterLabel('heating_ht', 'Hochtarif (HT)')}</Label>
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
                <Label htmlFor="heatingNT">{getMeterLabel('heating_nt', 'Niedertarif (NT)')}</Label>
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
                <Label htmlFor="pvYield">{getMeterLabel('pv_yield', 'PV Ertrag')}</Label>
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
                <Label htmlFor="pvFeedIn">{getMeterLabel('pv_feed_in', 'Einspeisung')}</Label>
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
