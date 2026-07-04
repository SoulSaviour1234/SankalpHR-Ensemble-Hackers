/**
 * Generates a Login ID based on the following rules:
 * [First 2 letters of company] + [First 2 letters of employee first name + first 2 letters of last name] + [Year of joining] + [Serial number of joining that year]
 * 
 * Example: 'OIJODO20220001'
 */
export function generateLoginId(
  companyName: string,
  employeeName: string,
  joiningDate: Date | string | null,
  serialNumber: number
): string {
  // 1. Company Code (2 letters)
  let companyCode = '';
  const cleanCompany = companyName.trim().replace(/[^a-zA-Z\s]/g, '');
  const companyWords = cleanCompany.split(/\s+/).filter(Boolean);
  
  if (companyWords.length >= 2) {
    companyCode = (companyWords[0][0] + companyWords[1][0]).toUpperCase();
  } else if (companyWords.length === 1 && companyWords[0].length >= 2) {
    companyCode = companyWords[0].slice(0, 2).toUpperCase();
  } else {
    companyCode = ((cleanCompany || 'CO') + 'XX').slice(0, 2).toUpperCase();
  }

  // 2. Employee Name Code (4 letters)
  let nameCode = '';
  const cleanEmployee = employeeName.trim().replace(/[^a-zA-Z\s]/g, '');
  const employeeWords = cleanEmployee.split(/\s+/).filter(Boolean);

  if (employeeWords.length >= 2) {
    const firstWord = employeeWords[0];
    const lastWord = employeeWords[employeeWords.length - 1];
    
    const firstPart = (firstWord + 'XX').slice(0, 2);
    const lastPart = (lastWord + 'XX').slice(0, 2);
    nameCode = (firstPart + lastPart).toUpperCase();
  } else if (employeeWords.length === 1) {
    const singleWord = employeeWords[0];
    nameCode = (singleWord + 'XXXX').slice(0, 4).toUpperCase();
  } else {
    nameCode = 'EMP1';
  }

  // 3. Joining Year (4 digits)
  const date = joiningDate ? new Date(joiningDate) : new Date();
  const yearStr = isNaN(date.getTime()) ? new Date().getFullYear().toString() : date.getFullYear().toString();

  // 4. Serial Number (4 digits, zero-padded)
  const serialStr = String(serialNumber).padStart(4, '0');

  return `${companyCode}${nameCode}${yearStr}${serialStr}`;
}
