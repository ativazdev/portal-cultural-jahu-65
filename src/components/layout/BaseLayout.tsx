import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

export const BaseLayout = ({ children, className }: BaseLayoutProps) => {
  return (
    <div className={cn("min-h-screen w-full bg-background", className)}>
      {children}
    </div>
  );
};

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export const Container = ({ 
  children, 
  className, 
  maxWidth = "full" 
}: ContainerProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  return (
    <div className={cn(
      "w-full mx-auto px-4 sm:px-6 lg:px-8",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  children, 
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {children && (
            <div className="flex items-center space-x-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export const PageContent = ({ children, className }: PageContentProps) => {
  return (
    <div className={cn("flex-1 space-y-4 p-4 sm:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
};
