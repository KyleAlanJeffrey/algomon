import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppType } from "next/app";
import { Ubuntu } from "next/font/google";
import "~/styles/globals.css";

const queryClient = new QueryClient();
// If loading a variable font, you don't need to specify the font weight
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: '400',
})
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={ubuntu.className}>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
};

export default MyApp;
