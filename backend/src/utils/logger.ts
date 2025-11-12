enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const log = (level: LogLevel, message: string, data?: any): void => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}]`;

  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

export const logger = {
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),
};
