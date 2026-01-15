import translate from "@/helpers/translate";

const formatUptime = (uptime: number): string => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const milliseconds = Math.floor((uptime % 1) * 1000);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(
      `${days} ${days === 1 ? translate("time.day") : translate("time.days")}`,
    );
  }

  parts.push(
    `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}.` +
      `${String(milliseconds).padStart(3, "0")}`,
  );

  return parts.join(" ");
};

export default formatUptime;
