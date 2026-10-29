import { fileURLToPath } from 'node:url';
import { eslintConfig } from '@maxigarcia/eslint-config';

const cssConfig = fileURLToPath(
  new URL('./chat/src/styles.css', import.meta.url),
);

export default eslintConfig(
  {
    typescript: true,
    vue: true,
    tailwindcss: true,
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,vue}'],
    settings: {
      tailwindcss: {
        cssConfigPath: cssConfig,
      },
    },
    rules: {
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: ['typeset', 'typeset-chat'],
        },
      ],
    },
  },
);
