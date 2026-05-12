import typography from "@tailwindcss/typography";
import lineclamp from "@tailwindcss/line-clamp";
/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [typography, lineclamp],
};
