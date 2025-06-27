import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema } from '../schemas';

export default function CourseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(courseSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/v1/teacher/courses', {
        method: 'POST',
        headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(await res.text());

      // Atualização otimista do cache
      queryClient.invalidateQueries('teacher-courses');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
<form onSubmit={handleSubmit(onSubmit)}>
<input 
        {...register('title')}
        aria-invalid={!!errors.title}
      />
      {errors.title && (
<span role="alert">{errors.title.message}</span>
      )}

<button 
        type="submit"
        disabled={isSubmitting}
>
        Criar Curso
</button>
</form>
  );
}
