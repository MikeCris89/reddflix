import { Link } from "react-router-dom";

const NoMatch = () => {
	return (
		<div>
			<h1>Nothing to see here.</h1>
			<br />
			<br />
			<Link to="/">Go back to Homepage</Link>
		</div>
	);
};

export default NoMatch;
