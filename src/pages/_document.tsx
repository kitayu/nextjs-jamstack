import { Html, Head, Main, NextScript } from 'next/document'

const Index = () => {
  return (
    <Html>
      <Head>
        <link
          href={
            'https://fonts.googleapis.com/css2?family=noto+Sans+JP:wght@400;500;700&display=swap'
          }
          rel="stylesheet"
        ></link>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};
export default Index;