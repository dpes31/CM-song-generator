import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full glass-panel rounded-3xl p-8 text-center"
                    >
                        <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">예기치 않은 시스템 오류</h1>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                            화면을 렌더링하는 중 문제가 발생했습니다. 브라우저를 새로고침하거나 잠시 후 다시 시도해주세요.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 w-full bg-white text-black font-semibold rounded-2xl py-4 hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            새로고침
                        </button>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
