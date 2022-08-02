import Head from "next/head";
import {LoginButton} from "@/components/LoginButton";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>ECSS Verify</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">

        <LoginButton style={'discord'}/>
        <LoginButton style={'microsoft'}/>

      </main>
    </div>
  );
}