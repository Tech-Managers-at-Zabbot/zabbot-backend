"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const processEmailsInBackground = async (emailPayload) => {
    try {
        // Send email notification
        await axios_1.default.post(`${emailPayload.url}`, emailPayload.emailData);
        console.log(`✅ Email sent successfully to ${emailPayload.emailData.email}`);
    }
    catch (error) {
        console.error(`❌ Background email processing failed for ${emailPayload.emailData.email}:`, error.message);
        // Optional: You could implement retry logic here
        // Or add to a queue for later processing
        // Or store failed attempts in database for manual retry
        // throw error; // Re-throw so the .catch() in the main function can log it
    }
};
exports.default = {
    processEmailsInBackground
};
// import axios from 'axios';
// // Types
// interface EmailPayload {
//     url: string;
//     emailData: any;
//     email: string;
//     id?: string;
//     retryCount?: number;
//     maxRetries?: number;
//     priority?: 'high' | 'medium' | 'low';
// }
// interface QueueItem {
//     payload: EmailPayload;
//     timestamp: number;
//     nextRetryAt?: number;
// }
// // Queue management
// class EmailQueue {
//     private queue: QueueItem[] = [];
//     private processingQueue: QueueItem[] = [];
//     private failedQueue: QueueItem[] = [];
//     private isProcessing = false;
//     private readonly maxConcurrent = 3;
//     private readonly baseDelayMs = 1000; // 1 second base delay
//     private readonly maxDelayMs = 30000; // 30 seconds max delay
//     // Add email to queue
//     enqueue(payload: EmailPayload, priority: 'high' | 'medium' | 'low' = 'medium'): void {
//         const queueItem: QueueItem = {
//             payload: {
//                 ...payload,
//                 id: payload.id || this.generateId(),
//                 retryCount: 0,
//                 maxRetries: payload.maxRetries || 3,
//                 priority
//             },
//             timestamp: Date.now()
//         };
//         // Insert based on priority
//         if (priority === 'high') {
//             this.queue.unshift(queueItem);
//         } else {
//             this.queue.push(queueItem);
//         }
//         console.log(`📧 Email queued for ${payload.email} (Priority: ${priority})`);
//         // Start processing if not already running
//         if (!this.isProcessing) {
//             this.processQueue();
//         }
//     }
//     // Process queue with concurrency control
//     private async processQueue(): Promise<void> {
//         if (this.isProcessing || this.queue.length === 0) {
//             return;
//         }
//         this.isProcessing = true;
//         console.log(`🔄 Starting queue processing. Queue size: ${this.queue.length}`);
//         const promises: Promise<void>[] = [];
//         while (this.queue.length > 0 && promises.length < this.maxConcurrent) {
//             const queueItem = this.queue.shift();
//             if (queueItem) {
//                 // Check if item should be retried now
//                 if (queueItem.nextRetryAt && Date.now() < queueItem.nextRetryAt) {
//                     // Put back in queue for later
//                     this.queue.push(queueItem);
//                     continue;
//                 }
//                 promises.push(this.processEmailItem(queueItem));
//             }
//         }
//         // Wait for current batch to complete
//         await Promise.allSettled(promises);
//         // Continue processing if there are more items
//         if (this.queue.length > 0) {
//             setTimeout(() => this.processQueue(), 100);
//         } else {
//             this.isProcessing = false;
//             console.log('✅ Queue processing completed');
//         }
//     }
//     // Process individual email item
//     private async processEmailItem(queueItem: QueueItem): Promise<void> {
//         const { payload } = queueItem;
//         try {
//             await this.sendEmailWithRetry(payload);
//             console.log(`✅ Email sent successfully to ${payload.email} (ID: ${payload.id})`);
//         } catch (error) {
//             console.error(`❌ Final failure for email ${payload.email} (ID: ${payload.id}):`, error);
//             this.failedQueue.push(queueItem);
//         }
//     }
//     // Send email with retry logic
//     private async sendEmailWithRetry(payload: EmailPayload): Promise<void> {
//         const maxRetries = payload.maxRetries || 3;
//         let lastError: any;
//         for (let attempt = 0; attempt <= maxRetries; attempt++) {
//             try {
//                 // Add delay for retries (exponential backoff)
//                 if (attempt > 0) {
//                     const delay = Math.min(
//                         this.baseDelayMs * Math.pow(2, attempt - 1),
//                         this.maxDelayMs
//                     );
//                     console.log(`⏳ Retrying email to ${payload.email} in ${delay}ms (Attempt ${attempt}/${maxRetries})`);
//                     await this.sleep(delay);
//                 }
//                 // Attempt to send email
//                 await axios.post(payload.url, payload.emailData, {
//                     timeout: 10000, // 10 second timeout
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'User-Agent': 'EmailQueue/1.0'
//                     }
//                 });
//                 // Success - break out of retry loop
//                 if (attempt > 0) {
//                     console.log(`🔄 Email retry successful for ${payload.email} on attempt ${attempt + 1}`);
//                 }
//                 return;
//             } catch (error: any) {
//                 lastError = error;
//                 payload.retryCount = attempt + 1;
//                 // Log the attempt
//                 console.error(`❌ Email attempt ${attempt + 1}/${maxRetries + 1} failed for ${payload.email}:`, {
//                     status: error.response?.status,
//                     statusText: error.response?.statusText,
//                     message: error.message,
//                     code: error.code
//                 });
//                 // Don't retry on certain HTTP status codes
//                 if (this.isNonRetryableError(error)) {
//                     console.error(`🚫 Non-retryable error for ${payload.email}. Stopping retries.`);
//                     throw error;
//                 }
//             }
//         }
//         // All retries exhausted
//         throw new Error(`Max retries (${maxRetries}) exhausted for ${payload.email}. Last error: ${lastError.message}`);
//     }
//     // Check if error should not be retried
//     private isNonRetryableError(error: any): boolean {
//         const status = error.response?.status;
//         // Don't retry on client errors (4xx) except for specific cases
//         if (status >= 400 && status < 500) {
//             // Retry on rate limiting and timeout-related errors
//             return ![408, 429].includes(status);
//         }
//         // Don't retry on certain network errors
//         const nonRetryableCodes = ['ENOTFOUND', 'ECONNREFUSED'];
//         return nonRetryableCodes.includes(error.code);
//     }
//     // Utility methods
//     private generateId(): string {
//         return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     }
//     private sleep(ms: number): Promise<void> {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }
//     // Queue management methods
//     getQueueStatus() {
//         return {
//             pending: this.queue.length,
//             processing: this.processingQueue.length,
//             failed: this.failedQueue.length,
//             isProcessing: this.isProcessing
//         };
//     }
//     // Retry failed emails
//     retryFailedEmails(): void {
//         console.log(`🔄 Retrying ${this.failedQueue.length} failed emails`);
//         const failedItems = [...this.failedQueue];
//         this.failedQueue = [];
//         failedItems.forEach(item => {
//             // Reset retry count and add back to queue
//             item.payload.retryCount = 0;
//             this.queue.push(item);
//         });
//         if (!this.isProcessing) {
//             this.processQueue();
//         }
//     }
//     // Clear failed queue
//     clearFailedQueue(): void {
//         const count = this.failedQueue.length;
//         this.failedQueue = [];
//         console.log(`🗑️ Cleared ${count} failed emails from queue`);
//     }
//     // Get failed emails for manual review
//     getFailedEmails(): EmailPayload[] {
//         return this.failedQueue.map(item => item.payload);
//     }
// }
// // Global queue instance
// const emailQueue = new EmailQueue();
// // Enhanced email processing function
// const processEmailsInBackground = async (emailPayload: EmailPayload) => {
//     try {
//         // Add to queue instead of processing immediately
//         emailQueue.enqueue(emailPayload);
//         // Return immediately - processing happens in background
//         return {
//             success: true,
//             message: `Email queued for ${emailPayload.email}`,
//             queueStatus: emailQueue.getQueueStatus()
//         };
//     } catch (error: any) {
//         console.error(`❌ Failed to queue email for ${emailPayload.email}:`, error.message);
//         throw error;
//     }
// };
// // Utility functions for queue management
// const getEmailQueueStatus = () => {
//     return emailQueue.getQueueStatus();
// };
// const retryFailedEmails = () => {
//     emailQueue.retryFailedEmails();
// };
// const getFailedEmails = () => {
//     return emailQueue.getFailedEmails();
// };
// const clearFailedEmailQueue = () => {
//     emailQueue.clearFailedQueue();
// };
// // Export the enhanced functions
// export {
//     processEmailsInBackground,
//     getEmailQueueStatus,
//     retryFailedEmails,
//     getFailedEmails,
//     clearFailedEmailQueue,
//     EmailPayload
// };
// // Example usage:
// /*
// // Basic usage - same as before
// await processEmailsInBackground({
//     url: 'https://api.emailservice.com/send',
//     emailData: { to: 'user@example.com', subject: 'Hello', body: 'World' },
//     email: 'user@example.com'
// });
// // Advanced usage with custom retry settings
// await processEmailsInBackground({
//     url: 'https://api.emailservice.com/send',
//     emailData: { to: 'vip@example.com', subject: 'Important', body: 'VIP Message' },
//     email: 'vip@example.com',
//     maxRetries: 5,
//     priority: 'high'
// });
// // Monitor queue status
// console.log('Queue Status:', getEmailQueueStatus());
// // Retry failed emails
// retryFailedEmails();
// // Get failed emails for manual review
// const failedEmails = getFailedEmails();
// console.log('Failed emails:', failedEmails);
// */
