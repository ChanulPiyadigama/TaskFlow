import Timer from "./models/Timer.js";



//This creates a Timer obj 
const createTimer = async (duration, startTimeIsoString, parentType, parentId, session) => {
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

export {createTimer}