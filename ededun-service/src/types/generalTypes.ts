export interface ResponseDetails {
    message: string;
    statusCode: number;
    data?: any
    details?: any
    info?: any
}

export class QueryParameters {
    title?: string;
    publishedYear?: number;
    movieProducer?: string;
  }


 export interface CloudinaryResource {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    resource_type: string;
    created_at: string;
  }
  
 export interface CloudinaryResponse {
    resources: CloudinaryResource[];
    next_cursor?: string;
    rate_limit_allowed?: number;
    rate_limit_remaining?: number;
    rate_limit_reset_at?: string;
  }