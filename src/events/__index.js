import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function registerEventHandlers(app) {
    const eventsDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
    
    const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js') && file !== 'index.js');
    for (const file of eventFiles) {
        const eventModule = await import(path.join(eventsDir, file));
        if (eventModule.init && typeof eventModule.init === 'function') {
            await eventModule.init(app);
        }
    }
}