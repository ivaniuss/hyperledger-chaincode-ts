/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Account {

    @Property()
    public id: string;
    public name: string;
    public balance: number;
    public addressBTC: string
}
