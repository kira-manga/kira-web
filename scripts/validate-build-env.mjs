import { production, validateProductionIdentifiers } from './association-config.mjs';

validateProductionIdentifiers();
console.log(`Validated ${production ? 'production' : 'development'} build identifiers.`);
