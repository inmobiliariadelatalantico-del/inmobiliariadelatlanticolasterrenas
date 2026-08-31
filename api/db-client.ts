import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cachedSql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('La variable de entorno DATABASE_URL no está configurada.');
  }
  if (!cachedSql) {
    cachedSql = neon(databaseUrl);
  }
  return cachedSql;
}

export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  const queryFn = getSql();
  return queryFn(strings, ...values);
}) as unknown as NeonQueryFunction<false, false>;
