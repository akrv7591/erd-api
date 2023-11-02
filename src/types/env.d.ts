declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NODE_ENV: 'production' | 'development' | 'test';
    readonly PORT: string;
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
    readonly DB_PORT: string;
    readonly DB_NAME: string;
    readonly DB_DIALECT: string;
  }
}
