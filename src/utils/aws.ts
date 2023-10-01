import AWS from 'aws-sdk';
import config from '../config';

// Configurar AWS. Necesito para usar S3 y subir archivos al bucket
AWS.config.update({
    // escapar caracteres especiales
  accessKeyId: config.ACCESS_KEY_AWS,
  secretAccessKey: config.SECRET_KEY_AWS,
  region: 'us-east-2',
});

// Crear un nuevo objeto de S3
const s3Aws = new AWS.S3();

// Exportar el objeto de S3
export default s3Aws;