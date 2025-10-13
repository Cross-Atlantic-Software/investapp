/**
 * Excel Date Converter Utility
 * Converts Excel serial numbers to JavaScript Date objects
 */

export class ExcelDateConverter {
  /**
   * Convert Excel serial number to JavaScript Date
   * Excel stores dates as serial numbers where 1 = January 1, 1900
   * @param serial - Excel serial number (e.g., 45807)
   * @returns JavaScript Date object
   */
  static excelSerialToDate(serial: number): Date {
    // Excel's epoch is January 1, 1900
    const excelEpoch = new Date(1900, 0, 1);
    
    // Excel has a bug where it treats 1900 as a leap year
    // So we need to adjust for dates after February 28, 1900
    let days = serial - 2; // Subtract 2 to account for Excel's leap year bug
    
    // If the date is after February 28, 1900, subtract 1 more day
    if (serial > 59) {
      days = days - 1;
    }
    
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Convert JavaScript Date to Excel serial number
   * @param date - JavaScript Date object
   * @returns Excel serial number
   */
  static dateToExcelSerial(date: Date): number {
    const excelEpoch = new Date(1900, 0, 1);
    const diffTime = date.getTime() - excelEpoch.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Add 2 to account for Excel's leap year bug
    let serial = diffDays + 2;
    
    // If the date is after February 28, 1900, add 1 more day
    if (date > new Date(1900, 1, 28)) {
      serial = serial + 1;
    }
    
    return serial;
  }

  /**
   * Validate if a number could be an Excel serial number
   * Excel serial numbers are typically between 1 and 2958465 (year 9999)
   * @param value - Value to validate
   * @returns true if it could be an Excel serial number
   */
  static isValidExcelSerial(value: number): boolean {
    return value >= 1 && value <= 2958465 && Number.isInteger(value);
  }

  /**
   * Parse a string that might contain an Excel serial number
   * @param value - String value to parse
   * @returns Parsed number or null if invalid
   */
  static parseExcelSerial(value: string): number | null {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || !this.isValidExcelSerial(parsed)) {
      return null;
    }
    return parsed;
  }

  /**
   * Convert Excel serial to formatted date string
   * @param serial - Excel serial number
   * @param format - Date format (default: 'YYYY-MM-DD')
   * @returns Formatted date string
   */
  static excelSerialToDateString(serial: number, format: string = 'YYYY-MM-DD'): string {
    const date = this.excelSerialToDate(serial);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Test the converter with sample data
   * @returns Test results
   */
  static testConverter(): { serial: number; date: Date; dateString: string }[] {
    const testSerials = [45807, 45806, 45805, 45804, 45800];
    
    return testSerials.map(serial => ({
      serial,
      date: this.excelSerialToDate(serial),
      dateString: this.excelSerialToDateString(serial)
    }));
  }
}

// Example usage and testing
if (require.main === module) {
  console.log('Testing Excel Date Converter:');
  const testResults = ExcelDateConverter.testConverter();
  testResults.forEach(result => {
    console.log(`Serial ${result.serial} -> ${result.dateString} (${result.date.toDateString()})`);
  });
}
