import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

export const fontSans = GeistSans;

export const fontMono = GeistMono;

// Font files can be colocated inside of `pages`
export const fontHeading = localFont({
  src: "~/styles/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});
