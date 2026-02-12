import { AppError } from './AppError.js';

export function handleHttpError(res, error) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
}
