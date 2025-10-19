const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurare transporter pentru email
    // Pentru dezvoltare, folosesc SMTP de test (Ethereal Email)
    // Pentru producție, înlocuiește cu configurația reală (Gmail, SendGrid, etc.)
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Verifică dacă sunt configurate variabilele de mediu pentru producție
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Configurație pentru producție
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        
        console.log('Email transporter initialized with production SMTP');
      } else {
        // Pentru dezvoltare - crează un cont de test
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log('Email transporter initialized with test account:', testAccount.user);
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendExpirationNotification(userEmail, userName, petName, medicationType, medicationName, expiryDate) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const subject = `Expirare ${medicationType} - ${petName}`;
      const htmlContent = `
        <h2>Notificare Expirare Medicație</h2>
        <p>Dragă <strong>${userName}</strong>,</p>
        <p>Aceasta este o notificare automată că următoarea medicație va expira în curând:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
          <p><strong>Animal:</strong> ${petName}</p>
          <p><strong>Tip medicație:</strong> ${medicationType}</p>
          <p><strong>Medicament:</strong> ${medicationName}</p>
          <p><strong>Data expirării:</strong> ${this.formatDate(expiryDate)}</p>
        </div>
        
        <p>Vă rugăm să contactați clinica veterinară pentru a programa o nouă administrare.</p>
        
        <hr>
        <p><small>Acest email a fost trimis automat de sistemul clinicii veterinare.</small></p>
      `;

      const textContent = `
        Notificare Expirare Medicație
        
        Dragă ${userName},
        
        Aceasta este o notificare automată că următoarea medicație va expira în curând:
        
        Animal: ${petName}
        Tip medicație: ${medicationType}
        Medicament: ${medicationName}
        Data expirării: ${this.formatDate(expiryDate)}
        
        Vă rugăm să contactați clinica veterinară pentru a programa o nouă administrare.
        
        Acest email a fost trimis automat de sistemul clinicii veterinare.
      `;

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Clinica Veterinară" <noreply@vetapp.ro>',
        to: userEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('Email sent successfully:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };

    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const monthNames = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  }

  // Metodă pentru configurarea SMTP real în producție
  configureProductionSMTP(config) {
    this.transporter = nodemailer.createTransport(config);
    console.log('Production SMTP configured');
  }
}

module.exports = new EmailService();