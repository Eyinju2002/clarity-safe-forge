;; SafeForge Main Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-template-exists (err u101))
(define-constant err-template-not-found (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-code (err u104))

;; Data vars
(define-data-var admin principal contract-owner)

;; Data maps
(define-map templates 
  { template-id: uint }
  { 
    name: (string-ascii 64),
    code: (string-utf8 4096),
    creator: principal,
    verified: bool
  }
)

(define-map deployments
  { contract-id: uint }
  {
    template-id: uint,
    owner: principal,
    status: (string-ascii 20),
    timestamp: uint
  }
)

;; Helper functions
(define-private (validate-code (code (string-utf8 4096)))
  (match (find ";" code)
    found false  ;; Reject if contains comments
    (match (find "}" code)
      found true ;; Basic validation - must contain braces
      false
    )
  )
)

;; Template Management  
(define-public (register-template 
  (template-id uint) 
  (name (string-ascii 64))
  (code (string-utf8 4096)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) err-unauthorized)
    (asserts! (is-none (map-get? templates {template-id: template-id})) err-template-exists)
    (asserts! (validate-code code) err-invalid-code)
    (ok (map-set templates
      {template-id: template-id}
      {
        name: name,
        code: code,
        creator: tx-sender,  
        verified: false
      }
    ))
  )
)

;; Contract Deployment
(define-public (deploy-contract
  (template-id uint)
  (contract-id uint))
  (let ((template (unwrap! (map-get? templates {template-id: template-id}) err-template-not-found)))
    (ok (map-set deployments
      {contract-id: contract-id}
      {
        template-id: template-id,
        owner: tx-sender,
        status: "deployed",
        timestamp: block-height
      }
    ))
  )
)

;; Read only functions
(define-read-only (get-template (template-id uint))
  (map-get? templates {template-id: template-id})
)

(define-read-only (get-deployment (contract-id uint))
  (map-get? deployments {contract-id: contract-id})
)
