import asyncHandler from "../utils/asyncHandler.js";
import userStatusModel from "../models/userStatus.model.js";

function isPointInsideCircularDiv( divTop, divLeft, radius, character) {
    let pointX;
    let pointY;
    //check character
    switch(character){
        case "waldo" : 
            pointX = 900;
            pointY = 350;
            break
        case "wizard" : 
            pointX = 395;
            pointY = 330;
            break
        case "odlaw" :
            pointX = 158;
            pointY = 333;
            break
        case "wenda" :
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
        const { divTop, divLeft, radius, character } = req.body;
        try {
            const user = req.user;
            console.log(" USER : ", user);
            const userStatus = await userStatusModel.findOne({ user : user._id });

            if(!userStatus){
                return res.status(404).json({ error : "user not valid" });
            }

            const isCorrect = isPointInsideCircularDiv(divTop, divLeft, radius, character)

            if(userStatus.charactersFound.length >= 4){
                userStatus.isOver = true;
            } else if(isCorrect) {
                userStatus.charactersFound.push(character);
            }
            await userStatus.save();

            res.json({ correct :  isCorrect, charactersFound : userStatus.charactersFound, isOver : userStatus.isOver });
        } catch (error) {
            console.error("Error occured while verifying character : ", error);
            res.status(500).json({ error : "Internal server error"});
        }
    }
)



export { isCharacterFound }