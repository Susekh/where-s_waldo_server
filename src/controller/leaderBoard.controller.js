import asyncHandler from "../utils/asyncHandler.js";
import userStatusModel from "../models/userStatus.model.js";


const leaderboardController = asyncHandler(
    async (req, res) => {
        try {
          // Finding users whose isOver field is true and sort them by their timeOfCompletion
          const leaderboard = await userStatusModel.find({ isOver: true })
                                             .sort({ timeOfCompletion: 1 })
                                             .populate('user', 'username'); 
      
          // Prepare the response data
          const leaderboardData = leaderboard.map((userStatus, index) => ({
                key : index + 1,
                username: userStatus.user.username,
                timeOfCompletion: userStatus.timeOfCompletion
            }));
      
          res.status(200).json(leaderboardData);
        } catch (error) {
          res.status(500).json({ error: 'Error retrieving leaderboard', message : error.message });
        }
      }
)
  
  export default leaderboardController;