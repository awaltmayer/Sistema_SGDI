import * as React from "react";
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from "@/componentes/ui/botao-ui";
import { cn } from "@/lib/utilitarios";
import "./botao.css";

export type PropsBotao = ShadcnButtonProps;
export type ButtonProps = PropsBotao;

const Button = React.forwardRef<HTMLButtonElement, PropsBotao>(
  ({ className, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        className={cn("sgdi-botao-base", className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
export const Botao = Button;
