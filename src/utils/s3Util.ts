import {Client} from 'minio';
import config from "../config/config";
import {createId} from "@paralleldrive/cuid2";
import path from "path";
import multer from "multer";
import multerMinio from "multer-minio-storage";


export class S3Util {
  private static instance: Client;

  static getInstance() {
    if (!S3Util.instance) {
      S3Util.instance = new Client({
        endPoint: config.s3.end_point,
        useSSL: true,
        accessKey: config.s3.access_key,
        secretKey: config.s3.secret_key,
      })
    }

    return S3Util.instance
  }
  static s3Client() {
    if (S3Util.instance) {
      this.instance = new Client({
        endPoint: config.s3.end_point,
        useSSL: true,
        accessKey: config.s3.access_key,
        secretKey: config.s3.secret_key,
      })
    }
    return S3Util.instance
  }

  static async initS3() {
    try {
      const bucketExists = await S3Util.getInstance().bucketExists(config.s3.bucket)

      if (!bucketExists) {
        try {
          await this.s3Client().makeBucket(config.s3.bucket)
          console.log(config.s3.bucket + " bucket created")
        } catch (error) {
          console.error(error)
        }

      } else {
        console.log("🎉 S3 CONNECTION SUCCESS")
      }
    } catch (e) {
      console.error(e)
      throw new Error("S3 CONNECTION FAILED")
    }
  }

  static fileUpload(directory: string) {
    return multer({
      storage: multerMinio({
        minioClient: S3Util.getInstance(),
        bucket: config.s3.bucket,
        contentType: multerMinio.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
        },
        acl: "public-read",
        key: function (req, file, cb) {
          const extname = path.extname(file.originalname)
          const key = directory + createId() + extname
          cb(null, key);
        },
      })
    })
  }
}
