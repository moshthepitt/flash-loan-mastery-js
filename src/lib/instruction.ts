import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { FlashLoanMastery, IDL } from './idl';

export const LOAN_FEE = 900;
export const REFERRAL_FEE = 50;
export const LOAN_FEE_DENOMINATOR = 10000;
export const ONE_HUNDRED = 100;

export type InstructionReturn = {
  instruction: web3.TransactionInstruction;
  signers: web3.Signer[];
};

export const getAssociatedTokenAddressSync = (
  mint: web3.PublicKey,
  owner: web3.PublicKey
) => {
  return web3.PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export const getTokenAccount = async (
  connection: web3.Connection,
  owner: web3.PublicKey,
  mint: web3.PublicKey
) => {
  const { value: tokenAccounts } =
    await connection.getParsedTokenAccountsByOwner(owner, { mint });

  if (tokenAccounts.length > 0) {
    const ataAddress = getAssociatedTokenAddressSync(mint, owner);
    const ataAccount = tokenAccounts.filter((it) =>
      it.pubkey.equals(ataAddress[0])
    );
    if (ataAccount.length > 0) {
      return ataAccount[0];
    } else {
      return tokenAccounts[0];
    }
  }

  return null;
};

export const getPoolAuthority = (
  programId: web3.PublicKey,
  mint: web3.PublicKey
) => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('flash_loan'), mint.toBuffer()],
    programId
  );
};

export const getProgram = (
  programId: web3.PublicKey,
  provider?: AnchorProvider
): Program<FlashLoanMastery> => {
  return new Program(IDL, programId, provider) as Program<FlashLoanMastery>;
};

