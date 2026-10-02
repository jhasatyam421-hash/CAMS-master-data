import { Router } from 'express';
import { prisma } from './db.js';
import { emailRecipientSchema, emailRecipientUpdateSchema, mineSchema, mineUpdateSchema, quantitySchema, validate } from './schemas.js';

const router = Router();
const asyncRoute = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
const mineSelect = { id: true, name: true, area: true, company: true, active: true };
const normalizeMineName = (name) => name.normalize('NFKC').trim().toLowerCase();

router.get('/auth/me', (request, response) => {
  response.json({ user: request.authUser });
});

router.get('/email-recipients', asyncRoute(async (_request, response) => {
  response.json(await prisma.emailRecipient.findMany({ orderBy: { id: 'asc' } }));
}));

router.post('/email-recipients', validate(emailRecipientSchema), asyncRoute(async (request, response) => {
  const recipient = await prisma.emailRecipient.create({ data: request.body });
  response.status(201).json(recipient);
}));

router.patch('/email-recipients/:id', validate(emailRecipientUpdateSchema), asyncRoute(async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return response.status(400).json({ error: 'Invalid recipient ID' });
  response.json(await prisma.emailRecipient.update({ where: { id }, data: request.body }));
}));

router.delete('/email-recipients/:id', asyncRoute(async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return response.status(400).json({ error: 'Invalid recipient ID' });
  await prisma.emailRecipient.delete({ where: { id } });
  response.status(204).end();
}));

router.get('/mines', asyncRoute(async (_request, response) => {
  response.json(await prisma.mine.findMany({ select: mineSelect, orderBy: { id: 'asc' } }));
}));

router.post('/mines', validate(mineSchema), asyncRoute(async (request, response) => {
  const name = request.body.name.trim();
  const maxId = await prisma.mine.findMany({ select: { id: true } });
  const nextNumber = Math.max(0, ...maxId.map(({ id }) => Number(id.slice(1)) || 0)) + 1;
  const mine = await prisma.mine.create({
    data: { ...request.body, name, nameKey: normalizeMineName(name), id: `M${String(nextNumber).padStart(3, '0')}` },
    select: mineSelect,
  });
  response.status(201).json(mine);
}));

router.patch('/mines/:id', validate(mineUpdateSchema), asyncRoute(async (request, response) => {
  const data = { ...request.body };
  if (data.name !== undefined) {
    data.name = data.name.trim();
    data.nameKey = normalizeMineName(data.name);
  }
  response.json(await prisma.mine.update({ where: { id: request.params.id }, data, select: mineSelect }));
}));

router.get('/notifications', asyncRoute(async (_request, response) => {
  const notifications = await prisma.auctionNotification.findMany({
    include: { quantities: { orderBy: { sno: 'asc' } } },
    orderBy: { date: 'desc' },
  });
  response.json(notifications);
}));

router.patch('/notifications/:notificationId/quantities/:sno', validate(quantitySchema), asyncRoute(async (request, response) => {
  const sno = Number(request.params.sno);
  if (!Number.isSafeInteger(sno) || sno < 1) return response.status(400).json({ error: 'Invalid quantity row number' });
  const quantity = await prisma.offeredQuantity.update({
    where: { notificationId_sno: { notificationId: request.params.notificationId, sno } },
    data: request.body,
  });
  response.json(quantity);
}));

export default router;