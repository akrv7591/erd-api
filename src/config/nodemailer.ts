import nodemailer from 'nodemailer';
import config from './config';

export default nodemailer.createTransport({
  host: config.email.smtp.host,
  port: parseInt(config.email.smtp.port),
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.email.smtp.auth.username,
    pass: config.email.smtp.auth.password
  }
});
