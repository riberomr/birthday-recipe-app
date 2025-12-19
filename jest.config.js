const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFiles: ['<rootDir>/jest.setup.console.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    testEnvironmentOptions: {
        customExportConditions: [''],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    globals: {
        'process.env.NODE_ENV': 'test',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        'hooks/**/*.{js,jsx,ts,tsx}',
        'features/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/types/**',
        '!next.config.js',
        '!tailwind.config.ts',
        '!postcss.config.js',
        '!jest.config.js',
        '!jest.setup.ts',
        '!coverage/**',
        '!lib/firebase/admin.ts',
        '!lib/firebase/client.ts',
        '!lib/supabase/admin.ts',
        '!lib/supabase/client.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
