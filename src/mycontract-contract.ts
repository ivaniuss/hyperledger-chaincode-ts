/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Account } from './mycontract';

@Info({ title: 'MycontractContract', description: 'My Smart Contract' })
export class MycontractContract extends Contract {
    @Transaction(false)
    @Returns('boolean')
    public async myAccountExists(ctx: Context, id: string): Promise<boolean> {
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
    public async readMycontract(ctx: Context, mycontractId: string): Promise<Account> {
        const exists: boolean = await this.myAccountExists(ctx, mycontractId);
        if (!exists) {
            throw new Error(`The mycontract ${mycontractId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(mycontractId);
        const mycontract: Account = JSON.parse(data.toString()) as Account;
        return mycontract;
    }

    @Transaction()
    public async transferAmount(ctx: Context, idFrom: string, idTo: string, amount: number): Promise<void> {
        const existsIdFrom: boolean = await this.myAccountExists(ctx, idFrom);
        if (!existsIdFrom) {
            throw new Error(`The account ${idFrom} does not exist`);
        }
        const existsIdTo: boolean = await this.myAccountExists(ctx, idTo);
        if (!existsIdTo) {
            throw new Error(`The account ${idTo} does not exist`);
        }
        const accountFrom: Account = new Account();
        const accountTo: Account = new Account();
        accountFrom.balance -= amount;
        accountTo.balance += amount;

        const bufferFrom: Buffer = Buffer.from(JSON.stringify(accountFrom));
        const bufferTo: Buffer = Buffer.from(JSON.stringify(accountTo));
        await ctx.stub.putState(idFrom, bufferFrom);
        await ctx.stub.putState(idTo, bufferTo);
    }

    // @Transaction()
    // public async deleteMycontract(ctx: Context, mycontractId: string): Promise<void> {
    //     const exists: boolean = await this.mycontractExists(ctx, mycontractId);
    //     if (!exists) {
    //         throw new Error(`The mycontract ${mycontractId} does not exist`);
    //     }
    //     await ctx.stub.deleteState(mycontractId);
    // }

}
