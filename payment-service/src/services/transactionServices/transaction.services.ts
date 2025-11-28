// // services/transaction.service.ts (Generic Version)
// import { errorUtilities } from '../../../../shared/utilities';
// import Transactions, {
//   TransactionStatus,
//   TransactionType,
//   PaymentGateway,
//   PaymentMethod
// } from '../../../../shared/entities/payment-service-entities/transactions/transactions';

// class TransactionService {
//   // Generic method to create a transaction record
//   async createTransaction(transactionData: {
//     userId: string;
//     paymentGateway: PaymentGateway;
//     gatewayTransactionId?: string;
//     gatewaySubscriptionId?: string;
//     gatewayCustomerId?: string;
//     amount: number;
//     currency: string;
//     paymentMethod: PaymentMethod;
//     transactionType: TransactionType;
//     description?: string;
//     metadata?: Record<string, any>;
//     expiresAt?: Date;
//   }) {
//     try {
//       const transaction = await Transactions.create(transactionData);
//       return transaction;
//     } catch (error) {
//       console.error('Error creating transaction:', error);
//       throw error;
//     }
//   }

//   // Generic method to update transaction status
//   async updateTransactionStatus(
//     gatewayTransactionId: string,
//     paymentGateway: PaymentGateway,
//     updates: {
//       status: TransactionStatus;
//       failureReason?: string;
//       paidAt?: Date;
//       failedAt?: Date;
//       metadata?: Record<string, any>;
//     }
//   ) {
//     try {
//       const transaction = await Transactions.findOne({
//         where: { gatewayTransactionId, paymentGateway },
//       });

//       if (!transaction) {
//         throw new Error(`Transaction not found: ${gatewayTransactionId}`);
//       }

//       await transaction.update(updates);
//       return transaction;
//     } catch (error) {
//       console.error('Error updating transaction status:', error);
//       throw error;
//     }
//   }

//   // Handle payment succeeded for any gateway
//   async handlePaymentSucceeded(
//     paymentGateway: PaymentGateway,
//     paymentData: {
//       gatewayTransactionId: string;
//       gatewayCustomerId?: string;
//       gatewaySubscriptionId?: string;
//       amount: number;
//       currency: string;
//       paymentMethod: PaymentMethod;
//       metadata?: Record<string, any>;
//       description?: string;
//     }
//   ) {
//     try {
//       await this.updateTransactionStatus(
//         paymentData.gatewayTransactionId,
//         paymentGateway,
//         {
//           status: TransactionStatus.SUCCEEDED,
//           paidAt: new Date(),
//           metadata: paymentData.metadata,
//         }
//       );

//       console.log(`Payment succeeded for ${paymentGateway}: ${paymentData.gatewayTransactionId}`);
//     } catch (error) {
//       console.error(`Error handling payment succeeded for ${paymentGateway}:`, error);
//       throw error;
//     }
//   }

//   // Handle payment failed for any gateway
//   async handlePaymentFailed(
//     paymentGateway: PaymentGateway,
//     paymentData: {
//       gatewayTransactionId: string;
//       failureReason: string;
//       metadata?: Record<string, any>;
//     }
//   ) {
//     try {
//       await this.updateTransactionStatus(
//         paymentData.gatewayTransactionId,
//         paymentGateway,
//         {
//           status: TransactionStatus.FAILED,
//           failureReason: paymentData.failureReason,
//           failedAt: new Date(),
//           metadata: paymentData.metadata,
//         }
//       );

//       console.log(`Payment failed for ${paymentGateway}: ${paymentData.gatewayTransactionId}`);
//     } catch (error) {
//       console.error(`Error handling payment failed for ${paymentGateway}:`, error);
//       throw error;
//     }
//   }

//   // Handle refund for any gateway
//   async handleRefund(
//     paymentGateway: PaymentGateway,
//     refundData: {
//       gatewayTransactionId: string;
//       refundedAmount: number;
//       metadata?: Record<string, any>;
//     }
//   ) {
//     try {
//       const transaction = await Transactions.findOne({
//         where: { gatewayTransactionId, paymentGateway },
//       });

//       if (!transaction) {
//         throw new Error(`Transaction not found: ${refundData.gatewayTransactionId}`);
//       }

