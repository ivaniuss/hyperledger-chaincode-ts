/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Account, Tx } from './mycontract';

@Info({ title: 'MycontractContract', description: 'My Smart Contract' })
export class MycontractContract extends Contract {
    @Transaction(false)
    @Returns('boolean')
    public async myAccountExists(ctx: Context, id: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(id);
        return (!!data && data.length > 0);
    }

    @Transaction(false)
    @Returns('boolean')
    public async myTxExists(ctx: Context, id: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(id);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createMyAccount(ctx: Context, id: string, name: string, balance: number, addressBTC: string): Promise<void> {
        const exists: boolean = await this.myAccountExists(ctx, id);
        if (exists) {
            throw new Error(`The Account ${id} already exists`);
        }
        const mycontract: Account = new Account();
        mycontract.name = name;
        mycontract.balance = balance;
        mycontract.addressBTC = addressBTC;

        const buffer: Buffer = Buffer.from(JSON.stringify(mycontract));
        await ctx.stub.putState(id, buffer);
    }


    // Hacer los ajustes de acuerdo a la clase Account 

    @Transaction(false)
    @Returns('Account')
    public async readMyAccount(ctx: Context, myAccountId: string): Promise<Account> {
        const exists: boolean = await this.myAccountExists(ctx, myAccountId);
        if (!exists) {
            throw new Error(`The account ${myAccountId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(myAccountId);
        const mycontract: Account = JSON.parse(data.toString()) as Account;
        return mycontract;
    }

    @Transaction(false)
    @Returns('Tx')
    public async readMyTx(ctx: Context, myTxId: string): Promise<Tx> {
        const exists: boolean = await this.myTxExists(ctx, myTxId);
        if (!exists) {
            throw new Error(`The transaction ${myTxId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(myTxId);
        const myTx: Tx = JSON.parse(data.toString()) as Tx;
        return myTx;
    }

    @Transaction()
    @Returns('Tx')
    public async transferAmount(ctx: Context, idTx: string, idFrom: string, idTo: string, amount: number): Promise<Tx> {
        const existsIdFrom: boolean = await this.myAccountExists(ctx, idFrom);
        if (!existsIdFrom) {
            throw new Error(`The account ${idFrom} does not exist`);
        }
        const existsIdTo: boolean = await this.myAccountExists(ctx, idTo);
        if (!existsIdTo) {
            throw new Error(`The account ${idTo} does not exist`);
        }

        const existsTx: boolean = await this.myAccountExists(ctx, idTx);
        if (existsTx) {
            throw new Error(`The Transaction ${existsTx} already exists`);
        }

        if (existsIdFrom && existsIdTo) {
            const balanceUpdateFrom = await ctx.stub.getState(idFrom);
            const balanceUpdateFrom_: Account = JSON.parse(balanceUpdateFrom.toString());
            const balanceUpdateTo = await ctx.stub.getState(idTo);
            const balanceUpdateTo_: Account = JSON.parse(balanceUpdateTo.toString());
            if (balanceUpdateFrom_.balance < amount) {
                throw new Error(`The account ${idFrom} does not has balance`)
            }
            else {
                balanceUpdateFrom_.balance -= amount;
                balanceUpdateTo_.balance += amount;
                await ctx.stub.putState(idFrom, Buffer.from(JSON.stringify(balanceUpdateFrom_)));
                await ctx.stub.putState(idTo, Buffer.from(JSON.stringify(balanceUpdateTo_)));

                const newTx: Tx = new Tx();
                newTx.idFrom = idFrom;
                newTx.idTo = idTo;
                newTx.amount = amount;

                const txBuffer: Buffer = Buffer.from(JSON.stringify(newTx));
                await ctx.stub.putState(idTx, txBuffer);
                return newTx;
            }
        }
        else {
            throw new Error(`The account ${idFrom} does not exist`)
        }
    }
}
