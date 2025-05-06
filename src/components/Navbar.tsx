import { useNavigate } from "react-router-dom";

const Navbar = () => {
	const navigate = useNavigate();
	return (
		<nav className="border">
			<button onClick={() => navigate("/")}>Home</button>
			<button onClick={() => navigate("/settings")}>Settings</button>
		</nav>
	);
};

export default Navbar;
