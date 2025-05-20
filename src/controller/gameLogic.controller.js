import asyncHandler from "../utils/asyncHandler.js";
import userStatusModel from "../models/userStatus.model.js";

function isCellCorrect(cellId, character) {
  // Define arrays of valid cell IDs for each character
  const correctCells = {
    WALDO: [133, 153],   
    WIZARD: [126],
    ODLAW: [123],
    WENDA: [136,156],
  };

  const validCells = correctCells[character];

  // Safety check for unknown characters
  if (!validCells) return false;

  // Check if the clicked cell is one of the valid cells
  return validCells.includes(cellId);
}



const isCharacterFound = asyncHandler(
    async(req, res) => {
        const { cellId, character, timeTaken } = req.body;
        try {
            const user = req.user;
            console.log(req.body);
            
            if(!user){
                res.status(500).json({ message : "User not valid"})
            }
            
            let userStatus = await userStatusModel.findOne({ user : user._id });

            if(!userStatus){
                userStatus = new userStatusModel({ 
                user: user._id, 
                charactersFound: [], 
                timeOfCompletion : 0,
                isOver : false});
            }

            const isCorrect = isCellCorrect(cellId, character)
            const IsCharInside = userStatus.charactersFound.includes(character);


            
            
            if(userStatus.charactersFound.length >= 4){
                userStatus.isOver = true;
                userStatus.timeOfCompletion = timeTaken;
            } else if(isCorrect && !IsCharInside) {
                userStatus.charactersFound.push(character);
                if(userStatus.charactersFound.length === 4){
                    userStatus.isOver = true;
                }
            }
            
            userStatus.timeOfCompletion = timeTaken;

            await userStatus.save();

            res.status(200).json({ 
            correct :  isCorrect, 
            character : character,
            charactersFound : userStatus.charactersFound, 
            isOver : userStatus.isOver,  });
        } catch (error) {
            res.status(500).json({ error : "Internal server error", message : error});
        }
    }
)


const restartGame = asyncHandler(async(req, res) => {
    try {
        const user = req.user;
        if(!user){
            res.status(500).json({ message : "User not valid"})
        }
    
        let userStatus = await userStatusModel.findOne({ user : user._id });

        userStatus.isOver = false;
        userStatus.charactersFound = [];
        userStatus.prevScore = userStatus.timeOfCompletion;
        userStatus.timeOfCompletion = 0;
       
    
        await userStatus.save();

        res.status(200).json({ message : "userStatus updated to restart the game", prevScore : prevScore })
    } catch (error) {
        res.status(500).json({ error : "Error occured while restarting game", message : error})
    }
})

const provideCharArr = asyncHandler(async(req, res) => {
    try {
        const user = req.user;
        const userStatus = await userStatusModel.findOne({ user: user._id })

        let charArr;

        if (userStatus) {
            charArr = userStatus;
        } else {
            // If userStatus is null, provide default values
            charArr = { charactersFound: [], timeOfCompletion: 0 };
        }

        res.status(200).json({ charArr : charArr.charactersFound, time : charArr.timeOfCompletion});
    } catch (error) {
        res.status(500).json({ error : "Can not Fetch charArr" });
    }
})


export { isCharacterFound, restartGame, provideCharArr }