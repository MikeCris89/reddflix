/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import QueryErrorMessage from "./QueryErrorMessage";

describe("QueryErrorMessage", () => {
	it("renders generic error message for unhandled app errors - panel", () => {
		render(
			<QueryErrorMessage
				error={{ status: 500, data: { message: "x" } } as any}
			/>,
		);

		expect(
			screen.getByText("Error occurred. Please try again later."),
		).toBeInTheDocument();
		expect(screen.queryByText(/Retrying in \d+s/)).not.toBeInTheDocument();
		expect(
			screen.queryByText(/Temporary ban from Reddit · \d+m left/),
		).not.toBeInTheDocument();
	});
	it("renders generic error message for unhandled app errors - inline", () => {
		render(
			<QueryErrorMessage
				error={{ status: 500, data: { message: "x" } } as any}
				variant="inline"
			/>,
		);

		expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
		expect(screen.queryByText(/Retrying in \d+s/)).not.toBeInTheDocument();
		expect(screen.queryByText(/Temp ban · \d+m left/)).not.toBeInTheDocument();
	});

	it("renders rate limit countdown for handled 429 error - panel", () => {
		render(
			<QueryErrorMessage
				error={
					{
						status: 429,
						data: {
							message: "x",
							reason: "rateLimit",
							pendingTimestamp: Date.now() + 15_000,
							isAppHandledError: true,
						},
					} as any
				}
			/>,
		);

		expect(screen.getByText(/Retrying in \d+s/)).toBeInTheDocument();
		expect(
			screen.queryByText("Error occurred. Please try again later."),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText(/Temporary ban from Reddit · \d+m left/),
		).not.toBeInTheDocument();
	});

	it("renders rate limit countdown for handled 429 error - inline", () => {
		render(
			<QueryErrorMessage
				error={
					{
						status: 429,
						data: {
							message: "x",
							reason: "rateLimit",
							pendingTimestamp: Date.now() + 15_000,
							isAppHandledError: true,
						},
					} as any
				}
				variant="inline"
			/>,
		);

		expect(screen.getByText(/Retrying in \d+s/)).toBeInTheDocument();
		expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument();
		expect(screen.queryByText(/Temp ban · \d+m left/)).not.toBeInTheDocument();
	});

	it("renders ban message for handled 403 error - panel", () => {
		render(
			<QueryErrorMessage
				error={
					{
						status: 403,
						data: {
							message: "x",
							reason: "ban",
							pendingTimestamp: Date.now() + 5 * 60_000,
							isAppHandledError: true,
						},
					} as any
				}
			/>,
		);

		expect(
			screen.getByText(/Temporary ban from Reddit · \d+m left/),
		).toBeInTheDocument();
		expect(
			screen.queryByText("Error occurred. Please try again later."),
		).not.toBeInTheDocument();
		expect(screen.queryByText(/Retrying in \d+s/)).not.toBeInTheDocument();
	});

	it("renders ban message for handled 403 error - inline", () => {
		render(
			<QueryErrorMessage
				error={
					{
						status: 403,
						data: {
							message: "x",
							reason: "ban",
							pendingTimestamp: Date.now() + 5 * 60_000,
							isAppHandledError: true,
						},
					} as any
				}
				variant="inline"
			/>,
		);

		expect(screen.getByText(/Temp ban · \d+m left/)).toBeInTheDocument();
		expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument();
		expect(screen.queryByText(/Retrying in \d+s/)).not.toBeInTheDocument();
	});
});
