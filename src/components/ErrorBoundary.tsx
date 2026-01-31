import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Render error captured by ErrorBoundary:', error, errorInfo);
    }
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign('/');
  };

  render() {
    const { error, errorInfo } = this.state;

    if (error) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-6 md:p-8 text-center shadow-card">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">حدث خطأ غير متوقع</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              حصلت مشكلة أثناء تحميل الصفحة. جرّب إعادة التحميل أو الرجوع للصفحة الرئيسية.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button onClick={this.handleReload}>إعادة تحميل الصفحة</Button>
              <Button variant="outline" onClick={this.handleGoHome}>الذهاب للرئيسية</Button>
            </div>
            {import.meta.env.DEV && (
              <details className="text-left rounded-lg border border-border bg-muted/40 p-4">
                <summary className="cursor-pointer text-sm font-medium">تفاصيل تقنية</summary>
                <pre className="mt-3 text-xs whitespace-pre-wrap text-muted-foreground">
                  {error.stack}
                  {errorInfo?.componentStack ? `\n${errorInfo.componentStack}` : ''}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
