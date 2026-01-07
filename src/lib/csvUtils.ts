import { MeterReading, MeterReplacement, METER_TYPE_LABELS } from '@/types/energy';
import { generateId } from './energyUtils';

// CSV Headers in German
const CSV_HEADERS = [
  'Datum',
  'Typ',
  'Kaltwasser',
  'Gartenwasser',
  'Strom_Licht',
  'Heizung_HT',
  'Heizung_NT',
  'PV_Ertrag',
  'PV_Einspeisung',
  'Zaehlerwechsel_Zaehlertyp',
  'Zaehlerwechsel_Alter_Endstand',
  'Zaehlerwechsel_Neuer_Anfangsstand',
  'Zaehlerwechsel_Notizen',
];

export interface ExportData {
  readings: MeterReading[];
  replacements: MeterReplacement[];
}

export const exportToCSV = (data: ExportData): string => {
  const { readings, replacements } = data;
  
  // Create a combined list of entries sorted by date
  type ExportRow = {
    date: string;
    type: 'reading' | 'replacement';
    reading?: MeterReading;
    replacement?: MeterReplacement;
  };

  const rows: ExportRow[] = [
    ...readings.map((r) => ({ date: r.date, type: 'reading' as const, reading: r })),
    ...replacements.map((r) => ({ date: r.date, type: 'replacement' as const, replacement: r })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const csvRows = rows.map((row) => {
    if (row.type === 'reading' && row.reading) {
      const r = row.reading;
      return [
        r.date,
        'Ablesung',
        r.coldWater.toString().replace('.', ','),
        r.gardenWater.toString().replace('.', ','),
        r.electricityLight.toString().replace('.', ','),
        r.heatingHT.toString().replace('.', ','),
        r.heatingNT.toString().replace('.', ','),
        r.pvYield.toString().replace('.', ','),
        r.pvFeedIn.toString().replace('.', ','),
        '', '', '', '',
      ];
    } else if (row.type === 'replacement' && row.replacement) {
      const r = row.replacement;
      return [
        r.date,
        'Zählerwechsel',
        '', '', '', '', '', '', '',
        METER_TYPE_LABELS[r.meterType],
        r.oldFinalReading.toString().replace('.', ','),
        r.newInitialReading.toString().replace('.', ','),
        r.notes || '',
      ];
    }
    return [];
  });

  const csvContent = [
    CSV_HEADERS.join(';'),
    ...csvRows.map((row) => row.join(';')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (content: string, filename: string): void => {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface CSVParseResult {
  success: boolean;
  readings: MeterReading[];
  errors: string[];
  warnings: string[];
}

export const parseCSV = (content: string): CSVParseResult => {
  const result: CSVParseResult = {
    success: false,
    readings: [],
    errors: [],
    warnings: [],
  };

  try {
    // Split by lines and filter empty lines
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      result.errors.push('Die CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten.');
      return result;
    }

    // Detect delimiter (semicolon or comma)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    // Parse header to detect column positions
    const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase());
    
    // Find column indices
    const columnMap = {
      date: findColumnIndex(headers, ['datum', 'date', 'monat', 'month']),
      coldWater: findColumnIndex(headers, ['kaltwasser', 'cold_water', 'coldwater', 'wasser']),
      gardenWater: findColumnIndex(headers, ['gartenwasser', 'garden_water', 'gardenwater']),
      electricityLight: findColumnIndex(headers, ['strom_licht', 'strom', 'electricity', 'electricitylight', 'licht']),
      heatingHT: findColumnIndex(headers, ['heizung_ht', 'heizunght', 'heating_ht', 'heatinght', 'ht']),
      heatingNT: findColumnIndex(headers, ['heizung_nt', 'heizungnt', 'heating_nt', 'heatingnt', 'nt']),
      pvYield: findColumnIndex(headers, ['pv_ertrag', 'pvertrag', 'pv_yield', 'pvyield', 'ertrag']),
      pvFeedIn: findColumnIndex(headers, ['pv_einspeisung', 'pveinspeisung', 'pv_feedin', 'pvfeedin', 'einspeisung']),
    };

    // Check required columns
    if (columnMap.date === -1) {
      result.errors.push('Spalte "Datum" nicht gefunden. Bitte prüfen Sie die Kopfzeile.');
      return result;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(delimiter).map((v) => v.trim());

      try {
        const dateStr = values[columnMap.date];
        const parsedDate = parseDate(dateStr);
        
        if (!parsedDate) {
          result.warnings.push(`Zeile ${i + 1}: Ungültiges Datum "${dateStr}" - Zeile übersprungen.`);
          continue;
        }

        const reading: MeterReading = {
          id: generateId(),
          date: parsedDate,
          coldWater: parseGermanNumber(values[columnMap.coldWater]) || 0,
          gardenWater: parseGermanNumber(values[columnMap.gardenWater]) || 0,
          electricityLight: parseGermanNumber(values[columnMap.electricityLight]) || 0,
          heatingHT: parseGermanNumber(values[columnMap.heatingHT]) || 0,
          heatingNT: parseGermanNumber(values[columnMap.heatingNT]) || 0,
          pvYield: parseGermanNumber(values[columnMap.pvYield]) || 0,
          pvFeedIn: parseGermanNumber(values[columnMap.pvFeedIn]) || 0,
        };

        result.readings.push(reading);
      } catch (error) {
        result.warnings.push(`Zeile ${i + 1}: Fehler beim Parsen - Zeile übersprungen.`);
      }
    }

    if (result.readings.length === 0) {
      result.errors.push('Keine gültigen Daten gefunden.');
      return result;
    }

    result.success = true;
  } catch (error) {
    result.errors.push('Fehler beim Lesen der CSV-Datei.');
  }

  return result;
};

const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  for (const name of possibleNames) {
    const index = headers.findIndex((h) => 
      h.replace(/[^a-z0-9]/g, '').includes(name.replace(/[^a-z0-9]/g, ''))
    );
    if (index !== -1) return index;
  }
  return -1;
};

const parseGermanNumber = (value: string | undefined): number => {
  if (!value || value.trim() === '') return 0;
  // Replace German decimal comma with dot
  const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;

  // Try different date formats
  const formats = [
    // ISO format: 2024-01-15
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // German format: 15.01.2024
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    // US format: 01/15/2024
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  ];

  // ISO format
  let match = dateStr.match(formats[0]);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // German format
  match = dateStr.match(formats[1]);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // US format
  match = dateStr.match(formats[2]);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
};

export const generateSampleCSV = (): string => {
  return `Datum;Typ;Kaltwasser;Gartenwasser;Strom_Licht;Heizung_HT;Heizung_NT;PV_Ertrag;PV_Einspeisung;Zaehlerwechsel_Zaehlertyp;Zaehlerwechsel_Alter_Endstand;Zaehlerwechsel_Neuer_Anfangsstand;Zaehlerwechsel_Notizen
2024-01-01;Ablesung;100;20;5000;3000;2000;200;150;;;;
2024-02-01;Ablesung;112;20;5280;3450;2300;380;280;;;;
2024-03-01;Zählerwechsel;;;;;;;;;Kaltwasser;124;0;Zähler getauscht wegen Defekt
2024-03-01;Ablesung;0;22;5520;3800;2520;650;480;;;;`;
};
