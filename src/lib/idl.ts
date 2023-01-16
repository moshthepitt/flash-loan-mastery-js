export type FlashLoanMastery = {
  version: '0.1.0';
  name: 'flash_loan_mastery';
  instructions: [
    {
      name: 'initPool';
      docs: ['Initialize a lending pool'];
      accounts: [
        {
          name: 'funder';
          isMut: true;
          isSigner: true;
          docs: ['The funder for the `pool_authority` account'];
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
          docs: [
            'The mint representing the token that will be borrowed via flash loans'
          ];
        },
        {
          name: 'poolShareMint';
          isMut: true;
          isSigner: false;
          docs: [
            'The mint of the token that will represent shares in the new pool'
          ];
        },
        {
          name: 'poolShareMintAuthority';
          isMut: false;
          isSigner: true;
          docs: ['The current mint authority of `pool_share_mint`'];
        },
        {
          name: 'poolAuthority';
          isMut: true;
          isSigner: false;
          docs: ['The pool authority'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The [Token] program'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['The Solana System program'];
        }
      ];
      args: [];
    },
    {
      name: 'deposit';
      docs: ['Deposit funds into a lending pool'];
      accounts: [
        {
          name: 'depositor';
          isMut: false;
          isSigner: true;
          docs: ['The entity depositing funds into the pool'];
        },
        {
          name: 'tokenFrom';
          isMut: true;
          isSigner: false;
          docs: ['The token to deposit into the pool'];
        },
        {
          name: 'tokenTo';
          isMut: true;
          isSigner: false;
          docs: ['The token to receive tokens deposited into the pool'];
        },
        {
          name: 'poolShareTokenTo';
          isMut: true;
          isSigner: false;
          docs: ['The token account for receiving shares in the pool'];
        },
        {
          name: 'poolShareMint';
          isMut: true;
          isSigner: false;
          docs: ['The mint of the token representing shares in the pool'];
        },
        {
          name: 'poolAuthority';
          isMut: false;
          isSigner: false;
          docs: ['The pool authority'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The [Token] program'];
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'withdraw';
      docs: ['Withdraw funds from a lending pool'];
      accounts: [
        {
          name: 'withdrawer';
          isMut: false;
          isSigner: true;
          docs: ['The entity withdrawing funds into the pool'];
        },
        {
          name: 'tokenFrom';
          isMut: true;
          isSigner: false;
          docs: ['The token to withdraw from the pool'];
        },
        {
          name: 'tokenTo';
          isMut: true;
          isSigner: false;
          docs: ['The token to receive tokens withdrawn from the pool'];
        },
        {
          name: 'poolShareTokenFrom';
          isMut: true;
          isSigner: false;
          docs: ['The token account for redeeming shares of the pool'];
        },
        {
          name: 'poolShareMint';
          isMut: true;
          isSigner: false;
          docs: ['The mint of the token representing shares in the pool'];
        },
        {
          name: 'poolAuthority';
          isMut: false;
          isSigner: false;
          docs: ['The pool authority'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The [Token] program'];
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'borrow';
      docs: ['Borrow funds from a lending pool'];
      accounts: [
        {
          name: 'borrower';
          isMut: false;
          isSigner: true;
          docs: ['The entity borrowing funds from the pool'];
        },
        {
          name: 'tokenFrom';
          isMut: true;
          isSigner: false;
          docs: ['The token to borrow from the pool'];
        },
        {
          name: 'tokenTo';
          isMut: true;
          isSigner: false;
          docs: ['The token to receive tokens borrowed from the pool'];
        },
        {
          name: 'poolAuthority';
          isMut: false;
          isSigner: false;
          docs: ['The pool authority'];
        },
        {
          name: 'instructionsSysvar';
          isMut: false;
          isSigner: false;
          docs: ['Solana Instructions Sysvar'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The [Token] program'];
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'repay';
      docs: ['Repay funds to a lending pool'];
      accounts: [
        {
          name: 'repayer';
          isMut: false;
          isSigner: true;
          docs: ['The entity repaying funds from the pool'];
        },
        {
          name: 'tokenFrom';
          isMut: true;
          isSigner: false;
          docs: ['The token to repay back to the pool'];
        },
        {
          name: 'tokenTo';
          isMut: true;
          isSigner: false;
          docs: ['The token to receive tokens repaid into the pool'];
        },
        {
          name: 'poolAuthority';
          isMut: false;
          isSigner: false;
          docs: ['The pool authority'];
        },
        {
          name: 'instructionsSysvar';
          isMut: false;
          isSigner: false;
          docs: ['Solana Instructions Sysvar'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['The [Token] program'];
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    }
  ];
  accounts: [
    {
      name: 'poolAuthority';
      docs: ['`PoolAuthority` account'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mint';
            docs: ['The token mint'];
            type: 'publicKey';
          },
          {
            name: 'poolShareMint';
            docs: ['The `pool_share_mint`'];
            type: 'publicKey';
          },
          {
            name: 'bump';
            docs: ['The PDA bump'];
            type: 'u8';
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'AddressMismatch';
      msg: 'Address Mismatch';
    },
    {
      code: 6001;
      name: 'OwnerMismatch';
      msg: 'Owner Mismatch';
    },
    {
      code: 6002;
      name: 'PoolMismatch';
      msg: 'Pool Mismatch';
    },
    {
      code: 6003;
      name: 'ProgramMismatch';
      msg: 'Program Mismatch';
    },
    {
      code: 6004;
      name: 'InvalidMintSupply';
      msg: 'Invalid Mint Supply';
    },
    {
      code: 6005;
      name: 'InvalidMintDecimals';
      msg: 'Invalid Mint Decimals';
    },
    {
      code: 6006;
      name: 'CannotBorrowBeforeRepay';
      msg: 'Cannot Borrow Before Repay';
    },
    {
      code: 6007;
      name: 'NoRepaymentInstructionFound';
      msg: 'There is no repayment instruction';
    },
    {
      code: 6008;
      name: 'IncorrectRepaymentAmount';
      msg: 'The repayment amount is incorrect';
    }
  ];
};

export const IDL: FlashLoanMastery = {
  version: '0.1.0',
  name: 'flash_loan_mastery',
  instructions: [
    {
      name: 'initPool',
      docs: ['Initialize a lending pool'],
      accounts: [
        {
          name: 'funder',
          isMut: true,
          isSigner: true,
          docs: ['The funder for the `pool_authority` account'],
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
          docs: [
            'The mint representing the token that will be borrowed via flash loans',
          ],
        },
        {
          name: 'poolShareMint',
          isMut: true,
          isSigner: false,
          docs: [
            'The mint of the token that will represent shares in the new pool',
          ],
        },
        {
          name: 'poolShareMintAuthority',
          isMut: false,
          isSigner: true,
          docs: ['The current mint authority of `pool_share_mint`'],
        },
        {
          name: 'poolAuthority',
          isMut: true,
          isSigner: false,
          docs: ['The pool authority'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The [Token] program'],
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Solana System program'],
        },
      ],
      args: [],
    },
    {
      name: 'deposit',
      docs: ['Deposit funds into a lending pool'],
      accounts: [
        {
          name: 'depositor',
          isMut: false,
          isSigner: true,
          docs: ['The entity depositing funds into the pool'],
        },
        {
          name: 'tokenFrom',
          isMut: true,
          isSigner: false,
          docs: ['The token to deposit into the pool'],
        },
        {
          name: 'tokenTo',
          isMut: true,
          isSigner: false,
          docs: ['The token to receive tokens deposited into the pool'],
        },
        {
          name: 'poolShareTokenTo',
          isMut: true,
          isSigner: false,
          docs: ['The token account for receiving shares in the pool'],
        },
        {
          name: 'poolShareMint',
          isMut: true,
          isSigner: false,
          docs: ['The mint of the token representing shares in the pool'],
        },
        {
          name: 'poolAuthority',
          isMut: false,
          isSigner: false,
          docs: ['The pool authority'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The [Token] program'],
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdraw',
      docs: ['Withdraw funds from a lending pool'],
      accounts: [
        {
          name: 'withdrawer',
          isMut: false,
          isSigner: true,
          docs: ['The entity withdrawing funds into the pool'],
        },
        {
          name: 'tokenFrom',
          isMut: true,
          isSigner: false,
          docs: ['The token to withdraw from the pool'],
        },
        {
          name: 'tokenTo',
          isMut: true,
          isSigner: false,
          docs: ['The token to receive tokens withdrawn from the pool'],
        },
        {
          name: 'poolShareTokenFrom',
          isMut: true,
          isSigner: false,
          docs: ['The token account for redeeming shares of the pool'],
        },
        {
          name: 'poolShareMint',
          isMut: true,
          isSigner: false,
          docs: ['The mint of the token representing shares in the pool'],
        },
        {
          name: 'poolAuthority',
          isMut: false,
          isSigner: false,
          docs: ['The pool authority'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The [Token] program'],
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'borrow',
      docs: ['Borrow funds from a lending pool'],
      accounts: [
        {
          name: 'borrower',
          isMut: false,
          isSigner: true,
          docs: ['The entity borrowing funds from the pool'],
        },
        {
          name: 'tokenFrom',
          isMut: true,
          isSigner: false,
          docs: ['The token to borrow from the pool'],
        },
        {
          name: 'tokenTo',
          isMut: true,
          isSigner: false,
          docs: ['The token to receive tokens borrowed from the pool'],
        },
        {
          name: 'poolAuthority',
          isMut: false,
          isSigner: false,
          docs: ['The pool authority'],
        },
        {
          name: 'instructionsSysvar',
          isMut: false,
          isSigner: false,
          docs: ['Solana Instructions Sysvar'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The [Token] program'],
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'repay',
      docs: ['Repay funds to a lending pool'],
      accounts: [
        {
          name: 'repayer',
          isMut: false,
          isSigner: true,
          docs: ['The entity repaying funds from the pool'],
        },
        {
          name: 'tokenFrom',
          isMut: true,
          isSigner: false,
          docs: ['The token to repay back to the pool'],
        },
        {
          name: 'tokenTo',
          isMut: true,
          isSigner: false,
          docs: ['The token to receive tokens repaid into the pool'],
        },
        {
          name: 'poolAuthority',
          isMut: false,
          isSigner: false,
          docs: ['The pool authority'],
        },
        {
          name: 'instructionsSysvar',
          isMut: false,
          isSigner: false,
          docs: ['Solana Instructions Sysvar'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['The [Token] program'],
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'poolAuthority',
      docs: ['`PoolAuthority` account'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mint',
            docs: ['The token mint'],
            type: 'publicKey',
          },
          {
            name: 'poolShareMint',
            docs: ['The `pool_share_mint`'],
            type: 'publicKey',
          },
          {
            name: 'bump',
            docs: ['The PDA bump'],
            type: 'u8',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'AddressMismatch',
      msg: 'Address Mismatch',
    },
    {
      code: 6001,
      name: 'OwnerMismatch',
      msg: 'Owner Mismatch',
    },
    {
      code: 6002,
      name: 'PoolMismatch',
      msg: 'Pool Mismatch',
    },
    {
      code: 6003,
      name: 'ProgramMismatch',
      msg: 'Program Mismatch',
    },
    {
      code: 6004,
      name: 'InvalidMintSupply',
      msg: 'Invalid Mint Supply',
    },
    {
      code: 6005,
      name: 'InvalidMintDecimals',
      msg: 'Invalid Mint Decimals',
    },
    {
      code: 6006,
      name: 'CannotBorrowBeforeRepay',
      msg: 'Cannot Borrow Before Repay',
    },
    {
      code: 6007,
      name: 'NoRepaymentInstructionFound',
      msg: 'There is no repayment instruction',
    },
    {
      code: 6008,
      name: 'IncorrectRepaymentAmount',
      msg: 'The repayment amount is incorrect',
    },
  ],
};
