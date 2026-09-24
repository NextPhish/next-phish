import pino from "pino";

export function createLogger(
  options: pino.LoggerOptions = {},
  destination?: pino.DestinationStream,
) {
  const settings: pino.LoggerOptions = {
    name: "next-phish-worker",
    level: "info",
    ...options,
    // Keep job payloads, recipient details and credentials out of operational logs.
    redact: [
      "data",
      "payload",
      "password",
      "token",
      "magicLink",
      "email",
      "*.data",
      "*.payload",
      "*.password",
      "*.token",
      "*.magicLink",
      "*.email",
    ],
  };
  return destination ? pino(settings, destination) : pino(settings);
}
