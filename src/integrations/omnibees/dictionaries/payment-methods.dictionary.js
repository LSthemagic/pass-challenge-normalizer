export const omnibeesPaymentMethodDictionary = new Map([
    // Mapeamentos baseados na "Tabela 2 - Payment types"
    [2, 'direct-bill'],      // DirectBill (precisaria ser adicionado ao seu master-data se for usar)
    [3, 'voucher'],         // Voucher
    [4, 'bank-transfer'],   // PrePay (Mapeado como Transferência Bancária)
    [5, 'credit-card'],      // CreditCard
    [8, 'bank-transfer'],   // Deposit (Mapeado como Transferência Bancária)
    
    // O código 14 (PayPal) não está nesta tabela de GuaranteeType, 
    // mas na de PaymentCardType. Se ele puder aparecer aqui, adicionamos:
    [14, 'paypal'],
]);