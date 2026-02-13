;; Obelisk DEX AMM - Stacks (Bitcoin Layer 2)
;; Clarity Smart Contract for BTC-native DEX

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_POOL_EXISTS (err u101))
(define-constant ERR_POOL_NOT_FOUND (err u102))
(define-constant ERR_INSUFFICIENT_LIQUIDITY (err u103))
(define-constant ERR_INSUFFICIENT_AMOUNT (err u104))
(define-constant ERR_SLIPPAGE_EXCEEDED (err u105))
(define-constant ERR_DEADLINE_EXPIRED (err u106))
(define-constant ERR_ZERO_AMOUNT (err u107))
(define-constant ERR_TRANSFER_FAILED (err u108))

(define-constant FEE_NUMERATOR u997)
(define-constant FEE_DENOMINATOR u1000)
(define-constant MINIMUM_LIQUIDITY u1000)

;; Data Variables
(define-data-var pool-nonce uint u0)
(define-data-var protocol-fee-recipient principal CONTRACT_OWNER)
(define-data-var protocol-fee-rate uint u5) ;; 0.05%

;; Data Maps
(define-map pools
  { pool-id: uint }
  {
    token-x: principal,
    token-y: principal,
    reserve-x: uint,
    reserve-y: uint,
    total-supply: uint,
    fee-rate: uint
  }
)

(define-map pool-by-tokens
  { token-x: principal, token-y: principal }
  { pool-id: uint }
)

(define-map lp-balances
  { pool-id: uint, owner: principal }
  { balance: uint }
)

;; Read-only functions
(define-read-only (get-pool (pool-id uint))
  (map-get? pools { pool-id: pool-id })
)

(define-read-only (get-pool-by-tokens (token-x principal) (token-y principal))
  (let ((sorted (sort-tokens token-x token-y)))
    (map-get? pool-by-tokens { token-x: (get token-x sorted), token-y: (get token-y sorted) })
  )
)

(define-read-only (get-lp-balance (pool-id uint) (owner principal))
  (default-to u0 (get balance (map-get? lp-balances { pool-id: pool-id, owner: owner })))
)

(define-read-only (get-reserves (pool-id uint))
  (let ((pool (unwrap! (get-pool pool-id) (err u0))))
    (ok { reserve-x: (get reserve-x pool), reserve-y: (get reserve-y pool) })
  )
)

(define-read-only (sort-tokens (token-x principal) (token-y principal))
  (if (< (to-int (unwrap-panic (principal-destruct? token-x)))
         (to-int (unwrap-panic (principal-destruct? token-y))))
    { token-x: token-x, token-y: token-y }
    { token-x: token-y, token-y: token-x }
  )
)

(define-read-only (quote-amount (amount-in uint) (reserve-in uint) (reserve-out uint))
  (if (or (is-eq amount-in u0) (is-eq reserve-in u0) (is-eq reserve-out u0))
    u0
    (/ (* amount-in reserve-out) reserve-in)
  )
)

(define-read-only (get-amount-out (amount-in uint) (reserve-in uint) (reserve-out uint))
  (if (or (is-eq amount-in u0) (is-eq reserve-in u0) (is-eq reserve-out u0))
    u0
    (let (
      (amount-in-with-fee (* amount-in FEE_NUMERATOR))
      (numerator (* amount-in-with-fee reserve-out))
      (denominator (+ (* reserve-in FEE_DENOMINATOR) amount-in-with-fee))
    )
      (/ numerator denominator)
    )
  )
)

(define-read-only (get-amount-in (amount-out uint) (reserve-in uint) (reserve-out uint))
  (if (or (is-eq amount-out u0) (is-eq reserve-in u0) (>= amount-out reserve-out))
    u0
    (let (
      (numerator (* (* reserve-in amount-out) FEE_DENOMINATOR))
      (denominator (* (- reserve-out amount-out) FEE_NUMERATOR))
    )
      (+ (/ numerator denominator) u1)
    )
  )
)

;; Private functions
(define-private (sqrt (n uint))
  (if (<= n u1)
    n
    (let ((initial (/ n u2)))
      (sqrt-iter n initial)
    )
  )
)

(define-private (sqrt-iter (n uint) (guess uint))
  (let ((new-guess (/ (+ guess (/ n guess)) u2)))
    (if (>= guess new-guess)
      new-guess
      (sqrt-iter n new-guess)
    )
  )
)

(define-private (min (a uint) (b uint))
  (if (< a b) a b)
)

;; Public functions

