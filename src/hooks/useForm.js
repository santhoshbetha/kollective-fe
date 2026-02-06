import { useState } from 'react';

export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return { values, handleChange, handleSubmit };
};
