// components/Layout.js
import Head from 'next/head';

const Layout = ({ children, title = 'MemoryDeck - Certificate Management' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        {/* Inter font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      {/* Apply base background and font to the entire app */}
      <div className="min-h-screen bg-gray-50 font-inter text-gray-800 antialiased">
        {/* Main content area, centered and with max width */}
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
