  ;; Cast a vote marking yourself as right or wrong, once per (session,voter).
  ;; `voter` is just a string handle to dedupe votes; pass any stable identifier you like.
  (defun vote (session-id:string voter:string right:bool)
    (ensure-session-exists session-id)
    (with-read sessions session-id {revealed}
      (ensure-revealed { 'revealed: revealed }))
    (let* ((k (make-vote-key session-id voter)))
      (enforce (not (contains votes k)) "You already voted on this session.")
      (write votes k
        { 'session-id: session-id
        , 'voter:      voter
        , 'right:      right
        , 'at:         (now)
        })
      true))

  (defun get-vote:object{vote} (session-id:string voter:string)
    (let ((k (make-vote-key session-id voter)))
      (enforce (contains votes k) "No vote for this (session,voter).")
      (at 'data (read votes k))))

  ;; Simple tally: returns an object {right: n, wrong: m}
  (defun get-tally:object{right:integer,wrong:integer} (session-id:string)
    (ensure-session-exists session-id)
    (let* ((all (filter
                  (lambda (kv)
                    (= (at 'session-id (at 'data kv)) session-id))
                  (keys votes)))
           (rs (fold
                 (lambda (acc k)
                   (let ((v (at 'data (read votes k))))
                     (if (at 'right v)
                       { 'right: (+ (at 'right acc) 1), 'wrong: (at 'wrong acc) }
                       { 'right: (at 'right acc), 'wrong: (+ (at 'wrong acc) 1) })))
                 { 'right: 0, 'wrong: 0 }
                 all)))
      rs))

  ;; Convenience: check if voting is open for a session
  (defun voting-open:bool (session-id:string)
    (ensure-session-exists session-id)
    (at 'revealed (read-session session-id)))