import { dispatch } from "../../app/store";
import { localAppApi } from "./localAppApi";

export const setPendingCache = async (args: number[]) => {
	dispatch(localAppApi.endpoints.setPendingArray.initiate(args));
};
