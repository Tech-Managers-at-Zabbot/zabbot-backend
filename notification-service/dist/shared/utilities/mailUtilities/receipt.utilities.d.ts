declare const generateTransactionReceipt: (transaction: {
    reference: string;
    amount: number;
    type: "credit" | "debit";
    status: "pending" | "completed" | "failed";
    date: Date;
    userEventyzzeId: string;
    description: string;
}) => string;
export default generateTransactionReceipt;
