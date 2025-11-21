import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function registerInteractiveHandlers(app) {
    const interactivesDir = path.join(path.dirname(fileURLToPath(import.meta.url)));
    
    const interactiveFiles = fs.readdirSync(interactivesDir).filter(file => file.endsWith('.js') && file !== 'index.js');
    for (const file of interactiveFiles) {
        const interactiveModule = await import(path.join(interactivesDir, file));
        if (interactiveModule.init && typeof interactiveModule.init === 'function') {
            await interactiveModule.init(app);
        }
    }
}