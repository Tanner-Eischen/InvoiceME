# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - navigation "Skip navigation":
    - link "Skip to main content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - link "Skip to navigation" [ref=e4] [cursor=pointer]:
      - /url: "#navigation"
  - navigation "Main navigation" [ref=e5]:
    - generic [ref=e6]:
      - link "🏗️ Blueprint AI" [ref=e8] [cursor=pointer]:
        - /url: /
        - generic [ref=e9]: 🏗️
        - generic [ref=e10]: Blueprint AI
      - generic [ref=e11]:
        - link "Dashboard" [ref=e12] [cursor=pointer]:
          - /url: /
          - img [ref=e13]
          - generic [ref=e16]: Dashboard
        - link "Upload" [ref=e17] [cursor=pointer]:
          - /url: /upload
          - img [ref=e18]
          - generic [ref=e21]: Upload
        - link "My Blueprints" [ref=e22] [cursor=pointer]:
          - /url: /blueprints
          - img [ref=e23]
          - generic [ref=e25]: My Blueprints
      - generic [ref=e26]:
        - button "Settings" [ref=e27] [cursor=pointer]:
          - img [ref=e28]
        - button "User profile" [ref=e31] [cursor=pointer]:
          - img [ref=e32]
  - main "Main content" [ref=e36]:
    - generic [ref=e37]: 404 - Not Found
```