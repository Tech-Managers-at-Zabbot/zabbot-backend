

export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}




export type GoogleStrategyOptions = {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
};
