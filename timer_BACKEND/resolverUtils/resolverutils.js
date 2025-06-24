import Timer from "../models/Timer.js";
import StudySession from "../models/StudySession.js";
import User from "../models/User.js";
import Break from "../models/Break.js";
import { BasePost } from "../models/BasePost.js";
import Comment from "../models/Comment.js";


//This creates a Timer obj 
export const createTimer = async (duration, startTimeIsoString, parentType, parentId, session) => {
    try {
      const timer = new Timer({
        totalTime: duration,
        timeLeft: duration,
        startTime: new Date(startTimeIsoString),
        parentType: parentType,
        parentId: parentId
    });
      
    return timer 
    } catch (error) {
      console.error("Error creating timer:", error);
      throw new Error("Failed to create timer");
    }
};


export const deleteStudySessionByIdUtil= async (studySessionID, userId) =>{
  const studySession = await StudySession.findById(studySessionID);
  if (!studySession) {
      throw new Error('No study session found');
  }

  if (!studySession.user.equals(userId)) {
      throw new Error('You can only delete your own study sessions');
  }

  //delete all things related to the study session
  try{
      //delete the timer associated with the study session
      if (studySession.timer) {
          await deleteTimerById(studySession.timer);
      }
      
      //remove the study session from the user's allPosts array
      await User.findByIdAndUpdate(
          userId,
          { $pull: { studySessions: studySession._id } }
      );

      await StudySession.findByIdAndDelete(studySessionID);

      return studySession;
  } catch (error) {
      console.error("Error deleting study session:", error);
      throw new Error("Failed to delete study session");
  }
}

export const deleteTimerById = async (timerID) => {
  const timer = await Timer.findById(timerID);
  if (!timer) {
      throw new Error('No timer found');
  }
  try {
      const timerBreaks = timer.log;
      if (timerBreaks && timerBreaks.length > 0) {
          // Delete all breaks associated with the timer
          await Break.deleteMany({ _id: { $in: timerBreaks } });
      }

      if (timer.currentBreak) {
          // Delete the current break if it exists
          await Break.findByIdAndDelete(timer.currentBreak);
      }

      await Timer.findByIdAndDelete(timerID);
      return timer;
  } catch (error) {
      console.error("Error deleting timer:", error);
      throw new Error("Failed to delete timer");
  }
}

export const deletePostByIdUtil = async (postId, userId) => {

    const post = await BasePost.findById(postId);
    if (!post) {
        throw new Error('No post found');
    }

    if (!post.user.equals(userId)) {
        throw new Error('You can only delete your own posts');
    }

    //delete all things related to the post 
    try{
        const comments = await Comment.find({ post: post._id });
        const commentIds = comments.map(comment => comment._id);

        if (commentIds.length > 0){
            await User.updateMany(
                {comments: {$in: commentIds}},
                {$pull: {comments: {$in: commentIds}}}
            )

            await Comment.deleteMany({ post: post._id });
        }

        await User.updateMany(
            { likedPosts: post._id },
            { $pull: { likedPosts: post._id } }
        )

        await User.findByIdAndUpdate(
            userId,
            { $pull: { allPosts: post._id} }
        );

        if (post.postType === 'StudySessionPost') {
            // Delete the entire study session and all related data
            await deleteStudySessionByIdUtil(post.studySession, userId);
        }
        
        await BasePost.findByIdAndDelete(postId);
        return post;
    } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Failed to delete post");
    }
}
