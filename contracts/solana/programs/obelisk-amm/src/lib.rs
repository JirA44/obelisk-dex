use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo, Burn};

declare_id!("OBe1iskDEXAMMv1111111111111111111111111111");

pub mod constants {
    pub const MINIMUM_LIQUIDITY: u64 = 1000;
    pub const FEE_NUMERATOR: u64 = 997;
    pub const FEE_DENOMINATOR: u64 = 1000;
}

#[program]
pub mod obelisk_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_rate: u16,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.token_a_vault = ctx.accounts.token_a_vault.key();
        pool.token_b_vault = ctx.accounts.token_b_vault.key();
        pool.lp_mint = ctx.accounts.lp_mint.key();
        pool.fee_rate = fee_rate;
        pool.reserve_a = 0;
        pool.reserve_b = 0;
        pool.bump = ctx.bumps.pool;
        pool.authority = ctx.accounts.authority.key();

        emit!(PoolInitialized {
            pool: pool.key(),
            token_a: pool.token_a_mint,
            token_b: pool.token_b_mint,
            fee_rate,
        });

        Ok(())
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a_desired: u64,
        amount_b_desired: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        let (amount_a, amount_b) = if pool.reserve_a == 0 && pool.reserve_b == 0 {
            (amount_a_desired, amount_b_desired)
        } else {
            let amount_b_optimal = quote(amount_a_desired, pool.reserve_a, pool.reserve_b)?;
            if amount_b_optimal <= amount_b_desired {
                require!(amount_b_optimal >= amount_b_min, ErrorCode::InsufficientBAmount);
                (amount_a_desired, amount_b_optimal)
            } else {
                let amount_a_optimal = quote(amount_b_desired, pool.reserve_b, pool.reserve_a)?;
                require!(amount_a_optimal <= amount_a_desired, ErrorCode::InsufficientAAmount);
                require!(amount_a_optimal >= amount_a_min, ErrorCode::InsufficientAAmount);
                (amount_a_optimal, amount_b_desired)
            }
        };

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_a.to_account_info(),
                    to: ctx.accounts.token_a_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_a,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_b.to_account_info(),
                    to: ctx.accounts.token_b_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_b,
        )?;

        // Calculate LP tokens to mint
        let lp_supply = ctx.accounts.lp_mint.supply;
        let liquidity = if lp_supply == 0 {
            let sqrt_product = ((amount_a as u128) * (amount_b as u128)).integer_sqrt() as u64;
            require!(sqrt_product > constants::MINIMUM_LIQUIDITY, ErrorCode::InsufficientLiquidity);
            sqrt_product - constants::MINIMUM_LIQUIDITY
        } else {
            std::cmp::min(
                (amount_a as u128) * (lp_supply as u128) / (pool.reserve_a as u128),
                (amount_b as u128) * (lp_supply as u128) / (pool.reserve_b as u128),
            ) as u64
        };

        require!(liquidity > 0, ErrorCode::InsufficientLiquidity);

        // Mint LP tokens
        let seeds = &[b"pool".as_ref(), pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref(), &[pool.bump]];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    to: ctx.accounts.user_lp.to_account_info(),
                    authority: pool.to_account_info(),
                },
                signer,
            ),
            liquidity,
        )?;

        // Update reserves
        pool.reserve_a = pool.reserve_a.checked_add(amount_a).unwrap();
        pool.reserve_b = pool.reserve_b.checked_add(amount_b).unwrap();

        emit!(LiquidityAdded {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount_a,
            amount_b,
            liquidity,
        });

        Ok(())
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        liquidity: u64,
        amount_a_min: u64,
        amount_b_min: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let lp_supply = ctx.accounts.lp_mint.supply;

        let amount_a = ((liquidity as u128) * (pool.reserve_a as u128) / (lp_supply as u128)) as u64;
        let amount_b = ((liquidity as u128) * (pool.reserve_b as u128) / (lp_supply as u128)) as u64;

        require!(amount_a >= amount_a_min, ErrorCode::InsufficientAAmount);
        require!(amount_b >= amount_b_min, ErrorCode::InsufficientBAmount);

        // Burn LP tokens
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    from: ctx.accounts.user_lp.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            liquidity,
        )?;

        // Transfer tokens back to user
        let seeds = &[b"pool".as_ref(), pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref(), &[pool.bump]];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.token_a_vault.to_account_info(),
                    to: ctx.accounts.user_token_a.to_account_info(),
                    authority: pool.to_account_info(),
                },
                signer,
            ),
            amount_a,
        )?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.token_b_vault.to_account_info(),
                    to: ctx.accounts.user_token_b.to_account_info(),
                    authority: pool.to_account_info(),
                },
                signer,
            ),
            amount_b,
        )?;

        // Update reserves
        pool.reserve_a = pool.reserve_a.checked_sub(amount_a).unwrap();
        pool.reserve_b = pool.reserve_b.checked_sub(amount_b).unwrap();

        emit!(LiquidityRemoved {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount_a,
            amount_b,
            liquidity,
        });

        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
        a_to_b: bool,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        let (reserve_in, reserve_out) = if a_to_b {
            (pool.reserve_a, pool.reserve_b)
        } else {
            (pool.reserve_b, pool.reserve_a)
        };

        let amount_out = get_amount_out(amount_in, reserve_in, reserve_out)?;
        require!(amount_out >= minimum_amount_out, ErrorCode::SlippageExceeded);

        let seeds = &[b"pool".as_ref(), pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref(), &[pool.bump]];
        let signer = &[&seeds[..]];

        if a_to_b {
            // Transfer token A in
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_token_in.to_account_info(),
                        to: ctx.accounts.token_a_vault.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount_in,
            )?;

            // Transfer token B out
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.token_b_vault.to_account_info(),
                        to: ctx.accounts.user_token_out.to_account_info(),
                        authority: pool.to_account_info(),
                    },
                    signer,
                ),
                amount_out,
            )?;

            pool.reserve_a = pool.reserve_a.checked_add(amount_in).unwrap();
            pool.reserve_b = pool.reserve_b.checked_sub(amount_out).unwrap();
        } else {
            // Transfer token B in
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_token_in.to_account_info(),
                        to: ctx.accounts.token_b_vault.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount_in,
            )?;

            // Transfer token A out
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.token_a_vault.to_account_info(),
                        to: ctx.accounts.user_token_out.to_account_info(),
                        authority: pool.to_account_info(),
                    },
                    signer,
                ),
                amount_out,
            )?;

            pool.reserve_b = pool.reserve_b.checked_add(amount_in).unwrap();
            pool.reserve_a = pool.reserve_a.checked_sub(amount_out).unwrap();
        }

        emit!(SwapExecuted {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount_in,
            amount_out,
            a_to_b,
        });

        Ok(())
    }
}

