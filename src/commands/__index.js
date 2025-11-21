import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function registerCommandHandlers(app) {
    const commandsDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

    for (const file of commandFiles) {
        const commandModule = await import(path.join(commandsDir, file));
        if (commandModule.init && typeof commandModule.init === 'function') {
            await commandModule.init(app);
        }
    }
}