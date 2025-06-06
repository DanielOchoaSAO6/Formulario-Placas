
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#3AB570',
					foreground: '#ffffff',
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#3AB570',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'3xl': '24px',
				'4xl': '32px'
			},
			backdropBlur: {
				'xs': '2px',
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-down': 'slide-down 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-gentle': 'bounce-gentle 0.8s ease-out',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'float': 'float 6s ease-in-out infinite',
				'float-delayed': 'float 6s ease-in-out infinite 2s',
				'float-slow': 'float 8s ease-in-out infinite 1s',
				'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'shimmer': 'shimmer 2s linear infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
				'rubber-band': 'rubber-band 1s ease-in-out',
				'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(50px) scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-down': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'bounce-gentle': {
					'0%, 20%, 53%, 80%, 100%': {
						transform: 'translate3d(0,0,0) scale(1)'
					},
					'40%, 43%': {
						transform: 'translate3d(0, -12px, 0) scale(1.05)'
					},
					'70%': {
						transform: 'translate3d(0, -6px, 0) scale(1.02)'
					},
					'90%': {
						transform: 'translate3d(0, -2px, 0) scale(1.01)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.8) rotate(-3deg)'
					},
					'50%': {
						opacity: '0.5',
						transform: 'scale(1.05) rotate(1deg)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) rotate(0deg)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-10px) rotate(1deg)'
					},
					'66%': {
						transform: 'translateY(-5px) rotate(-1deg)'
					}
				},
				'pulse-gentle': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.02)'
					}
				},
				'glow': {
					'0%': {
						boxShadow: '0 0 20px rgba(58, 181, 112, 0.3)'
					},
					'100%': {
						boxShadow: '0 0 30px rgba(58, 181, 112, 0.6), 0 0 60px rgba(58, 181, 112, 0.3)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'wiggle': {
					'0%, 7%': {
						transform: 'rotateZ(0)'
					},
					'15%': {
						transform: 'rotateZ(-15deg)'
					},
					'20%': {
						transform: 'rotateZ(10deg)'
					},
					'25%': {
						transform: 'rotateZ(-10deg)'
					},
					'30%': {
						transform: 'rotateZ(6deg)'
					},
					'35%': {
						transform: 'rotateZ(-4deg)'
					},
					'40%, 100%': {
						transform: 'rotateZ(0)'
					}
				},
				'shake': {
					'10%, 90%': {
						transform: 'translate3d(-1px, 0, 0)'
					},
					'20%, 80%': {
						transform: 'translate3d(2px, 0, 0)'
					},
					'30%, 50%, 70%': {
						transform: 'translate3d(-4px, 0, 0)'
					},
					'40%, 60%': {
						transform: 'translate3d(4px, 0, 0)'
					}
				},
				'rubber-band': {
					'0%': {
						transform: 'scale3d(1, 1, 1)'
					},
					'30%': {
						transform: 'scale3d(1.25, 0.75, 1)'
					},
					'40%': {
						transform: 'scale3d(0.75, 1.25, 1)'
					},
					'50%': {
						transform: 'scale3d(1.15, 0.85, 1)'
					},
					'65%': {
						transform: 'scale3d(0.95, 1.05, 1)'
					},
					'75%': {
						transform: 'scale3d(1.05, 0.95, 1)'
					},
					'100%': {
						transform: 'scale3d(1, 1, 1)'
					}
				},
				'heartbeat': {
					'0%': {
						transform: 'scale(1)'
					},
					'14%': {
						transform: 'scale(1.1)'
					},
					'28%': {
						transform: 'scale(1)'
					},
					'42%': {
						transform: 'scale(1.1)'
					},
					'70%': {
						transform: 'scale(1)'
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
