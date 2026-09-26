import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Session pooler (port 5432) trzyma jedno połączenie na klienta, limit to 15.
 * Aplikacja idzie przez transaction pooler (6543). Migracje zostają na DATABASE_URL.
 */
function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;

  let url = raw;
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }
  if (url.includes(":6543/") && !/[?&]pgbouncer=/.test(url)) {
    url += `${url.includes("?") ? "&" : "?"}pgbouncer=true`;
  }
  if (!/[?&]connection_limit=/.test(url)) {
    url += `${url.includes("?") ? "&" : "?"}connection_limit=1&pool_timeout=20`;
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl() },
    },
  });

globalForPrisma.prisma = prisma;
