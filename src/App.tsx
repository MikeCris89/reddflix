import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function App() {
	return (
		<div className="h-full w-full flex flex-col justify-between overflow-hidden">
			<Home />
			<Navbar />
		</div>
	);
}

export default App;
