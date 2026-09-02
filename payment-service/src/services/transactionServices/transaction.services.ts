// import { helperFunctions } from "../../utilities/index";
// import usersRepositories from "../../repositories/paymentRepositories/payment.repositories";
// import {
//   responseUtilities,
//   errorUtilities,
// } from "../../../../shared/utilities";
// import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
// import { StripeResponses } from "../../responses/stripe.responses";
// import { PaymentOptions } from "../../types/payment.types";
// import { stripe } from "../../config/stripe.config";
// import config from "../../../../config/config";
// import transactionsRepositories from "../../repositories/transationRepositories/transaction.repositories";
// import { v4 } from "uuid";

// const createTranscationService = errorUtilities.withServiceErrorHandling(
//   async (amount: string, userId: string, planType: string, status: string) => {
//     const payload = {
//       id: v4(),
//       userId,
//       planType,
//       status,
//       amount,
//     };
//     const newTransaction = await transactionsRepositories.create(payload);

//     if (!newTransaction) {
//       throw errorUtilities.createError(
//         StripeResponses.UNSUCCESSFUL_PROCESS,
//         StatusCodes.BadRequest
//       );
//     }
//     return responseUtilities.handleServicesResponse(
//       StatusCodes.OK,
//       StripeResponses.PROCESS_SUCCESSFUL,
//       newTransaction
//     );
//   }
// );

// const getUserTransactionsService = errorUtilities.withServiceErrorHandling(
//   async (userId: string) => {
//     const allUserTransactions = await transactionsRepositories.getMany({
//       userId,
//     });
//     const getUserLastPayment = await transactionsRepositories.getOne(
//       { userId },
//       null,
//       [["createdAt", "DESC"]]
//     );

//     if (!allUserTransactions || !getUserLastPayment) {
//       throw errorUtilities.createError(
//         StripeResponses.UNSUCCESSFUL_PROCESS,
//         StatusCodes.NotFound
//       );
//     }

//     return responseUtilities.handleServicesResponse(
//       StatusCodes.OK,
//       StripeResponses.PROCESS_SUCCESSFUL,
//       { allUserTransactions, userCurrentPlan: getUserLastPayment.planType }
//     );
//   }
// );

// export default {
//   createTranscationService,
//   getUserTransactionsService,
// };

import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { StripeResponses } from "../../responses/stripe.responses";
import transactionsRepositories from "../../repositories/transationRepositories/transaction.repositories";
import { v4 } from "uuid";
import {
  PaymentGateway,
  TransactionStatus,
} from "../../../../shared/entities/payment-service-entities/transactions/transactions";
import { SubscriptionStatus } from "../../../../shared/entities/payment-service-entities/subscriptions/userSubscriptions";
import userSubscriptionRepositories from "../../repositories/userSubscirptionRepositories/userSubscription.repositories";
import subscriptionPlanRepositories from "../../repositories/subscriptionRepositories/subscription.repositories";

// Create transaction record
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

// Get user transactions
const getUserTransactionsService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const allUserTransactions = await transactionsRepositories.getMany({
      userId,
    });

    let plan: any = null;

    if (allUserTransactions && allUserTransactions.length > 0) {
      const userLastSubscription = await userSubscriptionRepositories.getOne({
        userId,
        status: SubscriptionStatus.ACTIVE,
      });

      // Only fetch plan if planId exists
      if (userLastSubscription?.planId) {
        plan = await subscriptionPlanRepositories.getOne({
          id: userLastSubscription.planId,
        });
      }
    }

    if (!allUserTransactions) {
      throw errorUtilities.createError(
        StripeResponses.UNSUCCESSFUL_PROCESS,
        StatusCodes.NotFound
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      {
        allUserTransactions,
        userCurrentPlan: plan?.planType || null,
      }
    );
  }
);

// Helper: Find transaction by gateway ID
const findTransactionByGatewayId = errorUtilities.withServiceErrorHandling(
  async (
    gatewayTransactionId: string,
    paymentGateway: PaymentGateway = PaymentGateway.STRIPE
  ) => {
    const getTransactionByGatewayId = await transactionsRepositories.getOne({
      gatewayTransactionId,
      paymentGateway,
    });
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      getTransactionByGatewayId
    );
  }
);

export default {
  createTranscationService,
  getUserTransactionsService,
  findTransactionByGatewayId,
};
