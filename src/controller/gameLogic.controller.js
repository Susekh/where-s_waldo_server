import asyncHandler from "../utils/asyncHandler.js";
import userStatusModel from "../models/userStatus.model.js";

function isPointInsideCircularDiv( divTop, divLeft, radius, character) {
    let pointX;
    let pointY;
    //check character
    switch(character){
        case "WALDO" :
            pointX = 900;
            pointY = 350;
            break
        case "WIZARD" : 
            pointX = 395;
            pointY = 330;
            break
        case "ODLAW" :
            pointX = 158;
            pointY = 333;
            break
        case "WENDA" :
            pointX = 1124;
            pointY = 380;
            break
    }
    // Calculate the center of the circular div
    
    const centerX = divLeft + radius / 2;
    const centerY = divTop + radius / 2;

    // Calculate the distance between the point and the center of the circular div
    const distance = Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));

    // Check if the distance is less than or equal to the radius of the circular div
    return distance <= radius / 2;
  }


const isCharacterFound = asyncHandler(
    async(req, res) => {
        const { divTop, divLeft, radius, character, timeTaken } = req.body;
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

            const isCorrect = isPointInsideCircularDiv(divTop, divLeft, radius, character)
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