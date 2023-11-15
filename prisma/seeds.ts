import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.company.create({
    data: {
      name: "GeneralPayment",
    },
  });
  await prisma.user.create({
    data: {
      email: "vtunon@uc.cl",
      name: "Vicente Tunon",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
