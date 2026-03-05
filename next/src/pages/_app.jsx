import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>BBC News Archive</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
