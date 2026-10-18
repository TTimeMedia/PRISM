import { z } from 'zod';
import { prismErrorMap } from './common';

// Every schema speaks plainly when something needs fixing (see prismErrorMap).
z.setErrorMap(prismErrorMap);

export * from './common';
export * from './auth';
export * from './profile';
export * from './onboarding';
export * from './modules';
export * from './care';
export * from './journey';
export * from './legal-and-documents';
export * from './reminders-and-settings';
