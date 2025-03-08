import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="ss05">
      <Component {...pageProps} />
    </div>
  );
};
