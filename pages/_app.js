// pages/_app.js
import '../styles/globals.css'; // This line imports your global Tailwind CSS

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;