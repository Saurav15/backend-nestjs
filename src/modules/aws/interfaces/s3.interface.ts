import { Readable } from 'stream';

export interface IS3Service {
  uploadFile(
    file: Buffer | Readable,
    key: string,
    contentType: string,
  ): Promise<string>;

  getFile(key: string): Promise<Buffer>;

  deleteFile(key: string): Promise<void>;

  fileExists(key: string): Promise<boolean>;
}
