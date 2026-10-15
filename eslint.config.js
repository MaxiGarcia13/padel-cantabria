import { eslintConfig } from '@maxigarcia/eslint-config';

export default eslintConfig({
  typescript: true,
  ignores: [
    'packages/web',
  ],
});
