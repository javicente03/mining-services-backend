import { v4 as uuidv4 } from 'uuid';
import s3Aws from './aws';
import config from '../config';

export const UploadArchiveToS3 = async (file: any, path: string, format: string) => {
    try {
        const base64Data = Buffer.alloc(file.length, file, 'base64');
        const name = uuidv4();

        let formatClean = format.split('/')[1];

        const data = await s3Aws.upload({
            // Bucket hace referencia al nombre del bucket que creamos en AWS
            Bucket: config.BUCKET_NAME_AWS || '',
            // Key hace referencia al nombre del archivo que vamos a guardar en el bucket
            Key: `${path}/${name}.${formatClean}`,
            Body: base64Data
        }).promise();

        return {
            path: `${path}/${name}.${formatClean}`,
        };
        
    } catch (error: any) {
        return false;
    }
}