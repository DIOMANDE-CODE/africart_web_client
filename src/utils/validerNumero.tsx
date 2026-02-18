export const validationNumeroCI = (numero: string) => {
  const regex = /^(?:\+225|00225|225)?\s?(01|05|07|25|27)\d{8}$/;
  return regex.test(numero.trim());
};
