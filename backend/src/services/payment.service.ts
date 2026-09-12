import crypto from "node:crypto";
import Stripe from "stripe";
import { config } from "../config";

// ─── Stripe ─────────────────────────────────
const stripe = new Stripe(config.stripe.secretKey || "dummy_sk_test_123456789");

export const createStripePaymentIntent = async (
	amount: number,
	currency: string = "pkr",
	metadata: Record<string, string> = {},
) => {
	const paymentIntent = await stripe.paymentIntents.create({
		amount: Math.round(amount * 100), // Convert to smallest currency unit
		currency,
		metadata,
	});

	return {
		clientSecret: paymentIntent.client_secret,
		paymentIntentId: paymentIntent.id,
	};
};

export const confirmStripePayment = async (paymentIntentId: string) => {
	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
	return paymentIntent.status === "succeeded";
};

// ─── JazzCash ───────────────────────────────
export const createJazzCashPayment = async (
	amount: number,
	orderId: string,
	returnUrl: string,
) => {
	const dateTime = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
	const expiryDateTime = new Date(Date.now() + 30 * 60 * 1000)
		.toISOString()
		.replace(/[-:T]/g, "")
		.slice(0, 14);
	const txnRefNo = `T${dateTime}${orderId.slice(0, 8)}`;

	const dataString = [
		config.jazzCash.integritySalt,
		amount.toString(),
		"", // pp_BillReference
		"", // pp_Description
		"PKR",
		dateTime,
		"", // pp_DiscountedAmount
		config.jazzCash.merchantId,
		config.jazzCash.password,
		returnUrl,
		"", // pp_SecureHash
		expiryDateTime,
		txnRefNo,
		dateTime,
	].join("&");

	const secureHash = crypto
		.createHmac("sha256", config.jazzCash.integritySalt)
		.update(dataString)
		.digest("hex");

	return {
		endpoint: config.jazzCash.endpoint,
		payload: {
			pp_Version: "1.1",
			pp_TxnType: "MWALLET",
			pp_Language: "EN",
			pp_MerchantID: config.jazzCash.merchantId,
			pp_Password: config.jazzCash.password,
			pp_TxnRefNo: txnRefNo,
			pp_Amount: amount.toString(),
			pp_TxnCurrency: "PKR",
			pp_TxnDateTime: dateTime,
			pp_TxnExpiryDateTime: expiryDateTime,
			pp_ReturnURL: returnUrl,
			pp_SecureHash: secureHash,
		},
	};
};

// ─── EasyPaisa ──────────────────────────────
export const createEasyPaisaPayment = async (
	amount: number,
	orderId: string,
	mobileNumber: string,
) => {
	const timestamp = new Date().toISOString();

	const hashString = `amount=${amount}&orderId=${orderId}&storeId=${config.easyPaisa.storeId}&timestamp=${timestamp}`;
	const hash = crypto
		.createHmac("sha256", config.easyPaisa.hashKey)
		.update(hashString)
		.digest("hex");

	return {
		endpoint: config.easyPaisa.endpoint,
		payload: {
			orderId,
			storeId: config.easyPaisa.storeId,
			transactionAmount: amount.toString(),
			transactionType: "MA",
			mobileAccountNo: mobileNumber,
			emailAddress: "",
			tokenExpiry: "",
			bankIdentificationNumber: "",
			encryptedHashRequest: hash,
		},
	};
};

export { stripe };
