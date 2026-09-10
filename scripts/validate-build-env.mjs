import { production, validateProductionIdentifiers, validateSourceRevision } from './association-config.mjs';

validateProductionIdentifiers();
validateSourceRevision();
console.log(`Validated ${production ? 'production' : 'development'} build identifiers.`);
