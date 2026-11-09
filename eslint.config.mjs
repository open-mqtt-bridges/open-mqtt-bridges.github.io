import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-config-prettier';

export default withNuxt(
  {
    ignores: ['.agents/**', '.specify/**', '.output/**', 'node_modules/**', 'public/**', 'assets/**'],
  },
  prettier,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'UNIQUE',
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'GLOBAL',
            'ATTR_STATIC',
            'ATTR_DYNAMIC',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
