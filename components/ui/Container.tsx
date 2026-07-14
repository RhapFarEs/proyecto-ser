import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-16">
      {children}
    </div>
  );
}