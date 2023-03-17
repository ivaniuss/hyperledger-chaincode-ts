/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { MycontractContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('MycontractContract', () => {

    let contract: MycontractContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new MycontractContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"mycontract 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"mycontract 1002 value"}'));
    });

    describe('#mycontractExists', () => {

        it('should return true for a mycontract', async () => {
            await contract.mycontractExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a mycontract that does not exist', async () => {
            await contract.mycontractExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMycontract', () => {

        it('should create a mycontract', async () => {
            await contract.createMycontract(ctx, '1003', 'mycontract 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"mycontract 1003 value"}'));
        });

        it('should throw an error for a mycontract that already exists', async () => {
            await contract.createMycontract(ctx, '1001', 'myvalue').should.be.rejectedWith(/The mycontract 1001 already exists/);
        });

    });

    describe('#readMycontract', () => {

        it('should return a mycontract', async () => {
            await contract.readMycontract(ctx, '1001').should.eventually.deep.equal({ value: 'mycontract 1001 value' });
        });

        it('should throw an error for a mycontract that does not exist', async () => {
            await contract.readMycontract(ctx, '1003').should.be.rejectedWith(/The mycontract 1003 does not exist/);
        });

    });

    describe('#updateMycontract', () => {

        it('should update a mycontract', async () => {
            await contract.updateMycontract(ctx, '1001', 'mycontract 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"mycontract 1001 new value"}'));
        });

        it('should throw an error for a mycontract that does not exist', async () => {
            await contract.updateMycontract(ctx, '1003', 'mycontract 1003 new value').should.be.rejectedWith(/The mycontract 1003 does not exist/);
        });

    });

    describe('#deleteMycontract', () => {

        it('should delete a mycontract', async () => {
            await contract.deleteMycontract(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a mycontract that does not exist', async () => {
            await contract.deleteMycontract(ctx, '1003').should.be.rejectedWith(/The mycontract 1003 does not exist/);
        });

    });

});
