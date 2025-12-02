import { createTransactionCheckoutSession } from "@/app/actions/stripe"

export async function handlePayNow(formData: FormData) {
    'use server'

    try {
        console.log('=== Pay Now Debug Info ===')
        console.log('Transaction ID:', formData.get('transactionId'))
        console.log('Description:', formData.get('transactionDescription'))
        console.log('Amount:', formData.get('transactionAmount'))
        console.log('Type:', formData.get('transactionType'))
        console.log('========================')

        await createTransactionCheckoutSession(formData)
    } catch (error) {
        console.error('Error in handlePayNow:', error)
        throw error
    }
}
