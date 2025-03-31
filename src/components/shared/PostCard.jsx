import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import VideoPlayer from "./VideoPlayer";


const PostCard = ({ post }) => {
  const { user } = useUserContext();

  if (!post.creator) return null;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                post.creator?.imageUrl ||
                "/icons/profile-placeholder.svg" // Updated asset path
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}{post.creator.royal ? '👑' : ''}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== post.creator.$id && "hidden"}`}>
          <img
            src={"/icons/edit.svg"} // Updated asset path
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags.map((tag, index) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
        {
          post.mediaType === "image" ?

          (<img
            src={ post.mediaUrl  || "/icons/profile-placeholder.svg"} // Updated asset path
            alt="post image"
            className="post-card_img"
          />)

          :
          (<div onClick={(e)=> e.preventDefault()} className="rounded-3xl mb-5 border border-gray-800 ">
            <VideoPlayer url={ post.mediaUrl } hide={false}/>
          </div>)
        }
      </Link>

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
