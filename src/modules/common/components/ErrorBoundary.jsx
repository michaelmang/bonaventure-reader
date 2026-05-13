import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="reader-error">
          <h1>Something went wrong.</h1>
          <p>{this.state.error.message}</p>
        </main>
      );
    }

    return this.props.children;
  }
}
