import { Request, Response } from 'express';

export const getLessons = async (req: Request, res: Response) => { res.send('List of lessons'); }
export const getLesson = async (req: Request, res: Response) => { res.send('Get a lesson'); }
export const createLesson = async (req: Request, res: Response) => { res.send('Create a new lesson'); }
export const updateLesson = async (req: Request, res: Response) => { res.send('Update an existing lesson'); }

export default {
  getLessons,
  getLesson,
  createLesson,
  updateLesson
}