import { Request, Response } from 'express';
export declare const getLessonsController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getLessonController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getLanguageLessonsController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getCourseLessonsController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const createLessonController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const updateLessonController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const getLessonWithContentsController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
