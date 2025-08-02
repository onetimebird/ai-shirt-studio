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
				'inter': ['Inter', 'sans-serif'],
				'roboto': ['Roboto', 'sans-serif'],
				'open-sans': ['Open Sans', 'sans-serif'],
				'lato': ['Lato', 'sans-serif'],
				'montserrat': ['Montserrat', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
				'oswald': ['Oswald', 'sans-serif'],
				'bebas': ['Bebas Neue', 'cursive'],
				'lobster': ['Lobster', 'cursive'],
				'dancing': ['Dancing Script', 'cursive'],
				'pacifico': ['Pacifico', 'cursive'],
				'righteous': ['Righteous', 'cursive'],
				'bangers': ['Bangers', 'cursive'],
				'creepster': ['Creepster', 'cursive'],
				'fredoka': ['Fredoka One', 'cursive'],
				'marker': ['Permanent Marker', 'cursive'],
				'satisfy': ['Satisfy', 'cursive'],
				'abril': ['Abril Fatface', 'cursive'],
				'anton': ['Anton', 'sans-serif'],
				'comfortaa': ['Comfortaa', 'cursive'],
				'nunito': ['Nunito', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
				'source': ['Source Sans Pro', 'sans-serif'],
				'ubuntu': ['Ubuntu', 'sans-serif'],
				'raleway': ['Raleway', 'sans-serif'],
				'merriweather': ['Merriweather', 'serif'],
				'pt-sans': ['PT Sans', 'sans-serif'],
				'crimson': ['Crimson Text', 'serif'],
				'josefin': ['Josefin Sans', 'sans-serif'],
				'quicksand': ['Quicksand', 'sans-serif'],
				'fjalla': ['Fjalla One', 'sans-serif'],
				'russo': ['Russo One', 'sans-serif'],
				'acme': ['Acme', 'sans-serif'],
				'passion': ['Passion One', 'cursive'],
				'bungee': ['Bungee', 'cursive']
			},
			flex: {
				'2': '2 2 0%'
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
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
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-shimmer': 'var(--gradient-shimmer)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-aurora': 'var(--gradient-aurora)',
				'gradient-premium': 'var(--gradient-premium)',
				'gradient-sidebar': 'var(--gradient-sidebar)'
			},
			boxShadow: {
				'creative': 'var(--shadow-creative)',
				'glow': 'var(--shadow-glow)',
				'soft': 'var(--shadow-soft)',
				'elevated': 'var(--shadow-elevated)',
				'glass': 'var(--shadow-glass)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
