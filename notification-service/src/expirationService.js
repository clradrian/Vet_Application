const db = require('./db');
const emailService = require('./emailService');

class ExpirationService {
  // Verifică toate expirările și trimite notificări
  async checkExpirations() {
    console.log('Checking for medication expirations...');
    
    try {
      // Data curentă și data în 7 zile (pentru notificări preventive)
      const today = new Date();
      const in7Days = new Date();
      in7Days.setDate(today.getDate() + 7);
      
      const todayStr = today.toISOString().split('T')[0];
      const in7DaysStr = in7Days.toISOString().split('T')[0];

      // Verifică expirări vaccinuri
      await this.checkVaccineExpirations(todayStr, in7DaysStr);
      
      // Verifică expirări deparazitări interne
      await this.checkDewormingExpirations('internal', 'Deparazitare Internă', todayStr, in7DaysStr);
      
      // Verifică expirări deparazitări externe
      await this.checkDewormingExpirations('external', 'Deparazitare Externă', todayStr, in7DaysStr);
      
      console.log('Expiration check completed');
      
    } catch (error) {
      console.error('Error checking expirations:', error);
    }
  }

  async checkVaccineExpirations(todayStr, in7DaysStr) {
    const query = `
      SELECT 
        v.id,
        v.pet_id,
        v.name as vaccine_name,
        v.expiryDate as expiry_date,
        p.name as pet_name,
        u.fullName as owner_name,
        u.email as owner_email
      FROM vaccines v
      JOIN pets p ON v.pet_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE v.expiryDate IS NOT NULL 
        AND v.expiryDate BETWEEN $1 AND $2
        AND u.email IS NOT NULL 
        AND u.email != ''
      ORDER BY v.expiryDate ASC
    `;

    try {
      const result = await db.query(query, [todayStr, in7DaysStr]);
      
      for (const row of result.rows) {
        await this.sendExpirationEmail(
          row.owner_email,
          row.owner_name,
          row.pet_name,
          'Vaccin',
          row.vaccine_name,
          row.expiry_date
        );
        
        // Marchează că a fost trimisă notificarea (opțional, pentru a evita spam-ul)
        await this.markNotificationSent('vaccine', row.id);
      }
      
      console.log(`Processed ${result.rows.length} vaccine expiration notifications`);
      
    } catch (error) {
      console.error('Error checking vaccine expirations:', error);
    }
  }

  async checkDewormingExpirations(dewormingType, medicationType, todayStr, in7DaysStr) {
    const query = `
      SELECT 
        d.id,
        d.pet_id,
        d.name as medication_name,
        d.expiryDate as expiry_date,
        p.name as pet_name,
        u.fullName as owner_name,
        u.email as owner_email
      FROM dewormings d
      JOIN pets p ON d.pet_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE d.type = $1
        AND d.expiryDate IS NOT NULL 
        AND d.expiryDate BETWEEN $2 AND $3
        AND u.email IS NOT NULL 
        AND u.email != ''
      ORDER BY d.expiryDate ASC
    `;

    try {
      const result = await db.query(query, [dewormingType, todayStr, in7DaysStr]);
      
      for (const row of result.rows) {
        await this.sendExpirationEmail(
          row.owner_email,
          row.owner_name,
          row.pet_name,
          medicationType,
          row.medication_name,
          row.expiry_date
        );
        
        // Marchează că a fost trimisă notificarea
        await this.markNotificationSent(`deworming_${dewormingType}`, row.id);
      }
      
      console.log(`Processed ${result.rows.length} ${medicationType} expiration notifications`);
      
    } catch (error) {
      console.error(`Error checking ${medicationType} expirations:`, error);
    }
  }

  async sendExpirationEmail(email, ownerName, petName, medicationType, medicationName, expiryDate) {
    try {
      const result = await emailService.sendExpirationNotification(
        email,
        ownerName,
        petName,
        medicationType,
        medicationName,
        expiryDate
      );
      
      if (result.success) {
        console.log(`Email sent to ${email} for ${petName} - ${medicationType}`);
        if (result.previewUrl) {
          console.log(`Preview: ${result.previewUrl}`);
        }
      } else {
        console.error(`Failed to send email to ${email}:`, result.error);
      }
      
    } catch (error) {
      console.error('Error sending expiration email:', error);
    }
  }

  async markNotificationSent(type, recordId) {
    // Marchează că notificarea a fost trimisă pentru a evita spam-ul
    try {
      const insertQuery = `
        INSERT INTO notification_log (type, record_id, sent_date)
        VALUES ($1, $2, CURRENT_DATE)
        ON CONFLICT (type, record_id, sent_date) DO NOTHING
      `;
      
      await db.query(insertQuery, [type, recordId]);
      
    } catch (error) {
      console.error('Error marking notification as sent:', error);
    }
  }

  // Metodă pentru testare manuală
  async testNotifications() {
    console.log('Running test notification check...');
    await this.checkExpirations();
  }
}

module.exports = new ExpirationService();