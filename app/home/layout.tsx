import React from "react";
import Navbar from "../components/Navbar";
import { hasAuth } from "../utlis/runtime";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar authEnabled={hasAuth} />
      <main className="w-full max-w-7xl mx-auto sm:px-6 lg:px-8 ">
        {children}
      </main>
    </>
  );
};

export default HomeLayout;
