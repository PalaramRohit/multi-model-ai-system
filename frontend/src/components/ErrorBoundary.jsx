import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Map Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-900 rounded-2xl border border-red-500/30">
                    <div className="text-center text-red-400">
                        <p className="font-bold">Map failed to load.</p>
                        <p className="text-sm opacity-70">Please refresh the page.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
