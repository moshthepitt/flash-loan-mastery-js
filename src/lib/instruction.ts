import { BN, Program, web3 } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { FlashLoanMastery, IDL } from './idl';

export const LOAN_FEE = 900;
export const ADMIN_FEE = 50;
export const LOAN_FEE_DENOMINATOR = 10000;
export const ONE_HUNDRED = 100;

export const ADMIN = new web3.PublicKey(
  '8JJxe21mwJezmU5y9NxTWUxc9stkEkwcP1deRzL2Kc7s'
);

export type InstructionReturn = {
  instruction: web3.TransactionInstruction;
  signers: web3.Signer[];
};

export const getAssociatedTokenAddressSync = (
  owner: web3.PublicKey,
  mint: web3.PublicKey
) => {
  return web3.PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
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
  programId: web3.PublicKey
): Program<FlashLoanMastery> => {
  return new Program(IDL, programId) as Program<FlashLoanMastery>;
};

export const initPool = async (p: {
  program: Program<FlashLoanMastery>;
  funder: web3.Signer;
  tokenMint: web3.PublicKey;
  poolMint: web3.PublicKey;
  poolMintAuthority: web3.Signer;
}): Promise<InstructionReturn[]> => {
  const { program, funder, poolMintAuthority, tokenMint, poolMint } = p;
  const poolAuthority = getPoolAuthority(program.programId, tokenMint);
  const bankToken = getAssociatedTokenAddressSync(tokenMint, poolAuthority[0]);
  const adminToken = getAssociatedTokenAddressSync(tokenMint, ADMIN);

  return [
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
    {
      instruction: createAssociatedTokenAccountInstruction(
        funder.publicKey,
        adminToken[0],
        ADMIN,
        tokenMint
      ),
      signers: [],
    } /** only do this if token does not already exist */,
  ];
};

export const deposit = async (p: {
  program: Program<FlashLoanMastery>;
  depositor: web3.PublicKey;
  mint: web3.PublicKey;
  tokenFrom: web3.PublicKey;
  amount: BN;
}): Promise<InstructionReturn[]> => {
  const { amount, program, depositor, mint, tokenFrom } = p;

  const poolAuthority = getPoolAuthority(program.programId, mint);
  const tokenTo = getAssociatedTokenAddressSync(mint, poolAuthority[0]);
  const poolAuthorityAccount = await program.account.poolAuthority.fetch(
    poolAuthority[0]
  );
  const poolShareTokenTo = getAssociatedTokenAddressSync(
    poolAuthorityAccount.poolShareMint,
    depositor
  );
  const depositorPoolToken = getAssociatedTokenAddressSync(
    poolAuthorityAccount.poolShareMint,
    depositor
  );

  return [
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
    {
      instruction: createAssociatedTokenAccountInstruction(
        depositor,
        depositorPoolToken[0],
        depositor,
        poolAuthorityAccount.poolShareMint
      ),
      signers: [],
    } /** only do this if token does not already exist */,
  ];
};

export const withdraw = async (p: {
  program: Program<FlashLoanMastery>;
  withdrawer: web3.PublicKey;
  mint: web3.PublicKey;
  poolShareTokenFrom: web3.PublicKey;
  amount: BN;
}): Promise<InstructionReturn[]> => {
  const { amount, program, withdrawer, mint, poolShareTokenFrom } = p;

  const poolAuthority = getPoolAuthority(program.programId, mint);
  const tokenFrom = getAssociatedTokenAddressSync(mint, poolAuthority[0]);
  const tokenTo = getAssociatedTokenAddressSync(mint, withdrawer);
  const poolAuthorityAccount = await program.account.poolAuthority.fetch(
    poolAuthority[0]
  );

  return [
    {
      instruction: createAssociatedTokenAccountInstruction(
        withdrawer,
        tokenTo[0],
        withdrawer,
        mint
      ),
      signers: [],
    } /** only do this if token does not already exist */,
    {
      instruction: await program.methods
        .withdraw(amount)
        .accountsStrict({
          withdrawer,
          tokenFrom: tokenFrom[0],
          tokenTo: tokenTo[0],
          poolShareTokenFrom,
          poolShareMint: poolAuthorityAccount.poolShareMint,
          poolAuthority: poolAuthority[0],
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction(),

      signers: [],
    },
  ];
};

export const flashLoan = async (p: {
  program: Program<FlashLoanMastery>;
  borrower: web3.PublicKey;
  mint: web3.PublicKey;
  amount: BN;
}): Promise<{
  borrow: web3.TransactionInstruction;
  repay: web3.TransactionInstruction;
}> => {
  const { amount, program, borrower, mint } = p;

  const poolAuthority = getPoolAuthority(program.programId, mint);
  const borrowerToken = getAssociatedTokenAddressSync(mint, borrower);
  const bankToken = getAssociatedTokenAddressSync(mint, poolAuthority[0]);
  const adminToken = getAssociatedTokenAddressSync(mint, ADMIN);

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
    .mul(new BN(LOAN_FEE).add(new BN(ADMIN_FEE).mul(new BN(2))))
    .div(new BN(LOAN_FEE_DENOMINATOR))
    .div(new BN(ONE_HUNDRED));
  const repaymentAmount = amount.add(totalFees);

  const repay = program.methods
    .repay(repaymentAmount)
    .accountsStrict({
      repayer: borrower,
      tokenFrom: borrowerToken[0],
      tokenTo: bankToken[0],
      adminTokenTo: adminToken[0],
      poolAuthority: poolAuthority[0],
      instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  return {
    borrow: await borrow,
    repay: await repay,
  };
};
