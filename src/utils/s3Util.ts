import {Client} from 'minio';
import {Endpoint} from "../constants/endpoint";
import config from "../config/config";

export class S3Util {
  static get s3Client() {
    return new Client({
      endPoint: Endpoint.s3,
      useSSL: true,
      accessKey: config.s3.access_key,
      secretKey: config.s3.secret_key,
    })
  }

  static async initS3() {
    try {
      const bucketExists = await this.s3Client.bucketExists(config.s3.bucket)

      if (!bucketExists) {
        this.s3Client.makeBucket(config.s3.bucket, (error) => {
          if (error) {
            console.error(error)
          } else {
            console.log(config.s3.bucket + " bucket created")
          }
        })
      } else {
        console.log(config.s3.bucket + " bucket exists we can continue")
      }
    } catch (e) {
      console.error(e)
      throw new Error("S3 CONNECTION FAILED")
    }
  }
}
