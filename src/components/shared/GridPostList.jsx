import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import VideoPlayer from "./VideoPlayer";

const GridPostList = ({ posts, showUser = true, showStats = true }) => {
  const { user } = useUserContext();

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li key={post.$id} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.$id}`} className="grid-post_link">
           {post.mediaType==='image'? <img
              src={post.mediaUrl}
              alt="post"
              className="h-full w-full object-cover"
            />
            : <VideoPlayer url={post.mediaUrl} hide={true} className="h-full w-full object-cover"/>
          }
          </Link>

          <div className="grid-post_user">
            {showUser && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={
                    post.creator.imageUrl ||
                    "/icons/profile-placeholder.svg" // Updated asset path
                  }
                  alt="creator"
                  className="w-8 h-8 rounded-full"
                />
                <p className="line-clamp-1">{post.creator.name}</p>
              </div>
            )}
            {showStats && <PostStats post={post} userId={user.id} />}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;
