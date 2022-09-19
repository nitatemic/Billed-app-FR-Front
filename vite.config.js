import {defineConfig} from'vite'
import mkcert from'vite-plugin-mkcert'

export default defineConfig({
	server: {
		port: 8080,
		hot: true,
		https : true
	},
	plugins: [mkcert()],
});