;; Create a new liquidity pool
(define-public (create-pool (token-x principal) (token-y principal) (fee-rate uint))
  (let (
    (sorted (sort-tokens token-x token-y))
    (existing (get-pool-by-tokens (get token-x sorted) (get token-y sorted)))
    (new-pool-id (var-get pool-nonce))
  )
    (asserts! (is-none existing) ERR_POOL_EXISTS)

    (map-set pools
      { pool-id: new-pool-id }
      {
        token-x: (get token-x sorted),
        token-y: (get token-y sorted),
        reserve-x: u0,
        reserve-y: u0,
        total-supply: u0,
        fee-rate: fee-rate
      }
    )

    (map-set pool-by-tokens
      { token-x: (get token-x sorted), token-y: (get token-y sorted) }
      { pool-id: new-pool-id }
    )

    (var-set pool-nonce (+ new-pool-id u1))

    (print { event: "pool-created", pool-id: new-pool-id, token-x: (get token-x sorted), token-y: (get token-y sorted) })
    (ok new-pool-id)
  )
)

;; Add liquidity to a pool
(define-public (add-liquidity
  (pool-id uint)
  (amount-x-desired uint)
  (amount-y-desired uint)
  (amount-x-min uint)
  (amount-y-min uint)
  (deadline uint)
)
  (let (
    (pool (unwrap! (get-pool pool-id) ERR_POOL_NOT_FOUND))
    (reserve-x (get reserve-x pool))
    (reserve-y (get reserve-y pool))
    (total-supply (get total-supply pool))
  )
    ;; Check deadline
    (asserts! (< block-height deadline) ERR_DEADLINE_EXPIRED)
    (asserts! (> amount-x-desired u0) ERR_ZERO_AMOUNT)
    (asserts! (> amount-y-desired u0) ERR_ZERO_AMOUNT)

    (let (
      (amounts (if (and (is-eq reserve-x u0) (is-eq reserve-y u0))
        ;; First liquidity provision
        { amount-x: amount-x-desired, amount-y: amount-y-desired }
        ;; Subsequent provisions - maintain ratio
        (let (
          (amount-y-optimal (quote-amount amount-x-desired reserve-x reserve-y))
        )
          (if (<= amount-y-optimal amount-y-desired)
            (begin
              (asserts! (>= amount-y-optimal amount-y-min) ERR_INSUFFICIENT_AMOUNT)
              { amount-x: amount-x-desired, amount-y: amount-y-optimal }
            )
            (let ((amount-x-optimal (quote-amount amount-y-desired reserve-y reserve-x)))
              (asserts! (<= amount-x-optimal amount-x-desired) ERR_INSUFFICIENT_AMOUNT)
              (asserts! (>= amount-x-optimal amount-x-min) ERR_INSUFFICIENT_AMOUNT)
              { amount-x: amount-x-optimal, amount-y: amount-y-desired }
            )
          )
        )
      ))
      (amount-x (get amount-x amounts))
      (amount-y (get amount-y amounts))
      (liquidity (if (is-eq total-supply u0)
        (- (sqrt (* amount-x amount-y)) MINIMUM_LIQUIDITY)
        (min
          (/ (* amount-x total-supply) reserve-x)
          (/ (* amount-y total-supply) reserve-y)
        )
      ))
    )
      (asserts! (> liquidity u0) ERR_INSUFFICIENT_LIQUIDITY)

      ;; Update pool state
      (map-set pools
        { pool-id: pool-id }
        (merge pool {
          reserve-x: (+ reserve-x amount-x),
          reserve-y: (+ reserve-y amount-y),
          total-supply: (+ total-supply liquidity)
        })
      )

      ;; Update LP balance
      (map-set lp-balances
        { pool-id: pool-id, owner: tx-sender }
        { balance: (+ (get-lp-balance pool-id tx-sender) liquidity) }
      )

      (print {
        event: "liquidity-added",
        pool-id: pool-id,
        sender: tx-sender,
        amount-x: amount-x,
        amount-y: amount-y,
        liquidity: liquidity
      })

      (ok { amount-x: amount-x, amount-y: amount-y, liquidity: liquidity })
    )
  )
)

