import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			sand: {
  				'50': '#FDFCFA',
  				'100': '#F5F0E8',
  				'200': '#E8E2DA',
  				'300': '#D4CCC0',
  				DEFAULT: '#F5F0E8'
  			},
  			terracotta: {
  				DEFAULT: '#C4704A',
  				light: '#D4845E',
  				dark: '#A85A38',
  				hover: '#A85A38'
  			},
  			coal: {
  				DEFAULT: '#2D2A26',
  				light: '#6B6560',
  				muted: '#B8B2AA'
  			},
  			sea: '#3D8B8B',
  			success: '#4A8C5C',
  			warning: '#D4A04A',
  			error: '#C45C4A',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			heading: [
  				'var(--font-unbounded)',
  				'system-ui',
  				'sans-serif'
  			],
  			body: [
  				'var(--font-golos)',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			h1: [
  				'3rem',
  				{
  					lineHeight: '1.1',
  					fontWeight: '700'
  				}
  			],
  			h2: [
  				'2rem',
  				{
  					lineHeight: '1.2',
  					fontWeight: '600'
  				}
  			],
  			h3: [
  				'1.5rem',
  				{
  					lineHeight: '1.3',
  					fontWeight: '600'
  				}
  			],
  			'body-lg': [
  				'1.125rem',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			body: [
  				'1rem',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			small: [
  				'0.875rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			caption: [
  				'0.75rem',
  				{
  					lineHeight: '1.4',
  					fontWeight: '500'
  				}
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  			'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 300ms ease-out',
  			'slide-up': 'slideUp 300ms ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

