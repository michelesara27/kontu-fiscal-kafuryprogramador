 // src/components/TestForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema } from '../utils/validation';

export const TestForm = () => {
  const { register, handleSubmit, formState, watch } = useForm({
    resolver: zodResolver(companySchema),
    mode: 'onChange'
  });

  const formValues = watch();

  return (
    <div style={{ padding: '20px', border: '1px solid red' }}>
      <h3>TEST FORM - Debug</h3>
      
      <form>
        <div>
          <label>Name:</label>
          <input {...register('name')} />
          {formState.errors.name && <span style={{color: 'red'}}>{formState.errors.name.message}</span>}
        </div>

        <div>
          <label>Email:</label>
          <input {...register('email')} />
          {formState.errors.email && <span style={{color: 'red'}}>{formState.errors.email.message}</span>}
        </div>

        <div>
          <label>Phone (apenas números):</label>
          <input {...register('phone')} />
          {formState.errors.phone && <span style={{color: 'red'}}>{formState.errors.phone.message}</span>}
        </div>

        <div>
          <label>CNPJ (apenas números):</label>
          <input {...register('cnpj')} />
          {formState.errors.cnpj && <span style={{color: 'red'}}>{formState.errors.cnpj.message}</span>}
        </div>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h4>Current Values:</h4>
        <pre>{JSON.stringify(formValues, null, 2)}</pre>
        
        <h4>Validation:</h4>
        <p>isValid: {formState.isValid ? 'TRUE' : 'FALSE'}</p>
        <p>Errors: {JSON.stringify(formState.errors)}</p>
      </div>
    </div>
  );
};