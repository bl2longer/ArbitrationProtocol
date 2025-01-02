# Arbiter portal frontend

## Example flow

- On the loan app, every time a new loan order is created, the "unlock BTC"
- From the loan app, a user request an arbitration to ask arbiters to verify a BTC tx has been published.
- Loan app calls the loan contract
- Loan contract calls the arbiter's transaction manager ... TO BE CONTINUED

## About malicious behaviours

We assume that there are two parties, A and B, in the transaction. The role of the arbiter is to help them complete the transaction. If either party does not act, the arbiter can complete the transaction on his behalf.
But the arbiter may also do evil, so there must be pledges and penalties.
If the arbiter does evil, he may cooperate with A, and the victim is B. On the contrary, he cooperates with B, and the victim is A.
When registering the transaction, we provide B's address. When requesting arbitration, we provide A's address.
In view of the possibility of evil in different links of the transaction, we provide corresponding reporting and punishment mechanisms. Because different links and different people participate in evil, there are 4 situations, which seems a bit complicated.

1. Normally, A and B complete the transaction amicably, and the arbiter does not participate at all. I believe this will be 99% of the cases.
2. A initiates arbitration and asks the arbiter for help. The arbiter can have three situations
2.1 The arbiter provides the correct signature to help A obtain funds. This may also be the most possible result.
2.2 The arbiter fails to sign in time and times out, which will result in A being unable to retrieve his assets. A can immediately report the arbiter and obtain the arbiter's pledge as compensation.
  This is "Timeout" compensation type
2.3 The arbiter submits the signature, but A finds that the signature is wrong when broadcasting the transaction and cannot help him retrieve his assets. A can submit the wrong transaction to the ZKP service to generate a BTC transaction proof (if he can run the ZKP program, he can also generate the proof himself), and then submit the proof to the arbitration protocol as evidence. After the arbitration protocol verifies that it is correct, A will be able to obtain the arbiter's pledge as compensation.
  This is "FailedArbitration" compensation type
3. If A does not initiate arbitration, but A and the arbiter conspire to do evil, and the arbiter signs a BTC transaction to help A obtain assets without any arbitration, this is a violation of the transaction agreement. B can submit the malicious transaction to the ZKP service to generate a BTC transaction proof, and then submit this proof to the arbitration protocol as evidence. After the arbitration protocol verifies that it is correct, B will obtain the arbiter's pledge as compensation.
   This is "IllegalSignature" compensation type

2 (2.1, 2.2, 2.3) are all initiated by A, that is, timeoutCompensationReceiver
3 is initiated by B, that is, compensationReceiver