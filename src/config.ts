import { config } from "dotenv";

config();

export default {
    PORT : process.env.PORT,
    SECRET_KEY_JWT : process.env.SECRET_KEY_JWT,
    DOMAIN_BACKEND: process.env.DOMAIN_BACKEND,
    DOMAIN_FRONTEND: process.env.DOMAIN_FRONTEND,
    SMTP_ENDPOINT: process.env.SMTP_ENDPOINT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
}