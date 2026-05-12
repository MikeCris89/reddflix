import { Component, ErrorInfo, ReactNode } from "react";
import { getErrorMessage } from "../utils/helpers";

interface Props {
	fallback?: ReactNode;
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("ErrorBoundary caught:", getErrorMessage(error));
		console.error("Component stack:", errorInfo.componentStack);
	}

	resetError = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<p>
						Oops! Something went wrong. Please{" "}
						<button onClick={this.resetError}>refresh</button> page.
					</p>
				)
			);
		}
		return this.props.children;
	}
}
