;; --------------------------------------------------------------------
;; Module: game-session
;; Pact smart contract for time-gated game session creation + voting + reveal
;; then community self-report voting of right/wrong after reveal.
;;
;; TODO: if user refuses result 3 times in a row all rewards get moved to treasury and account gets black-listed
;; TODO: add whitelist and max users on game creation
;; --------------------------------------------------------------------

(namespace 'free)

(define-keyset "free.game-admin-ks" (read-keyset "game-admin-ks")) 

(module game-session GOVERNANCE    
  ;; ------------------------------------------------------------------
  ;; Basic enviroment
  ;; ------------------------------------------------------------------
  (defconst CREATE-GAME-LOCK-AMOUNT:decimal 10.0) ;; amount of KDA user has to lock to create a new game session
  (defconst GRACE_DAYS:integer 1) ;; days after expiration after which funds get 'burned'
  (defconst RESULT_VOTING_QUORUM:decimal 0.8)
  (defconst MINIMUM_SESSION_OPTIONS:integer 2)
  (defconst PLAYER_REWARD_LOCK_TIME:integer 30)

  ;; ------------------------------------------------------------------
  ;; Governance
  ;; ------------------------------------------------------------------
  (defconst TREASURY_ACCOUNT:string (create-principal (create-user-guard (treasury-guard-predicate))))

  (defcap GOVERNANCE:bool () (enforce-keyset "free.game-admin-ks"))

  (defcap CREATORFUNDS_AVAILABLE:bool (session-id:string)
    (with-read creator-locked-balances session-id { 
        'unlocked := unlocked, 
        'slashed := slashed 
      }
        (enforce (not unlocked) "Funds already unlocked.")
        (enforce (not slashed) "Funds already slashed.")))

  (defcap ACCOUNT_GUARD:bool (account:string)
    (enforce-guard 
      (at "guard" (coin.details account))
    ))

  (defcap TREASURY:bool ()
    @doc "Internal capability allowing the module's code to operate the treasury."
    true
  )

  (defcap INTERNAL:bool () 
    @doc "Internal capability protecting some module's functions from direct external access."
    true
  )

  ;; ------------------------------------------------------------------
  ;; Schemas & Tables
  ;; ------------------------------------------------------------------
  (defschema session
    creator-account:    string
    name:               string
    description:        string
    expiration:         time       ;; when the creator is allowed to reveal
    options:            [string]
    correct:            integer    ;; index into options (-1 until reveal)
    participation-fee:  decimal
    result-voted:       bool
    invalidated:        bool
    creator-slashed:    bool
    total-winners:      integer
    result-released-at: time
    created-at:         time
  )

  (deftable sessions:{session})

  (defschema option_vote
    session-id:     string
    voter:          string
    option:         integer
    refunded:       bool
    redeemed-prize: bool
    slashed:        bool
    at:             time
  )

  (deftable option_votes:{option_vote})

  (defschema result_vote
    session-id:  string
    voter:       string
    right:       bool     ;; is the proposed game result by the session creator right?
    at:          time
  )

  (deftable result_votes:{result_vote})

  (defschema creator-locked
    owner-account: string
    amount:        decimal
    unlocked:      bool
    slashed:       bool
  )

  (deftable creator-locked-balances:{creator-locked})

  ;; ------------------------------------------------------------------
  ;; General Helpers
  ;; ------------------------------------------------------------------
  (defun now:time ()
    @doc "Get current block time"

    (at 'block-time (chain-data)))

  (defun make-vote-key:string (session-id:string voter:string)
    @doc "Generate a unique vote key"

    (format "{}|{}" [session-id voter]))

  (defun check-multiple-option-votes (vote-key:string)
     @doc "Check if account already voted for an option"

     (let ((vote-data (try {} (read option_votes vote-key))))
      (enforce
        (= {} vote-data)
        "Already voted on this session."
      )))

  (defun check-multiple-result-votes (vote-key:string)
     @doc "Check if account already voted for a result"

     (let ((vote-data (try {} (read result_votes vote-key))))
      (enforce
        (= {} vote-data)
        "Already voted on this session's result."
      )))

  (defun ensure-voter-participated (session-id:string voter:string)
      @doc "Check if the voter participated in the game session."

      (let ((voter-key (make-vote-key session-id voter))
        (voter-data (try {} (read option_votes voter-key))))
          (enforce
            (!= {} voter-data)
            "You didn't partecipate in this game session."
          )))

  (defun ensure-expired (s:object{session})
    (enforce (>= (now) (at 'expiration s))
      "Session has not yet expired; cannot reveal."))

  (defun ensure-not-expired (s:object{session})
    (enforce (< (now) (at 'expiration s))
      "Session has already expired."))

  (defun ensure-invalidated (s:object{session})
    (enforce (at 'invalidated s)
      "Session is still valid."))

  (defun ensure-not-invalidated (s:object{session})
    (enforce (not (at 'invalidated s))
      "Session is no longer valid."))

  (defun ensure-revealed (s:object{session})
    (enforce (>= (at 'correct s) 0)
      "Correct option is not revealed yet."))

  (defun ensure-not-revealed (s:object{session})
    (enforce (= (at 'correct s) -1)
      "Correct option already revealed."))

  (defun ensure-voter-not-creator (s:object{session} voter-account:string)
    (enforce (!= (at 'creator-account s) voter-account)
      "Game session creator can't vote."))

  (defun ensure-index-in-range (opts:[string] idx:integer)
    (enforce (and (>= idx 0) (< idx (length opts)))
      "Correct index out of range."))

  (defun ensure-result-voted (s:object{session})
    (enforce (at 'result-voted s)
      "Result voting is still open."))

  (defun ensure-result-not-voted (s:object{session})
    (enforce (not (at 'result-voted s))
      "Result voting is completed for this session."))

  (defun count-option-votes (session-id:string)
    (let ((votes (select option_votes ['session-id] (where 'session-id (= session-id)))))
        (length votes)))

  (defun count-result-votes (session-id:string)
    (let ((votes (select result_votes ['session-id] (where 'session-id (= session-id)))))
        (length votes)))

  (defun slash-creator-funds (session-id:string)
    @doc "Slash game session creator locked funds."

    (require-capability (INTERNAL))

    (with-capability (CREATORFUNDS_AVAILABLE session-id)
      (update creator-locked-balances session-id { 'slashed: true })))

  ;; ------------------------------------------------------------------
  ;; Transaction Helpers
  ;; ------------------------------------------------------------------
  (defun treasury-guard-predicate:bool ()
    @doc "The predicate for the game treasury user-guard. Only TREASURY can debit it."
    (require-capability (TREASURY))
    true
  )

  (defun deposit-to-treasury (sender:string amount:decimal)
    @doc "Deposit funds to treasury"

    (require-capability (INTERNAL))

    (coin.transfer sender TREASURY_ACCOUNT amount)

    true)

  (defun withdraw-from-treasury (receiver:string amount:decimal)
    @doc "Withdraw funds from treasury"

    (require-capability (INTERNAL))

    (with-capability (TREASURY)
      (coin.transfer TREASURY_ACCOUNT receiver amount)
      true))

  ;; ------------------------------------------------------------------
  ;; Public API
  ;; ------------------------------------------------------------------
  (defun create-session
    (session-id:string
     name:string
     description:string
     expiration:string
     options:[string]
     participation-fee:decimal
     creator-account:string)
     @doc "Create a session. The caller provides their guard (`creator-ks`) so only they can reveal."

    (let ((session-data (try {} (get-session session-id))))
      (enforce
        (= {} session-data)
        "Session ID already exists."
      )
    )

    (enforce (>= (length options) MINIMUM_SESSION_OPTIONS)
      (format "Provide at least {} options." [MINIMUM_SESSION_OPTIONS]))

    (enforce (> (diff-time (time expiration) (now)) 0.0)
          "Expiration must be in the future.")

    (enforce (> participation-fee 0.0)
      "Participation fee must be greater then 0.")

    (with-capability (INTERNAL) 
      (deposit-to-treasury creator-account CREATE-GAME-LOCK-AMOUNT))

    (write creator-locked-balances session-id
      { 'owner-account: creator-account
      , 'amount:        CREATE-GAME-LOCK-AMOUNT
      , 'unlocked:      false
      , 'slashed:       false
      })

    (write sessions session-id
      { 'creator-account:    creator-account
      , 'name:               name
      , 'description:        description
      , 'expiration:         (time expiration)
      , 'options:            options
      , 'correct:            -1
      , 'participation-fee:  participation-fee
      , 'result-voted:       false
      , 'invalidated:        false
      , 'creator-slashed:    false
      , 'total-winners:      0
      , 'result-released-at: (time "1990-09-01T00:00:00Z") ;; default time, counts as null
      , 'created-at:         (now)
      })

    (get-session session-id)
  )

  (defun vote-option (session-id:string voter-account:string option-index:integer)
    @doc "Cast a vote with the option you think is gonna be correct."

    ;; Validate option
    (let* ((current-session (get-session session-id)) 
      (key (make-vote-key session-id voter-account))
      (fee (at 'participation-fee current-session)))
 
        ;; Check if option exists
        (ensure-index-in-range (at 'options current-session) option-index)

        ;; Check that voting is still allowed
        (ensure-not-expired current-session)
        (ensure-not-invalidated current-session)
        (ensure-not-revealed current-session)

        ;; Check for double voting or creator voting
        (ensure-voter-not-creator current-session voter-account)
        (check-multiple-option-votes key)
        
        ;; Pay participation fee
        (with-capability (INTERNAL) 
          (deposit-to-treasury voter-account fee))
          
        (write option_votes key
          { 'session-id:     session-id
          , 'voter:          voter-account
          , 'option:         option-index
          , 'refunded:       false
          , 'redeemed-prize: false
          , 'slashed:        false
          , 'at:             (now)
          })
        true))

  (defun reveal-correct (session-id:string correct-index:integer)
      @doc "Allows the session creator to submit a correct answer for the game session."

      (let ((current-session (get-session session-id)))
        ;; Check if operation is possible at this point in time
        (enforce (< (now) (add-time (at 'expiration current-session) (days GRACE_DAYS)))
          "Too late to reveal.")

        (with-capability (ACCOUNT_GUARD (at 'creator-account current-session))
          (ensure-expired current-session)
          (ensure-not-revealed current-session)
          (ensure-index-in-range (at 'options current-session) correct-index)

          (let ((votes (select option_votes (where 'session-id (= session-id))))
            (winners (filter (lambda (v) (= (at 'option v) correct-index)) votes)))

            (update sessions session-id { 
              'correct: correct-index, 
              'total-winners: (length winners), 
              'result-released-at: (now) 
            }))
          
          (get-session session-id))))

  (defun vote-result (session-id:string voter-account:string is-right:bool)
      @doc "Allows users who pareticpated to vote if the session creator chosen result is correct or not."

      (let* ((current-session (get-session session-id))
        (vote-key (make-vote-key session-id voter-account)))

        (ensure-voter-not-creator current-session voter-account)
        (ensure-result-not-voted current-session)
        (ensure-not-invalidated current-session)
        (ensure-expired current-session)
        (ensure-revealed current-session)
        (ensure-voter-participated session-id voter-account)
        (check-multiple-result-votes vote-key)

        ;; Check if result voting period is over
        (enforce (>= (add-time (at 'result-released-at current-session) (days GRACE_DAYS)) (now))
          "Result voting period is over.")

        (write result_votes vote-key
                { 'session-id:  session-id
                , 'voter:       voter-account
                , 'right:       is-right
                , 'at:          (now)
                })
        true))

  (defun handle-session-invalidation (session-id:string)
    @doc "Check if the game creator did or didn't publish a correct answer to the game session and to check if at least 1 player participated in the voting."
    
    (require-capability (INTERNAL))
    
    (let* ((current-session (get-session session-id)))      
      ;; Check if the game is already over
      (if (or (at 'invalidated current-session) (at 'result-voted current-session))
        "The game was already settled."

        (do 
          ;; Check if expiration date was reached
          (if (<= (at 'expiration current-session) (now))
            true
            (enforce false "Games session expiration date not reached."))

          ;; Check if at least 1 player voted
          (if (<= (count-option-votes session-id) 0)
            (do
              (update sessions session-id { 'invalidated: true })
              "No votes, game refunded.")

            (do
              ;; Check result publishing grace time
              (enforce (<= (add-time (at 'expiration current-session) (days GRACE_DAYS)) (now))
                "Creator has still time to publish.")

              ;; Check if game session creator submitted an answer
              (enforce (= (at 'correct current-session) -1)
                "Creator has published a result in time.")

              (with-capability (INTERNAL)
                (slash-creator-funds session-id))

              (update sessions session-id { 'invalidated: true, 'creator-slashed: true })

              "Game invalidated."))))))

  (defun check-result-voting-ended (session-id:string)
    @doc "Function that gets called off-chain regularly to handle game session closure."

    (let* ((current-session (get-session session-id)))
      ;; Check if the game is already over
      (enforce (and (not (at 'invalidated current-session)) (not (at 'result-voted current-session)))
        "The game was already settled.")

      ;; Check if result voting period is over
      (enforce (<= (add-time (at 'result-released-at current-session) (days GRACE_DAYS)) (now))
         "There is still time to vote."))

    ;; Check if quorum is reached to proceed with the game reward distribution else refund
    (let ((total-option-votes (count-option-votes session-id))
          (total-result-votes (count-result-votes session-id)))
      (enforce (> (dec total-option-votes) 0.0) "No available option votes for this session.")
      
      (if (< (/ (dec total-result-votes) (dec total-option-votes)) RESULT_VOTING_QUORUM)
          (do     
            (update sessions session-id { 'invalidated: true })
            "Quorum not reached.")

            ;; Check if the majority of users agree or not with the proposed result
            (let ((result-votes (select result_votes ['right] (where 'session-id (= session-id)))))
              (let ((rights (map (at 'right) result-votes)))
                (let* ((t-count (length (filter identity rights)))
                  (f-count (length (filter not rights))))
                    (if (> t-count f-count)
                      (do
                        (update sessions session-id { 'result-voted: true })
                        "Voting successful.")

                      (do                
                        (update sessions session-id { 'invalidated: true })
                        "Result vote refused."))))))))

  (defun claim-creator-funds (session-id:string)
    @doc "Called off-chain by the game session creator to unlock his funds and get them back if game invalidation wasn't his fault or if the game ended successfully."

    (with-capability (INTERNAL)
      (handle-session-invalidation session-id))
    
    (with-read creator-locked-balances session-id { 
      'amount := amount, 
      'owner-account := account, 
      'unlocked := unlocked, 
      'slashed := slashed 
    }
      (with-capability (ACCOUNT_GUARD account)
        (enforce (not slashed) "Funds already slashed.")
        (enforce (not unlocked) "Funds already claimed.")

        (let ((current-session (get-session session-id)))
          (enforce (or (at 'invalidated current-session) (at 'result-voted current-session))
            "Creator funds are locked until the session is settled."))

        (with-capability (INTERNAL)
          (withdraw-from-treasury account amount))

        (update creator-locked-balances session-id { 'unlocked: true }))
    true))

  (defun claim-refund (session-id:string voter-account:string)
    @doc "Called off-chain by the player to get a refund on an invalidated game session."

    (with-capability (INTERNAL)
      (handle-session-invalidation session-id))
      
    (let ((key (make-vote-key session-id voter-account)) 
      (vote (try {} (read option_votes key))) 
      (current-session (get-session session-id)))     
        (enforce (!= vote {}) 
          "Player vote does not exist.")

        (with-capability (ACCOUNT_GUARD (at 'voter vote))
          (ensure-invalidated current-session)

          (enforce (not (at 'refunded vote))
            "Player already refunded.")

          (let ((amount (at 'participation-fee current-session))
            (account (at 'voter vote)))
              (with-capability (INTERNAL)
                (withdraw-from-treasury account amount))

              (update option_votes key { 'refunded: true })))
        true))

  (defun claim-player-reward (session-id:string voter-account:string)
    @doc "Gets called off-chain by the player to handle player rewards distribution after locked period is over."

    (let* ((key (make-vote-key session-id voter-account))
      (vote (try {} (read option_votes key)))
      (current-session (get-session session-id)) 
      (correct-option (at 'correct current-session)))

      (enforce (!= vote {}) 
        "Player vote does not exist.")
      
      (with-capability (ACCOUNT_GUARD (at 'voter vote))
        (ensure-not-invalidated current-session)
        (ensure-result-voted current-session)

        (enforce (not (at 'redeemed-prize vote)) 
          "Reward already redeemed.")

        (enforce (not (at 'slashed vote)) 
          "Reward already slashed for continuous result voting refusal.")

        (enforce (<= (add-time (at 'result-released-at current-session) (days PLAYER_REWARD_LOCK_TIME)) (now)) 
          (format "Reward lock period of {} days is not passed yet." [PLAYER_REWARD_LOCK_TIME]))
        
        (if (!= (at 'option vote) correct-option)
          (enforce false "Player did not get the result right.")
          (let ((total-prize (* (at 'participation-fee current-session) (count-option-votes session-id))) 
            (reward (/ total-prize (dec (at 'total-winners current-session)))) 
            (voter-account (at 'voter vote)))

            (with-capability (INTERNAL)
              (withdraw-from-treasury voter-account reward))

              (update option_votes key { 'redeemed-prize: true })
      true)))))

  ;; ------------------------------------------------------------------
  ;; Query helpers
  ;; ------------------------------------------------------------------
  (defun get-session:object{session} (session-id:string)
    @doc "Get the request session object by session id."

    (let ((current-session (try {} (read sessions session-id))))
      (enforce
        (!= {} current-session)
        "Session does not exist."
      )
    current-session))

  (defun get-vote:object{option_vote} (session-id:string voter:string)
    @doc "Get the vote object for a specific voter on a specific session."

    (get-session session-id)
    (let ((key (make-vote-key session-id voter)))
        (let ((vote-data (try {} (read option_votes key))))
            (enforce
                (!= {} vote-data)
                 "Vote not found."
            )
            vote-data
        )))

  (defun get-session-votes:[object{option_vote}] (session-id:string)
    @doc "Get all the option votes for a specific session."

    (get-session session-id)
    (select option_votes (where 'session-id (= session-id))))

  (defun get-all-sessions:[object{session}] (expired:bool)
    @doc "Get all the sessions filtered by expiry."

    (if expired
      (select sessions (where 'expiration (< (now))))
      (select sessions (where 'expiration (> (now))))))
)

;; Init contract
(if (read-msg "upgrade")
  "skipped tables creation during upgrade" 
  
  (do 
    (create-table sessions)
    (create-table option_votes)
    (create-table result_votes)

    (create-table creator-locked-balances)

    (let ((guard (create-user-guard (free.game-session.treasury-guard-predicate))))
      (coin.create-account TREASURY_ACCOUNT guard)
    )
    
    true)
)
