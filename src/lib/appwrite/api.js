import { ID, Query } from "appwrite";
import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { getMediaType } from "../utils";

// ************************************************ SIGN UP
export async function createUserAccount(user) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw new Error("Account creation failed");

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newAccount; //newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ****************************************** SAVE USER TO DB
export async function saveUserToDB(user) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ************************************* SIGN IN

export async function signInAccount(user) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ************************************* GET ACCOUNT
export async function getAccount() {
  try {
    const crntAcc = await account.get();

    return crntAcc;
  } catch (error) {
    console.log(error);
  }
}

// ************************************* GET CURRENT USER

export async function getcrntUsr() {
  try {
    // Get the current account information
    const crntAcc = await getAccount();

    // If no current account is found, throw an error
    if (!crntAcc) throw new Error("Account not found");

    // Fetch the user information from the database using the account ID
    const crntUsr = await databases.listDocuments(
      appwriteConfig.databaseId, // Database ID from your config
      appwriteConfig.userCollectionId, // Collection ID from your config
      [Query.equal("accountId", crntAcc.$id)] // Query to find documents with the matching account ID
    );

    // If no user documents are found, throw an error
    if (!crntUsr || crntUsr.documents.length === 0)
      throw new Error("User not found");

    // Return the first user document
    return crntUsr.documents[0];
  } catch (error) {
    // Log any errors to the console
    console.log(error);
    return null;
  }
}

//**************************************** SIGNOUT ACCOUNT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post) {
  try {
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw new Error("File upload failed");

    const fileType = getMediaType(post.file[0]);

    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl || fileType === "other") {
      await deleteFile(uploadedFile.$id);
      throw new Error("Invalid file type or URL");
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        mediaUrl: fileUrl,
        mediaId: uploadedFile.$id,
        location: post.location,
        tags: tags,
        mediaType: fileType,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Failed to create post");
    }

    // Trigger cloud function for video processing
    // if (fileType === "video") {
    //   console.log("Entering video processing section");

    //   const response = await fetch(`${import.meta.env.VITE_APPWRITE_URL}/functions/${import.meta.env.VITE_APPWRITE_VIDEOPROCESSOR_ID}/executions`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'X-Appwrite-Project': import.meta.env.VITE_APPWRITE_PROJECT_ID,
    //       'X-Appwrite-Key': import.meta.env.VITE_APPWRITE_API_KEY,
    //     },
    //     body: JSON.stringify({ fileId: uploadedFile.$id }),
    //   });

    //   console.log('Video processor response:', response);

    //   if (!response.ok) {
    //     throw new Error(`Failed to execute video processor: ${response.statusText}`);
    //   }

    //   const result = await response.json();
    //   console.log('Video processor result:', result);

    //   if (result && result.hlsUrls) {
    //     // Update post with HLS URL and thumbnail URL
    //     await updatePost({ ...newPost, mediaUrl: result.hlsUrls[0].url, thumbnailUrl: result.thumbnailUrl });
    //   }
    // }

    return newPost;
  } catch (error) {
    console.error(error);
  }
}

//******************************* GET THUMBNAIL
// function getThumbnail(fileId) {
//   console.log( `${import.meta.env.VITE_APPWRITE_URL}/storage/buckets/${import.meta.env.VITE_APPWRITE_STORAGE_ID}/files/${fileId}/view`);
//   return `${import.meta.env.VITE_APPWRITE_URL}/storage/buckets/${import.meta.env.VITE_APPWRITE_STORAGE_ID}/files/${fileId}/view`;
// }

// ============================== UPLOAD FILE
export async function uploadFile(file) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId) {
  try {
    const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);

    if (!fileUrl) throw new Error();

    return fileUrl;
  } catch (error) {
    console.error(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw new Error();

    return posts;
  } catch (error) {
    console.error(error);
  }
}

export async function getInfinitePosts({ pageParam }) {
  const queries = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw new Error();

    return posts;
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId) {
  if (!postId) throw new Error();

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw new Error();

    return post;
  } catch (error) {
    console.error(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let media = {
      mediaUrl: post.mediaUrl,
      mediaId: post.mediaId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error();

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error();
      }

      media = { ...media, mediaUrl: fileUrl, mediaId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        mediaType: post.mediaType,
        caption: post.caption,
        mediaUrl: media.mediaUrl,
        mediaId: media.mediaId,
        location: post.location,
        tags: tags,
        mediaType: post.mediaType,
        thumbnailUrl: post.thumbnailUrl,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(media.mediaId);
      }

      // If no new file uploaded, just throw error
      throw new Error();
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.mediaId);
    }

    return updatedPost;
  } catch (error) {
    console.error(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId, mediaId) {
  if (!postId || !mediaId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw new Error();

    await deleteFile(mediaId);

    return { status: "Ok" };
  } catch (error) {
    console.error(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId, likesArray) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw new Error();

    return updatedPost;
  } catch (error) {
    console.error(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId, postId) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw new Error();

    return updatedPost;
  } catch (error) {
    console.error(error);
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw new Error();

    return { status: "Ok" };
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw new Error();

    return post;
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET RECENT POSTS
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw new Error();

    return posts;
  } catch (error) {
    console.error(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit) {
  const queries = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw new Error();

    return users;
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw new Error();

    return user;
  } catch (error) {
    console.error(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to Appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error("File upload failed");

      // Get new file URL
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("File URL retrieval failed");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        royal: user.royal
        
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw new Error("User update failed");
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error(error);
  }
}
