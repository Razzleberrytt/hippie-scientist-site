import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(_) {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('Uncaught error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return _jsx("h1", { children: "Something went wrong." });
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