export const initPool = async (p: {
  program: Program<FlashLoanMastery>;
  connection: web3.Connection;
  funder: web3.Signer;
  tokenMint: web3.PublicKey;
  poolMint: web3.PublicKey;
  poolMintAuthority: web3.Signer;
}): Promise<{
  instructions: {
    instruction: web3.TransactionInstruction;
    signers: web3.Signer[];
  }[];
  poolAuthority: web3.PublicKey;
  bankToken: web3.PublicKey;
}> => {
  const {
    program,
    connection,
    funder,
    poolMintAuthority,
    tokenMint,
    poolMint,
  } = p;
  const poolAuthority = getPoolAuthority(program.programId, tokenMint);
  const bankToken = getAssociatedTokenAddressSync(tokenMint, poolAuthority[0]);
  const possibleUserToken = await getTokenAccount(
    connection,
    funder.publicKey,
    tokenMint
  );

  const results = [
    {
      instruction: await program.methods
        .initPool()
        .accountsStrict({
          funder: funder.publicKey,
          mint: tokenMint,
          poolShareMint: poolMint,
          poolShareMintAuthority: poolMintAuthority.publicKey,
          poolAuthority: poolAuthority[0],
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction(),
      signers: [funder, poolMintAuthority],
    },
    {
      instruction: createAssociatedTokenAccountInstruction(
        funder.publicKey,
        bankToken[0],
        poolAuthority[0],
        tokenMint
      ),
      signers: [],
    },
  ];

  if (possibleUserToken == null) {
    results.push({
      instruction: createAssociatedTokenAccountInstruction(
        funder.publicKey,
        getAssociatedTokenAddressSync(tokenMint, funder.publicKey)[0],
        funder.publicKey,
        tokenMint
      ),
      signers: [],
    });
  }

  return {
    instructions: results,
    poolAuthority: poolAuthority[0],
    bankToken: bankToken[0],
  };
};

export const deposit = async (p: {
  program: Program<FlashLoanMastery>;
  connection: web3.Connection;
  depositor: web3.PublicKey;
  mint: web3.PublicKey;
  tokenFrom: web3.PublicKey;
  amount: BN;
}): Promise<{
  instructions: {
    instruction: web3.TransactionInstruction;
    signers: never[];
  }[];
  poolAuthority: web3.PublicKey;
  bankToken: web3.PublicKey;
  poolShareTokenTo: web3.PublicKey;
}> => {
  const { amount, connection, program, depositor, mint, tokenFrom } = p;

  const poolAuthority = getPoolAuthority(program.programId, mint);
  const tokenTo = getAssociatedTokenAddressSync(mint, poolAuthority[0]);
  const poolAuthorityAccount = await program.account.poolAuthority.fetch(
    poolAuthority[0]
  );
  const poolShareTokenTo = getAssociatedTokenAddressSync(
    poolAuthorityAccount.poolShareMint,
    depositor
  );
  const possibleDepositorPoolToken = await getTokenAccount(
    connection,
    depositor,
    poolAuthorityAccount.poolShareMint
  );
  const results = [
    {
      instruction: await program.methods
        .deposit(amount)
        .accountsStrict({
          depositor,
          tokenFrom,
          tokenTo: tokenTo[0],
          poolShareTokenTo: poolShareTokenTo[0],
          poolShareMint: poolAuthorityAccount.poolShareMint,
          poolAuthority: poolAuthority[0],
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction(),

      signers: [],
    },
  ];

  if (possibleDepositorPoolToken == null) {
    results.unshift({
      instruction: createAssociatedTokenAccountInstruction(
        depositor,
        getAssociatedTokenAddressSync(
          poolAuthorityAccount.poolShareMint,
          depositor
        )[0],
        depositor,
        poolAuthorityAccount.poolShareMint
      ),
      signers: [],
    });
  }

  return {
    instructions: results,
    poolAuthority: poolAuthority[0],
    bankToken: tokenTo[0],
    poolShareTokenTo: poolShareTokenTo[0],
  };
};

export const withdraw = async (p: {
  program: Program<FlashLoanMastery>;
  connection: web3.Connection;
  withdrawer: web3.PublicKey;
  mint: web3.PublicKey;
  poolShareTokenFrom: web3.PublicKey;
  amount: BN;
}): Promise<{
  instructions: {
    instruction: web3.TransactionInstruction;
    signers: never[];
  }[];
  poolAuthority: web3.PublicKey;
}> => {
  const { amount, program, connection, withdrawer, mint, poolShareTokenFrom } =
    p;

  const poolAuthority = getPoolAuthority(program.programId, mint);
  const tokenFrom = getAssociatedTokenAddressSync(mint, poolAuthority[0]);
  const poolAuthorityAccount = await program.account.poolAuthority.fetch(
    poolAuthority[0]
  );
  let tokenTo: web3.PublicKey = getAssociatedTokenAddressSync(
    mint,
    withdrawer
  )[0];
  const possibleTokenTo = await getTokenAccount(connection, withdrawer, mint);
  const results = [];

  if (possibleTokenTo == null) {
    results.push({
      instruction: createAssociatedTokenAccountInstruction(
        withdrawer,
        getAssociatedTokenAddressSync(mint, withdrawer)[0],
        withdrawer,
        mint
      ),
      signers: [],
    });
  } else {
    tokenTo = possibleTokenTo.pubkey;
  }

  results.push({
    instruction: await program.methods
      .withdraw(amount)
      .accountsStrict({
        withdrawer,
        tokenFrom: tokenFrom[0],
        tokenTo,
        poolShareTokenFrom,
        poolShareMint: poolAuthorityAccount.poolShareMint,
        poolAuthority: poolAuthority[0],
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction(),

    signers: [],
  });

  return {
    instructions: results,
    poolAuthority: poolAuthority[0],
  };
};

export const flashLoan = async (p: {
  program: Program<FlashLoanMastery>;
  borrower: web3.PublicKey;
  referralTokenTo?: web3.PublicKey;
  mint: web3.PublicKey;
  amount: BN;
}): Promise<{
  borrow: web3.TransactionInstruction;
  repay: web3.TransactionInstruction;
  repaymentAmount: BN;
}> => {
  const { amount, program, borrower, mint, referralTokenTo } = p;

  const poolAuthority = getPoolAuthority(program.programId, mint);
  const borrowerToken = getAssociatedTokenAddressSync(mint, borrower);
  const bankToken = getAssociatedTokenAddressSync(mint, poolAuthority[0]);

  const borrow = program.methods
    .borrow(amount)
    .accountsStrict({
      borrower,
      tokenFrom: bankToken[0],
      tokenTo: borrowerToken[0],
      poolAuthority: poolAuthority[0],
      instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const totalFees = amount
    .mul(new BN(LOAN_FEE).add(new BN(REFERRAL_FEE)))
    .div(new BN(LOAN_FEE_DENOMINATOR))
    .div(new BN(ONE_HUNDRED));
  const repaymentAmount = amount.add(totalFees);
  const repay = program.methods
    .repay(repaymentAmount)
    .accountsStrict({
      repayer: borrower,
      tokenFrom: borrowerToken[0],
      tokenTo: bankToken[0],
      poolAuthority: poolAuthority[0],
      instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(
      referralTokenTo
        ? [{ pubkey: referralTokenTo, isSigner: false, isWritable: true }]
        : []
    )
    .instruction();

  return {
    borrow: await borrow,
    repay: await repay,
    repaymentAmount,
  };
};