//       await transaction.update({
//         status: TransactionStatus.REFUNDED,
//         refundedAmount: refundData.refundedAmount,
//         refundedAt: new Date(),
//         metadata: { ...transaction.metadata, refund: refundData.metadata },
//       });

//       console.log(`Refund processed for ${paymentGateway}: ${refundData.gatewayTransactionId}`);
//     } catch (error) {
//       console.error(`Error handling refund for ${paymentGateway}:`, error);
//       throw error;
//     }
//   }

//   // Handle dispute for any gateway
//   async handleDispute(
//     paymentGateway: PaymentGateway,
//     disputeData: {
//       gatewayTransactionId: string;
//       status: TransactionStatus;
//       metadata?: Record<string, any>;
//     }
//   ) {
//     try {
//       await this.updateTransactionStatus(
//         disputeData.gatewayTransactionId,
//         paymentGateway,
//         {
//           status: disputeData.status,
//           disputedAt: new Date(),
//           metadata: disputeData.metadata,
//         }
//       );

//       console.log(`Dispute handled for ${paymentGateway}: ${disputeData.gatewayTransactionId}`);
//     } catch (error) {
//       console.error(`Error handling dispute for ${paymentGateway}:`, error);
//       throw error;
//     }
//   }

//   // Get user's transaction history
//   async getUserTransactionHistory(
//     userId: string,
//     options: {
//       paymentGateway?: PaymentGateway;
//       status?: TransactionStatus;
//       limit?: number;
//       offset?: number;
//     } = {}
//   ) {
//     try {
//       const { paymentGateway, status, limit = 50, offset = 0 } = options;

//       const whereClause: any = { userId };
//       if (paymentGateway) whereClause.paymentGateway = paymentGateway;
//       if (status) whereClause.status = status;

//       const { count, rows } = await Transactions.findAndCountAll({
//         where: whereClause,
//         order: [['createdAt', 'DESC']],
//         limit,
//         offset,
//       });

//       return {
//         transactions: rows,
//         total: count,
//         hasMore: count > offset + limit,
//       };
//     } catch (error) {
//       console.error('Error getting user transaction history:', error);
//       throw error;
//     }
//   }

//   // Find transaction by gateway ID
//   async findTransactionByGatewayId(
//     gatewayTransactionId: string,
//     paymentGateway: PaymentGateway
//   ) {
//     try {
//       return await Transactions.findOne({
//         where: { gatewayTransactionId, paymentGateway },
//       });
//     } catch (error) {
//       console.error('Error finding transaction by gateway ID:', error);
//       throw error;
//     }
//   }
// }

// export default new TransactionService();

import { helperFunctions } from "../../utilities/index";
import usersRepositories from "../../repositories/paymentRepositories/payment.repositories";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { StripeResponses } from "../../responses/stripe.responses";
import { PaymentOptions } from "../../types/payment.types";
import { stripe } from "../../config/stripe.config";
import config from "../../../../config/config";
import transactionsRepositories from "../../repositories/transationRepositories/transaction.repositories";
import { v4 } from "uuid";

const createTranscationService = errorUtilities.withServiceErrorHandling(
  async (amount: string, userId: string, planType: string, status: string) => {
    const payload = {
      id: v4(),
      userId,
      planType,
      status,
      amount,
    };
    const newTransaction = await transactionsRepositories.create(payload);

    if (!newTransaction) {
      throw errorUtilities.createError(
        StripeResponses.UNSUCCESSFUL_PROCESS,
        StatusCodes.BadRequest
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      newTransaction
    );
  }
);

const getUserTransactionsService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const allUserTransactions = await transactionsRepositories.getMany({
      userId,
    });
    const getUserLastPayment = await transactionsRepositories.getOne(
      { userId },
      null,
      [["createdAt", "DESC"]]
    );

    if (!allUserTransactions || !getUserLastPayment) {
      throw errorUtilities.createError(
        StripeResponses.UNSUCCESSFUL_PROCESS,
        StatusCodes.BadRequest
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      { allUserTransactions, userCurrentPlan: getUserLastPayment.planType }
    );
  }
);

export default {
  createTranscationService,
  getUserTransactionsService,
};
