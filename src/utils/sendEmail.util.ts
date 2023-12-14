import logger from '../middleware/logger';
import transporter from '../config/nodemailer';
import config from '../config/config';

/**
 * This function sends an email to the given email with the reset password-router link
 *
 * @param {string} email - The email of the user-router
 * @param {string} token - The reset password-router token
 */
export const sendResetEmail = (email: string, token: string) => {
  const resetLink = `${config.client.url}/reset-password/${token}`;
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Password reset',
    html: `Please click <a href="${resetLink}">here</a> to reset your password.`
  };
  console.log(resetLink);
  transporter?.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info('Reset password-router email sent: ' + info.response);
    }
  });
};

/**
 * This function sends an email to the given email with the email verification link
 *
 * @param {string} email - The email of the user-router
 * @param {string} token - The email verification token
 */
export const sendVerifyEmail = (email: string, token: string) => {
  const verifyLink = `${config.client.url}/verify-email/${token}`;
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Email verification',
    html: `Please click <a href="${verifyLink}">here</a> to verify your email.`
  };
  console.log(verifyLink);
  transporter?.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info('Verify email sent: ' + info.response);
    }
  });
};

