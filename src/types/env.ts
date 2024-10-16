import {Dialect} from "sequelize";

export interface CustomEnvValues {
  readonly PORT: number;
  readonly SERVER_URL: string;
  readonly CLIENT_URL: string;
  readonly CORS_ORIGIN: string;
  readonly ACCESS_TOKEN_SECRET: string;
  readonly ACCESS_TOKEN_EXPIRE: string;
  readonly REFRESH_TOKEN_SECRET: string;
  readonly REFRESH_TOKEN_EXPIRE: string;
  readonly REFRESH_TOKEN_COOKIE_NAME: string;
  readonly SMTP_HOST: string;
  readonly SMTP_PORT: string;
  readonly SMTP_USERNAME: string;
  readonly SMTP_PASSWORD: string;
  readonly EMAIL_FROM: string;
  readonly DB_USERNAME: string;
  readonly DB_PASSWORD: string;
  readonly DB_HOST: string;
  readonly DB_PORT: number;
  readonly DB_NAME: string;
  readonly DB_DIALECT: Dialect;
  readonly DB_LOGGING: string;
  readonly DB_SYNC: string;
  readonly REDIS_URL: string;

  // S3 or Minio config
  readonly S3_ACCESS_KEY: string;
  readonly S3_SECRET_KEY: string;
  readonly S3_BUCKET: string;
  readonly S3_ENDPOINT: string;

  // LOG_TO
  readonly LOG_TO_ENDPOINT: string;
  readonly LOG_TO_APP_ID: string;
  readonly LOG_TO_APP_SECRET: string;
}

declare namespace NodeJS {
  export interface ProcessEnv extends CustomEnvValues {
    readonly NODE_ENV: 'production' | 'development' | 'test';
  }
}