// Helper functions
fn quote(amount_a: u64, reserve_a: u64, reserve_b: u64) -> Result<u64> {
    require!(amount_a > 0, ErrorCode::InsufficientAmount);
    require!(reserve_a > 0 && reserve_b > 0, ErrorCode::InsufficientLiquidity);
    Ok(((amount_a as u128) * (reserve_b as u128) / (reserve_a as u128)) as u64)
}

fn get_amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64) -> Result<u64> {
    require!(amount_in > 0, ErrorCode::InsufficientAmount);
    require!(reserve_in > 0 && reserve_out > 0, ErrorCode::InsufficientLiquidity);

    let amount_in_with_fee = (amount_in as u128) * (constants::FEE_NUMERATOR as u128);
    let numerator = amount_in_with_fee * (reserve_out as u128);
    let denominator = (reserve_in as u128) * (constants::FEE_DENOMINATOR as u128) + amount_in_with_fee;

    Ok((numerator / denominator) as u64)
}

// Accounts
#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::LEN,
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = token_a_mint,
        token::authority = pool,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = token_b_mint,
        token::authority = pool,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = pool,
    )]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut, constraint = token_a_vault.key() == pool.token_a_vault)]
    pub token_a_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = token_b_vault.key() == pool.token_b_vault)]
    pub token_b_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = lp_mint.key() == pool.lp_mint)]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_lp: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut, constraint = token_a_vault.key() == pool.token_a_vault)]
    pub token_a_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = token_b_vault.key() == pool.token_b_vault)]
    pub token_b_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = lp_mint.key() == pool.lp_mint)]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_lp: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut, constraint = token_a_vault.key() == pool.token_a_vault)]
    pub token_a_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = token_b_vault.key() == pool.token_b_vault)]
    pub token_b_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_in: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_out: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// State
#[account]
pub struct Pool {
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,
    pub lp_mint: Pubkey,
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub fee_rate: u16,
    pub bump: u8,
    pub authority: Pubkey,
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 32 + 8 + 8 + 2 + 1 + 32;
}

// Events
#[event]
pub struct PoolInitialized {
    pub pool: Pubkey,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub fee_rate: u16,
}

#[event]
pub struct LiquidityAdded {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount_a: u64,
    pub amount_b: u64,
    pub liquidity: u64,
}

#[event]
pub struct LiquidityRemoved {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount_a: u64,
    pub amount_b: u64,
    pub liquidity: u64,
}

#[event]
pub struct SwapExecuted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub a_to_b: bool,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient amount")]
    InsufficientAmount,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Insufficient A amount")]
    InsufficientAAmount,
    #[msg("Insufficient B amount")]
    InsufficientBAmount,
    #[msg("Slippage exceeded")]
    SlippageExceeded,
}

trait IntegerSquareRoot {
    fn integer_sqrt(self) -> Self;
}

impl IntegerSquareRoot for u128 {
    fn integer_sqrt(self) -> Self {
        if self == 0 {
            return 0;
        }
        let mut x = self;
        let mut y = (x + 1) / 2;
        while y < x {
            x = y;
            y = (x + self / x) / 2;
        }
        x
    }
}
