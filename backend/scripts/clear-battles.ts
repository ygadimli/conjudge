
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing battle data...');

    // Delete in order to respect foreign keys (if cascade is not yet applied in DB layer)
    // But since we are updating schema, existing DB might not have Cascade.
    // So delete manually from child to parent.

    try {
        await prisma.battleRound.deleteMany({});
        console.log('Deleted Battle Rounds');
    } catch (e) { console.log('Skipping rounds...'); }

    try {
        await prisma.battleParticipant.deleteMany({});
        console.log('Deleted Battle Participants');
    } catch (e) { console.log('Skipping participants...'); }

    try {
        await prisma.battle.deleteMany({});
        console.log('Deleted Battles');
    } catch (e) { console.log('Skipping battles...'); }

    console.log('✅ Battle data cleared!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
