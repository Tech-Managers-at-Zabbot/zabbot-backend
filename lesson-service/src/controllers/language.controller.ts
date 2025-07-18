import {Request, Response} from 'express';

export const getLanguages = async (req: Request, res: Response) => { res.send('List of languages'); }
export const getLanguage = async (req: Request, res: Response) => { res.send('Get a language'); }
export const createLanguage = async (req: Request, res: Response) => { res.send('Create a new language'); }
export const updateLanguage = async (req: Request, res: Response) => { res.send('Update an existing language'); }

export default {
  getLanguages,
  getLanguage,
  createLanguage,
  updateLanguage
}