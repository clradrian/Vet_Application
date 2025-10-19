/**
 * Format date to dd.MMM.YYYY format (e.g., "15.Jan.2023")
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string or '-' if invalid
 */
export const formatDateToDDMMMYYYY = (date) => {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '-';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const monthNames = [
      'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
      'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'
    ];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    return '-';
  }
};

/**
 * Convert date from dd.MMM.YYYY format back to YYYY-MM-DD for input fields
 * @param {string} formattedDate - Date in dd.MMM.YYYY format
 * @returns {string} - Date in YYYY-MM-DD format or empty string if invalid
 */
export const formatDateToInput = (formattedDate) => {
  if (!formattedDate || formattedDate === '-') return '';
  
  try {
    const monthNames = [
      'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
      'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'
    ];
    
    const parts = formattedDate.split('.');
    if (parts.length !== 3) return '';
    
    const day = parts[0];
    const monthIndex = monthNames.indexOf(parts[1]);
    const year = parts[2];
    
    if (monthIndex === -1) return '';
    
    const month = (monthIndex + 1).toString().padStart(2, '0');
    return `${year}-${month}-${day.padStart(2, '0')}`;
  } catch (error) {
    return '';
  }
};