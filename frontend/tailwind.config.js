/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
			},
			colors: {
				rail: {
					dark: '#0B1E3D',
					primary: '#1E40AF',
					accent: '#3B82F6',
					surface: '#0F172A',
					card: '#1E293B',
					border: '#334155',
				},
			},
		},
	},
	plugins: [],
};
