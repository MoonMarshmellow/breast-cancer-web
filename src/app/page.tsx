import Image from "next/image";
import Signup from '../components/signup';
import Account from "@/components/account";
import { useEffect } from "react";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col justify-center h-screen w-full items-center">
        <h1 className="font-bold text-5xl text-primary mb-2">BioML</h1>
        <p className="mb-4">Deep Learning Tool for Biopsy Classification</p>
        <Account/>
      </div>
    </main>
  );
}
