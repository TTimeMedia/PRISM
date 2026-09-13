import { z } from 'zod';
import { MODULE_KEYS } from '@prism/types';

export const moduleKeySchema = z.enum(MODULE_KEYS);

export const moduleToggleSchema = z.object({
  module_key: moduleKeySchema,
  enabled: z.boolean(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

export type ModuleToggleInput = z.infer<typeof moduleToggleSchema>;