;; Remove liquidity from a pool
(define-public (remove-liquidity
  (pool-id uint)
  (liquidity uint)
  (amount-x-min uint)
  (amount-y-min uint)
  (deadline uint)
)
  (let (
    (pool (unwrap! (get-pool pool-id) ERR_POOL_NOT_FOUND))
    (reserve-x (get reserve-x pool))
    (reserve-y (get reserve-y pool))
    (total-supply (get total-supply pool))
    (lp-balance (get-lp-balance pool-id tx-sender))
  )
    (asserts! (< block-height deadline) ERR_DEADLINE_EXPIRED)
    (asserts! (>= lp-balance liquidity) ERR_INSUFFICIENT_LIQUIDITY)

    (let (
      (amount-x (/ (* liquidity reserve-x) total-supply))
      (amount-y (/ (* liquidity reserve-y) total-supply))
    )
      (asserts! (>= amount-x amount-x-min) ERR_INSUFFICIENT_AMOUNT)
      (asserts! (>= amount-y amount-y-min) ERR_INSUFFICIENT_AMOUNT)

      ;; Update pool state
      (map-set pools
        { pool-id: pool-id }
        (merge pool {
          reserve-x: (- reserve-x amount-x),
          reserve-y: (- reserve-y amount-y),
          total-supply: (- total-supply liquidity)
        })
      )

      ;; Update LP balance
      (map-set lp-balances
        { pool-id: pool-id, owner: tx-sender }
        { balance: (- lp-balance liquidity) }
      )

      (print {
        event: "liquidity-removed",
        pool-id: pool-id,
        sender: tx-sender,
        amount-x: amount-x,
        amount-y: amount-y,
        liquidity: liquidity
      })

      (ok { amount-x: amount-x, amount-y: amount-y })
    )
  )
)

;; Swap tokens
(define-public (swap-exact-x-for-y
  (pool-id uint)
  (amount-x-in uint)
  (amount-y-min uint)
  (deadline uint)
)
  (let (
    (pool (unwrap! (get-pool pool-id) ERR_POOL_NOT_FOUND))
    (reserve-x (get reserve-x pool))
    (reserve-y (get reserve-y pool))
  )
    (asserts! (< block-height deadline) ERR_DEADLINE_EXPIRED)
    (asserts! (> amount-x-in u0) ERR_ZERO_AMOUNT)

    (let ((amount-y-out (get-amount-out amount-x-in reserve-x reserve-y)))
      (asserts! (>= amount-y-out amount-y-min) ERR_SLIPPAGE_EXCEEDED)
      (asserts! (< amount-y-out reserve-y) ERR_INSUFFICIENT_LIQUIDITY)

      ;; Update reserves
      (map-set pools
        { pool-id: pool-id }
        (merge pool {
          reserve-x: (+ reserve-x amount-x-in),
          reserve-y: (- reserve-y amount-y-out)
        })
      )

      (print {
        event: "swap",
        pool-id: pool-id,
        sender: tx-sender,
        amount-in: amount-x-in,
        amount-out: amount-y-out,
        direction: "x-to-y"
      })

      (ok amount-y-out)
    )
  )
)

(define-public (swap-exact-y-for-x
  (pool-id uint)
  (amount-y-in uint)
  (amount-x-min uint)
  (deadline uint)
)
  (let (
    (pool (unwrap! (get-pool pool-id) ERR_POOL_NOT_FOUND))
    (reserve-x (get reserve-x pool))
    (reserve-y (get reserve-y pool))
  )
    (asserts! (< block-height deadline) ERR_DEADLINE_EXPIRED)
    (asserts! (> amount-y-in u0) ERR_ZERO_AMOUNT)

    (let ((amount-x-out (get-amount-out amount-y-in reserve-y reserve-x)))
      (asserts! (>= amount-x-out amount-x-min) ERR_SLIPPAGE_EXCEEDED)
      (asserts! (< amount-x-out reserve-x) ERR_INSUFFICIENT_LIQUIDITY)

      ;; Update reserves
      (map-set pools
        { pool-id: pool-id }
        (merge pool {
          reserve-x: (- reserve-x amount-x-out),
          reserve-y: (+ reserve-y amount-y-in)
        })
      )

      (print {
        event: "swap",
        pool-id: pool-id,
        sender: tx-sender,
        amount-in: amount-y-in,
        amount-out: amount-x-out,
        direction: "y-to-x"
      })

      (ok amount-x-out)
    )
  )
)

;; Admin functions
(define-public (set-protocol-fee-recipient (new-recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set protocol-fee-recipient new-recipient)
    (ok true)
  )
)

(define-public (set-protocol-fee-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (<= new-rate u100) ERR_NOT_AUTHORIZED) ;; Max 1%
    (var-set protocol-fee-rate new-rate)
    (ok true)
  )
)
