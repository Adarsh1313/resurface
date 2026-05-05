export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getJwtSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    return getRequiredEnv('JWT_SECRET');
  }
  return process.env.JWT_SECRET || 'dev-secret';
}
