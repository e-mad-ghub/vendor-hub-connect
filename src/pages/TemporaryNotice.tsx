import React from "react";
import { Footer } from "@/components/Footer";

const TemporaryNotice = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center px-6">
        <h1 className="text-center text-2xl md:text-4xl font-semibold text-foreground">
          هنرجع تاني، استنّونا
        </h1>
      </main>
      <Footer />
    </div>
  );
};

export default TemporaryNotice;
