import * as dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import {createRemoteJWKSet} from "jose";
import {CustomEnvValues} from "../types/env";
import * as process from "node:process";

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const envSchema = Joi.object<CustomEnvValues>().keys({
  PORT: Joi.number().required().default('4000'),
  SERVER_URL: Joi.string().required(),
  CLIENT_URL: Joi.string().required(),
  CORS_ORIGIN: Joi.string().required().default('*'),
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
  S3_ENDPOINT: Joi.string().required(),
  LOG_TO_ENDPOINT: Joi.string().required(),
  LOG_TO_APP_ID: Joi.string().required(),
  LOG_TO_APP_SECRET: Joi.string().required(),

});


const result = envSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env, { abortEarly: false, stripUnknown: true });

if (result.error) {
  throw new Error(
    `Environment variable validation error: \n${result.error.details
      .map((detail) => detail.message)
      .join('\n')}`
  );
}

if (!result.value) {
  throw new Error(
    `Environment variable there are no values`
  );
}

const validatedEnv = result.value

const config = {
  node_env: process.env['NODE_ENV'],
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
    bucket: validatedEnv.S3_BUCKET,
    base_url: "https://" + validatedEnv.S3_ENDPOINT,
    end_point: validatedEnv.S3_ENDPOINT
  },
  logTo: {
    endpoint: validatedEnv.LOG_TO_ENDPOINT,
    appId: validatedEnv.LOG_TO_APP_ID,
    appSecret: validatedEnv.LOG_TO_APP_SECRET,
    jwks: createRemoteJWKSet(new URL(`${validatedEnv.LOG_TO_ENDPOINT}/oidc/jwks`)),
    issuer: `${validatedEnv.LOG_TO_ENDPOINT}/oidc`

  }
} as const;

export default config;
