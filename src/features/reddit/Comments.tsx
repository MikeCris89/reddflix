import { useParams } from "react-router-dom";
import { useFetchPostAndCommentsQuery } from "./redditApi";

const Comments = () => {
	const { postId } = useParams();
	const {
		data: comments,
		isLoading,
		error,
	} = useFetchPostAndCommentsQuery(postId, {
		selectFromResult: ({ data, isLoading, error }) => ({
			data: data?.comments,
			isLoading,
			error,
		}),
	});

	if (error) {
		const errMsg =
			"status" in error
				? typeof error.data === "string"
					? error.data
					: JSON.stringify(error.data)
				: error.message || "Unknown error";

		return <p>Error: {errMsg}</p>;
	}
	if (isLoading) return <p>Loading...</p>;
	console.log(comments);

	return (
		<>
			{comments &&
				comments.map((comment) => {
					return <div key={comment.id}>{comment.body}</div>;
				})}
		</>
	);
};

export default Comments;
