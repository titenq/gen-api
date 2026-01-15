import { cwd } from "node:process";
import { resolve } from "node:path";

import archiver from "archiver";

const downloadProtoService = async (): Promise<Buffer> => {
  return new Promise((resolvePromise, reject) => {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const buffers: Buffer[] = [];

    archive.on("data", (data) => {
      buffers.push(data);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.on("end", () => {
      resolvePromise(Buffer.concat(buffers));
    });

    archive.directory(resolve(cwd(), "proto"), false);
    archive.finalize();
  });
};

export default downloadProtoService;
