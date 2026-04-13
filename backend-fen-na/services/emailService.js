const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Vérification de la connexion SMTP
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP vérifiée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error);
  }
};

// Fonction pour envoyer un email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe - Feñ Na Sénégal',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2c3e50; text-align: center;">Réinitialisation de mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Feñ Na Sénégal.</p>
          <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            Ce lien expirera dans 1 heure pour des raisons de sécurité.
          </p>
          <p style="color: #7f8c8d; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
          <hr style="border: 1px solid #ecf0f1; margin: 30px 0;">
          <p style="color: #95a5a6; font-size: 12px; text-align: center;">
            Cordialement,<br>
            L'équipe Feñ Na Sénégal
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de réinitialisation envoyé:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendPasswordResetEmail
};
