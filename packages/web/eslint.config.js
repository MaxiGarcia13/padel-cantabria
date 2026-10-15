import { eslintConfig } from '@maxigarcia/eslint-config';

export default eslintConfig(
  {
  typescript: true,
  astro: true,
  vue: true,
  tailwindcss: true,
}, 
{
  settings: {
    tailwindcss: {
      config: 'packages/web/src/styles/global.css',
    },
  },
},
);
