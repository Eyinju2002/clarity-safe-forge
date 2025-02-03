import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure admin can register new template",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const admin = accounts.get("wallet_1")!;
    const result = chain.mineBlock([
      Tx.contractCall(
        "safe-forge",
        "register-template",
        [
          types.uint(1),
          types.ascii("Test Template"),
          types.utf8("(contract-code {...})")
        ],
        admin.address
      )
    ]);
    result.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "Ensure non-admin cannot register template",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get("wallet_2")!;
    const result = chain.mineBlock([
      Tx.contractCall(
        "safe-forge",
        "register-template",
        [
          types.uint(1),
          types.ascii("Test Template"),
          types.utf8("(contract-code {...})")
        ],
        user.address
      )
    ]);
    result.receipts[0].result.expectErr(types.uint(103));
  },
});

Clarinet.test({
  name: "Ensure template code validation works",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const admin = accounts.get("wallet_1")!;
    const result = chain.mineBlock([
      Tx.contractCall(
        "safe-forge", 
        "register-template",
        [
          types.uint(1),
          types.ascii("Invalid Template"),
          types.utf8(";; Invalid code")
        ],
        admin.address
      )
    ]);
    result.receipts[0].result.expectErr(types.uint(104));
  },
});

Clarinet.test({
  name: "Ensure user can deploy contract from template",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get("wallet_1")!;
    const result = chain.mineBlock([
      Tx.contractCall(
        "safe-forge",
        "deploy-contract",
        [types.uint(1), types.uint(1)],
        user.address
      )
    ]);
    result.receipts[0].result.expectOk();
  },
});
