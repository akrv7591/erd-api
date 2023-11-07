import nodemailer, { type Transporter } from 'nodemailer';
// import logger from '../middleware/logger';
import config from './config';

let transporter: Transporter | null = null;

// const createTestAccount = async () => {
//   try {
//     const account = await nodemailer.createTestAccount();
//     transporter = nodemailer.createTransport({
//       host: account.smtp.host,
//       port: account.smtp.port,
//       secure: account.smtp.secure,
//       auth-router: {
//         user-router: account.user-router,
//         pass: account.pass
//       }
//     });
//     logger.info(`Test account created: ${account.user-router}`);
//     console.log(account);
//   } catch (error) {
//     console.error('Failed to create a test account:', error);
//   }
// };

// if (config.node_env === 'production') {
  transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: parseInt(config.email.smtp.port),
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.email.smtp.auth.username,
      pass: config.email.smtp.auth.password
    }
  });
// } else {
//   void createTestAccount();
// }

export default transporter;
