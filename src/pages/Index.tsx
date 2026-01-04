import { Droplets, Zap, Flame, Sun } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { MeterReadingForm } from '@/components/MeterReadingForm';
import { WarningBanner } from '@/components/WarningBanner';
import { CSVImportExport } from '@/components/CSVImportExport';
import { WaterChart } from '@/components/charts/WaterChart';
import { ElectricityChart } from '@/components/charts/ElectricityChart';
import { HeatingChart } from '@/components/charts/HeatingChart';
import { SolarChart } from '@/components/charts/SolarChart';
import { YearlyComparison } from '@/components/charts/YearlyComparison';
import { useEnergyData } from '@/hooks/useEnergyData';
import { useMeterInfo } from '@/hooks/useMeterInfo';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const {
    meterReadings,
    consumptionData,
    yearlyData,
    warnings,
    latestReading,
    isLoading,
    addReading,
    setReadings,
  } = useEnergyData();
  const { meterInfo } = useMeterInfo();

  const latestConsumption = consumptionData.length > 0 
    ? consumptionData[consumptionData.length - 1] 
    : null;

  const previousConsumption = consumptionData.length > 1 
    ? consumptionData[consumptionData.length - 2] 
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[350px] rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Warning Banner */}
        <WarningBanner warnings={warnings} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              {latestConsumption 
                ? `Letzter Eintrag: ${latestConsumption.month}`
                : 'Noch keine Daten vorhanden'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <CSVImportExport readings={meterReadings} onImport={setReadings} />
            <MeterReadingForm 
              onSubmit={addReading} 
              defaultValues={latestReading ?? undefined}
            />
          </div>
        </div>

        {/* Stats Grid */}
        {latestConsumption && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Wasserverbrauch"
              value={latestConsumption.totalWater}
              unit="m³"
              icon={<Droplets className="w-5 h-5" />}
              type="water"
              previousValue={previousConsumption?.totalWater}
              meterNumber={meterInfo['cold_water']}
            />
            <StatCard
              title="Strom Licht"
              value={latestConsumption.electricityLight}
              unit="kWh"
              icon={<Zap className="w-5 h-5" />}
              type="electricity"
              previousValue={previousConsumption?.electricityLight}
              meterNumber={meterInfo['electricity_light']}
            />
            <StatCard
              title="Heizstrom"
              value={latestConsumption.totalHeating}
              unit="kWh"
              icon={<Flame className="w-5 h-5" />}
              type="heating"
              previousValue={previousConsumption?.totalHeating}
              meterNumber={meterInfo['heating_ht']}
            />
            <StatCard
              title="PV Eigenverbrauch"
              value={latestConsumption.pvSelfConsumption}
              unit="kWh"
              icon={<Sun className="w-5 h-5" />}
              type="solar"
              previousValue={previousConsumption?.pvSelfConsumption}
              meterNumber={meterInfo['pv_yield']}
            />
          </div>
        )}

        {/* Charts Grid */}
        {consumptionData.length > 0 && (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <WaterChart data={consumptionData} />
              <ElectricityChart data={consumptionData} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <HeatingChart data={consumptionData} />
              <SolarChart data={consumptionData} />
            </div>

            {/* Yearly Comparison */}
            {yearlyData.length > 0 && (
              <YearlyComparison data={yearlyData} />
            )}
          </>
        )}

        {/* Empty State */}
        {consumptionData.length === 0 && (
          <div className="energy-card text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Noch keine Daten</h3>
            <p className="text-muted-foreground mb-6">
              Erfassen Sie Ihren ersten Zählerstand, um das Dashboard zu aktivieren.
            </p>
            <MeterReadingForm onSubmit={addReading} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Energie-Controlling © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
