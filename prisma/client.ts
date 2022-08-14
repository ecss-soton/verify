import { PrismaClient } from '@prisma/client';

/**
 * Ensures only a single instance of the Prisma Client ever exists
 *
 * Recommended in the [prisma docs](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-long-running-applications)
 */
const prisma = new PrismaClient();

export default prisma;