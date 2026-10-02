import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const procurementAccountSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(72)
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
});

const emails = [
  { id: 1, stage: 1, department: 'BAG', type: 'To', name: 'BAG Finance Team', email: 'bag.finance@tatasteel.com', active: true },
  { id: 2, stage: 1, department: 'Procurement', type: 'CC', name: 'RM Procurement Head', email: 'rm.procurement@tatasteel.com', active: true },
  { id: 3, stage: 4, department: 'ChiefRM', type: 'To', name: 'Chief RM Proc', email: 'chief.rm@tatasteel.com', active: true },
  { id: 4, stage: 6, department: 'Finance', type: 'To', name: 'Finance DPR Team', email: 'finance.dpr@tatasteel.com', active: true },
  { id: 5, stage: 7, department: 'Logistics', type: 'To', name: 'RM Logistics', email: 'logistics.rm@tatasteel.com', active: true },
  { id: 6, stage: 8, department: 'ChiefRM', type: 'CC', name: 'Head RM Procurement', email: 'head.rm@tatasteel.com', active: false },
  { id: 7, stage: 8, department: 'Finance', type: 'To', name: 'Finance Advance Pymt', email: 'fin.advance@tatasteel.com', active: true },
  { id: 8, stage: 13, department: 'Procurement', type: 'CC', name: 'Proc Manager', email: 'proc.manager@tatasteel.com', active: true },
];

const mines = [
  { id: 'M001', name: 'Lingaraj OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M002', name: 'Bharatpur OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M003', name: 'Jagannath OCP', area: 'Talcher', company: 'MCL', active: true },
  { id: 'M004', name: 'Ananta OCP', area: 'Talcher', company: 'MCL', active: true },
  { id: 'M005', name: 'Belpahar OCP', area: 'IB Valley', company: 'MCL', active: false },
  { id: 'M006', name: 'Samaleswari OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M007', name: 'Kulda OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M008', name: 'Kaniha OCP', area: 'Talcher', company: 'MCL', active: true },
];
const mineNameKey = (name) => name.normalize('NFKC').trim().toLowerCase();

const notifications = [
  { id: 'N001', number: 'MCL/EA/2025/001', date: new Date('2025-01-15T00:00:00.000Z'), supplier: 'MCL' },
  { id: 'N002', number: 'MCL/EA/2025/002', date: new Date('2025-02-10T00:00:00.000Z'), supplier: 'MCL' },
];

const quantities = [
  { notificationId: 'N001', sno: 1, mine: 'Lingaraj OCP', coalType: 'Thermal Coal', grade: 'G3', qty: 50000 },
  { notificationId: 'N001', sno: 2, mine: 'Jagannath OCP', coalType: 'Thermal Coal', grade: 'G4', qty: 30000 },
  { notificationId: 'N001', sno: 3, mine: 'Ananta OCP', coalType: 'Thermal Coal', grade: 'G5', qty: 20000 },
  { notificationId: 'N001', sno: 4, mine: 'Bharatpur OCP', coalType: 'Washery Rejects', grade: 'WR1', qty: 15000 },
  { notificationId: 'N002', sno: 1, mine: 'Lingaraj OCP', coalType: 'Thermal Coal', grade: 'G2', qty: 60000 },
  { notificationId: 'N002', sno: 2, mine: 'Samaleswari OCP', coalType: 'Thermal Coal', grade: 'G3', qty: 40000 },
];

try {
  if (!await prisma.emailRecipient.count()) await prisma.emailRecipient.createMany({ data: emails });
  if (!await prisma.mine.count()) {
    await prisma.mine.createMany({ data: mines.map((mine) => ({ ...mine, nameKey: mineNameKey(mine.name) })) });
  }
  if (!await prisma.auctionNotification.count()) {
    await prisma.auctionNotification.createMany({ data: notifications });
    await prisma.offeredQuantity.createMany({ data: quantities });
  }

  const configuredEmail = process.env.PROCUREMENT_EMAIL;
  const configuredPassword = process.env.PROCUREMENT_PASSWORD;
  if (Boolean(configuredEmail) !== Boolean(configuredPassword)) {
    throw new Error('Set both PROCUREMENT_EMAIL and PROCUREMENT_PASSWORD to provision the Procurement account.');
  }
  if (configuredEmail && configuredPassword) {
    const { email, password } = procurementAccountSchema.parse({ email: configuredEmail, password: configuredPassword });
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('Set JWT_SECRET to at least 32 characters before provisioning the Procurement account.');
    }
    if (!await prisma.user.findUnique({ where: { email } })) {
      const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, passwordHash, role: 'Procurement' } });
      console.log(`Created Procurement account for ${email}`);
    }
  }
} finally {
  await prisma.$disconnect();
}