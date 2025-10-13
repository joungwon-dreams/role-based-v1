# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: Sign In
      - generic [ref=e6]: Enter your credentials to access your account
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Email
          - textbox "Email" [ref=e11]:
            - /placeholder: admin@example.com
            - text: superadmin@willydreams.com
        - generic [ref=e12]:
          - generic [ref=e13]: Password
          - generic [ref=e14]:
            - textbox "Password" [ref=e15]:
              - /placeholder: ••••••
              - text: Password123
            - button [ref=e16]:
              - img [ref=e17]
        - button "Sign In" [ref=e20]
      - generic [ref=e21]:
        - text: Don't have an account?
        - link "Sign up" [ref=e22] [cursor=pointer]:
          - /url: /signup
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - img [ref=e29]
  - alert [ref=e32]
```