import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma.js";
async function main() {
    await prisma.$connect();
    app.listen(env.port, () => {
        console.log(`Server running on port ${env.port}`);
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
