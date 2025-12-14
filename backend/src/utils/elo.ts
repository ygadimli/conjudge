
export const calculateElo = (
    currentRating: number,
    opponentRating: number,
    actualScore: number, // 1 for win, 0.5 for draw, 0 for loss
): number => {
    // Dynamic K-factor logic similar to Chess.com
    let kFactor = 32;
    if (currentRating > 2400) kFactor = 10;
    else if (currentRating > 2100) kFactor = 24;

    // Calculate expected score
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));

    // Calculate new rating
    const newRating = Math.round(currentRating + kFactor * (actualScore - expectedScore));

    return newRating;
};

export const generateJoinCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getTargetProblemRating = (userRating: number): number => {
    // User wants: "if user 1200 rating, max 1400 rating questions"
    // So target roughly UserRating + 100 on average (making it slightly challenging)
    const target = userRating + 100;
    // Cap minimum at 800
    return Math.max(800, target);
};
