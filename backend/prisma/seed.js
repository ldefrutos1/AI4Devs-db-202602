/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('node:path');
const { config } = require('dotenv');
const { PrismaClient } = require('@prisma/client');

config({ path: resolve(__dirname, '..', '..', '.env') });

const prisma = new PrismaClient();

const INTERVIEW_TYPE_NAMES = [
  'Llamada de RRHH',
  'Entrevista cultural',
  'Prueba técnica',
  'Entrevista técnica',
  'Entrevista con manager',
];

const FLOW_DESCRIPTION = 'Estándar ingeniería - 4 fases';

const STEPS = [
  { orderIndex: 1, name: 'Screening telefónico', typeName: 'Llamada de RRHH' },
  { orderIndex: 2, name: 'Prueba técnica online', typeName: 'Prueba técnica' },
  { orderIndex: 3, name: 'Entrevista técnica con el equipo', typeName: 'Entrevista técnica' },
  { orderIndex: 4, name: 'Entrevista final con manager', typeName: 'Entrevista con manager' },
];

async function main() {
  for (const typeName of INTERVIEW_TYPE_NAMES) {
    await prisma.interviewType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
  }

  const types = await prisma.interviewType.findMany({
    where: { name: { in: INTERVIEW_TYPE_NAMES } },
  });
  const typeIdByName = Object.fromEntries(types.map((t) => [t.name, t.id]));

  const flow = await prisma.interviewFlow.upsert({
    where: { description: FLOW_DESCRIPTION },
    update: {},
    create: { description: FLOW_DESCRIPTION },
  });

  for (const step of STEPS) {
    const interviewTypeId = typeIdByName[step.typeName];
    if (interviewTypeId == null) {
      throw new Error(`Tipo de entrevista no encontrado: ${step.typeName}`);
    }
    await prisma.interviewStep.upsert({
      where: {
        interviewFlowId_orderIndex: {
          interviewFlowId: flow.id,
          orderIndex: step.orderIndex,
        },
      },
      update: {
        name: step.name,
        interviewTypeId,
      },
      create: {
        interviewFlowId: flow.id,
        orderIndex: step.orderIndex,
        name: step.name,
        interviewTypeId,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
