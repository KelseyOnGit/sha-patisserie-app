/* eslint-disable @typescript-eslint/no-require-imports -- Runs the shared TypeScript PIN helper without adding a runner. */
const fs = require('node:fs');
const ts = require('typescript');
const { PrismaClient } = require('@prisma/client');

require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(result.outputText, filename);
};
const { hashPin, isPinHash, verifyPin } = require('../lib/pins.ts');
const prisma = new PrismaClient();

async function main(args = process.argv.slice(2)) {
  if (args.some((arg) => arg !== '--apply') || args.length > 1) {
    throw new Error('Usage: npm run pins:migrate -- [--apply]');
  }
  const users = await prisma.user.findMany({ select: { id: true, pinCode: true } });
  const legacy = users.filter((user) => !isPinHash(user.pinCode));
  if (legacy.some((user) => !/^\d{4,6}$/.test(user.pinCode))) {
    throw new Error('Unsupported credential formats found. No changes made; resolve them before migration.');
  }
  console.log(`Accounts: ${users.length}; hashed: ${users.length - legacy.length}; plaintext: ${legacy.length}.`);
  if (!args.includes('--apply')) {
    console.log('Dry run only. Back up the intended database, then run with --apply to hash existing PINs.');
    return;
  }
  // Derive hashes outside the transaction so hashing cannot hold database locks.
  const updates = [];
  for (const user of legacy) {
    const hash = await hashPin(user.pinCode);
    if (!await verifyPin(user.pinCode, hash)) throw new Error('Hash verification failed. No changes made.');
    updates.push({ id: user.id, original: user.pinCode, hash });
  }
  await prisma.$transaction(async (tx) => {
    for (const entry of updates) {
      const result = await tx.user.updateMany({
        where: { id: entry.id, pinCode: entry.original },
        data: { pinCode: entry.hash },
      });
      if (result.count !== 1) throw new Error('Credentials changed during migration. Transaction rolled back; retry.');
    }
  }, { timeout: 60000 });
  const remaining = await prisma.user.findMany({ select: { pinCode: true } });
  if (remaining.some((user) => !isPinHash(user.pinCode))) {
    throw new Error('Unhashed credentials remain. Stop older app versions creating plaintext PINs and retry.');
  }
  console.log(`Migrated ${updates.length} PINs. All stored PINs are hashed; existing PINs verified without printing credentials.`);
}

module.exports = { main };

if (require.main === module) {
  main().catch(() => {
    // Prisma errors can contain query arguments; never print credentials or hashes.
    console.error('PIN migration failed. Check connection settings, credential formats and concurrent updates. No credential values were logged.');
    process.exitCode = 1;
  }).finally(() => prisma.$disconnect());
}
