import { Request, Response } from 'express';
declare const _default: {
    getUserDailyGoals: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    completeDailyGoalController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getUserCompletedGoalsCount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
export default _default;
