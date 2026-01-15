import enUS from "@/locales/en-US";
import ptBR from "@/locales/pt-BR";
import esES from "@/locales/es-ES";

import { ACCEPT_LANGUAGE } from "@/constants/constants";

const messages: Record<string, any> = {
  "en-US": enUS,
  "pt-BR": ptBR,
  "es-ES": esES,
};

const translate = (
  key: string,
  params?: Record<string, string | number>,
): string => {
  const locale = ACCEPT_LANGUAGE;
  const keys = key.split(".");
  let value = messages[locale];

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key;
    }
  }

  if (params && typeof value === "string") {
    value = Object.entries(params).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`%\\{${k}\\}`, "g"), String(v));
    }, value);
  }

  return value;
};

export default translate;
