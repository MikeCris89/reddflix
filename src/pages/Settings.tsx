import DevResetBtn from "../utils/DevResetBtn";

const Settings = () => {
	return (
		<div className="h-full w-full flex flex-col justify-start items-center">
			<h1>Settings</h1>
			{import.meta.env.DEV && <DevResetBtn />}
		</div>
	);
};

export default Settings;
