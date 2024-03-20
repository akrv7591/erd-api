import * as dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  PORT: Joi.string().required().default('4000'),
  SERVER_URL: Joi.string().required(),
  CLIENT_URL: Joi.string().required(),
  CORS_ORIGIN: Joi.string().required().default('*'),
  ACCESS_TOKEN_SECRET: Joi.string().min(8).required(),
  ACCESS_TOKEN_EXPIRE: Joi.string().required().default('20m'),
  REFRESH_TOKEN_SECRET: Joi.string().min(8).required(),
  REFRESH_TOKEN_EXPIRE: Joi.string().required().default('1d'),
  REFRESH_TOKEN_COOKIE_NAME: Joi.string().required().default('jid'),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_DIALECT: Joi.string().required(),
  DB_LOGGING: Joi.boolean().required(),
  DB_SYNC: Joi.boolean().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.string().default('587'),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  REDIS_URL: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
});

const { value: validatedEnv, error } = envSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env, { abortEarly: false, stripUnknown: true });

if (error) {
  throw new Error(
    `Environment variable validation error: \n${error.details
      .map((detail) => detail.message)
      .join('\n')}`
  );
}

const config = {
  node_env: validatedEnv.NODE_ENV,
  server: {
    port: validatedEnv.PORT,
    url: validatedEnv.SERVER_URL
  },
  client: {
    url: validatedEnv.CLIENT_URL
  },
  cors: {
    cors_origin: validatedEnv.CORS_ORIGIN
  },
  jwt: {
    access_token: {
      secret: new TextEncoder().encode(validatedEnv.ACCESS_TOKEN_SECRET),
      expire: validatedEnv.ACCESS_TOKEN_EXPIRE
    },
    refresh_token: {
      secret: new TextEncoder().encode(validatedEnv.REFRESH_TOKEN_SECRET),
      expire: validatedEnv.REFRESH_TOKEN_EXPIRE,
      cookie_name: validatedEnv.REFRESH_TOKEN_COOKIE_NAME
    }
  },
  email: {
    smtp: {
      host: validatedEnv.SMTP_HOST,
      port: validatedEnv.SMTP_PORT,
      auth: {
        username: validatedEnv.SMTP_USERNAME,
        password: validatedEnv.SMTP_PASSWORD
      }
    },
    from: validatedEnv.EMAIL_FROM
  },
  db: {
    erd: {
      host: validatedEnv.DB_HOST,
      username: validatedEnv.DB_USERNAME,
      password: validatedEnv.DB_PASSWORD,
      database: validatedEnv.DB_NAME,
      dialect: validatedEnv.DB_DIALECT,
      port: validatedEnv.DB_PORT
    },
    logging: validatedEnv.DB_LOGGING,
    sync: validatedEnv.DB_SYNC,
  },
  redis: {
    url: validatedEnv.REDIS_URL
  },
  s3: {
    access_key: validatedEnv.S3_ACCESS_KEY,
    secret_key: validatedEnv.S3_SECRET_KEY,
    bucket: validatedEnv.S3_BUCKET
  }
} as const;

export default config;
