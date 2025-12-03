import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  // O cast (process as any) evita erros de tipagem no ambiente Node do build
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Garante compatibilidade para códigos que usam process.env
      'process.env': env
    },
    build: {
      // Aumenta o limite de aviso de tamanho de chunk para evitar alertas no deploy da Vercel
      chunkSizeWarningLimit: 2000,
    }
  };
});