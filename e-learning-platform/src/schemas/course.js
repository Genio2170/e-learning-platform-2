import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string()
    .min(5, { message: "Mínimo 5 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "Sólo caracteres alfanuméricos"
    }),
  description: z.string()
    .min(50, { message: "Mínimo 50 caracteres" }),
  category: z.enum(['web', 'design', 'business'], {
    errorMap: () => ({ message: "Categoría inválida" })
  }),
  lessons: z.array(
    z.object({
      title: z.string().min(3),
      duration: z.number().positive()
    })
  ).optional()
});
