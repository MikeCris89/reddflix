import { Link } from "react-router-dom";

const NoMatch = () => {
	return (
		<div className="flex flex-col gap-5 items-center justify-center">
			<p className="text-[62px]">404</p>
			<h1 className="text-3xl">Nothing to see here</h1>
			<br />
			<br />
			<Link to="/">Go back to Homepage</Link>
		</div>
	);
};

export default NoMatch;
