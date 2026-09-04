# Connector-authenticated main protection command

The `Enforce Main Protection` workflow accepts the exact `/protect-main PROTECT MAIN` command from either the repository owner directly or the ChatGPT Codex Connector only when GitHub attributes the comment to the repository owner, reports `author_association: OWNER`, and identifies the performing GitHub App as `chatgpt-codex-connector`.

This preserves the owner-only governance boundary while allowing the connected owner-authorized app to execute the already-governed protection path. The workflow continues to require `REPO_ADMIN_TOKEN`, the exact command, a normal issue (not a pull request), and live provider verification after applying protection.
