import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  WriteStream,
} from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

import nodemailer from "nodemailer";

import env from "@/config/env";
import getAppName from "@/helpers/get-app-name";
import {
  LOG_ROTATE_MAX_FILES,
  LOG_ROTATE_MAX_SIZE,
} from "@/constants/constants";
import translate from "@/helpers/translate";

const logRotate = (maxFileSize: number = LOG_ROTATE_MAX_SIZE) => {
  const logDir = join(cwd(), "logs");
  const maxFiles = LOG_ROTATE_MAX_FILES;

  let currentFile: string | null = null;
  let stream: WriteStream | null = null;

  mkdirSync(logDir, { recursive: true });

  const getLogFiles = () => {
    return readdirSync(logDir)
      .filter((file) => file.endsWith(".log"))
      .map((file) => ({
        name: file,
        path: join(logDir, file),
        time: statSync(join(logDir, file)).birthtime.getTime(),
      }))
      .sort((a, b) => a.time - b.time);
  };

  const sendEmailAndDelete = async (filePath: string) => {
    const { EMAIL_USER, EMAIL_APP_PASSWORD, EMAIL_SERVICE, ADMIN_EMAIL } = env;

    const transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: translate("message.logRotate.subject", {
        appName: getAppName(),
      }),
      text: translate("message.logRotate.body"),
      attachments: [
        {
          filename: filePath.split("/").pop(),
          path: filePath,
        },
      ],
    };

    try {
      if (existsSync(filePath)) {
        await transporter.sendMail(mailOptions);
        console.log(
          translate("message.logRotate.successEmail", {
            filePath,
            adminEmail: ADMIN_EMAIL,
          }),
        );
      }
    } catch (error) {
      console.error(translate("message.logRotate.errorEmail"), error);
    } finally {
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);

          console.log(
            translate("message.logRotate.deleteLog", {
              filePath,
            }),
          );
        } catch (err) {
          console.error(
            translate("message.logRotate.errorDeleteLog", {
              filePath,
            }),
            err,
          );
        }
      }
    }
  };

  const pruneFiles = (files: { path: string }[]) => {
    if (files.length >= maxFiles) {
      const oldest = files[0];

      sendEmailAndDelete(oldest.path).catch((error) => {
        console.error(translate("message.logRotate.errorEmail"), error);
      });
    }
  };

  const rotate = () => {
    const files = getLogFiles();
    pruneFiles(files);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `app-${timestamp}.log`;

    currentFile = join(logDir, filename);

    if (stream) {
      stream.end();
    }

    stream = createWriteStream(currentFile, { flags: "a", mode: 0o666 });
  };

  const init = () => {
    const files = getLogFiles();

    if (files.length > 0) {
      const latest = files[files.length - 1];

      try {
        const stats = statSync(latest.path);

        if (stats.size < maxFileSize) {
          currentFile = latest.path;
          stream = createWriteStream(currentFile, { flags: "a", mode: 0o666 });

          if (files.length > maxFiles) {
            pruneFiles(files);
          }

          return;
        }
      } catch (error) {
        console.error(translate("message.logRotate.errorCheckLatest"), error);
      }
    }

    rotate();
  };

  init();

  return {
    write: (chunk: string) => {
      if (currentFile && stream) {
        try {
          const stats = statSync(currentFile);
          if (stats.size >= maxFileSize) {
            rotate();
          }
        } catch (error) {
          console.error(translate("message.logRotate.errorRotate"), error);
        }
      }

      if (stream) {
        stream.write(chunk);
      }
    },
  };
};

export default logRotate;
