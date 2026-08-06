# Deploying Space Town to st.unfalsecoding.net

**Approach:** the build runs locally (or in GitHub Actions), and only the finished `dist/` is rsynced to the droplet. The droplet never builds anything — it just runs Node under systemd behind Nginx as a reverse proxy.

**Assumed already done:** an `st` A record pointing at the droplet IP; Nginx and certbot installed (they came with the main site).

Placeholders to replace: `YOUR_USER` (output of `whoami` on the droplet), `DROPLET_IP`, `NODE_PATH` (output of `which node` on the droplet).

---

# Part 1. One-time server setup

## 1.1. Check DNS

```bash
dig st.unfalsecoding.net +short
```

This must return the droplet IP. If it's empty, stop here — certbot in step 5.2 will fail.

## 1.2. Swap (optional)

No longer needed for building, since the build moved off the droplet. Still worth having as a safety net on a 1 GB box. Skip if `free -h` already shows swap.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 1.3. Node

```bash
which node && node -v
```

If it isn't installed:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Yarn is also needed, for installing production dependencies. Install it through corepack, **as root, once**:

```bash
sudo npm rm -g yarn 2>/dev/null   # only if yarn 1 was previously installed via npm
sudo corepack enable
```

Corepack drops a shim at `/usr/bin/yarn` that reads the `packageManager` field from the project's `package.json` and fetches the matching version on demand. The server's yarn version will therefore always match yours.

Do not put `corepack enable` in `deploy.sh` — run as a normal user it fails with `EACCES: permission denied, symlink ... /usr/bin/pnpm`, because it writes to a system directory.

Verify as the user you deploy with:

```bash
ssh YOUR_USER@DROPLET_IP 'cd /opt/space-town && yarn --version'
```

The first run downloads yarn into `~/.cache/node/corepack` — that's expected.

**Note the node version** — it must be at least as new as the one you build against locally. Install node system-wide rather than through nvm: an nvm path in `ExecStart` breaks on the next node upgrade.

## 1.4. Directory

```bash
sudo mkdir -p /opt/space-town/dist
sudo chown -R $USER:$USER /opt/space-town
```

No `git clone` on the server — source code never lands here anymore.

## 1.5. The .env file

Lives **on the server only**. It is not part of the deploy and is not committed to git.

```bash
nano /opt/space-town/.env
```

```
NODE_ENV=production
PORT=3000
```

## 1.6. Passwordless SSH key

Locally:

```bash
ssh-keygen -t ed25519 -C "deploy"        # if you don't have a key yet
ssh-copy-id YOUR_USER@DROPLET_IP
ssh YOUR_USER@DROPLET_IP                 # should log in without a password
```

## 1.7. Allow restarting the service without a password

On the droplet:

```bash
which systemctl                          # usually /usr/bin/systemctl
sudo visudo -f /etc/sudoers.d/spacetown
```

```
YOUR_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart spacetown
```

The rule is deliberately narrow — one command, not blanket sudo. Without it, `deploy.sh` will hang on a password prompt.

---

# Part 2. Project setup (local)

## 2.1. Port and host in code

In the server entry point:

```js
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => console.log(`listening on ${PORT}`));
```

The second argument is essential. Without it Node binds to `0.0.0.0` and the game is reachable at `IP:3000` directly, bypassing Nginx and TLS.

## 2.2. Build

Nothing to change — the existing commands are used:

```bash
yarn build && yarn compile
```

Webpack stays as is. It's heavy, but it now runs on your machine, where memory isn't scarce.

The one thing to verify is **where both commands write their output**. `deploy.sh` syncs the `dist/` directory; if `yarn compile` writes server code to `build/` or `out/`, either fix the paths in the script (step 2.4) or point both commands at a single output directory.

```bash
yarn build && yarn compile && ls -R dist/
```

Confirm the output contains both the client bundle with `index.html` and the server entry point.

## 2.3. node_modules on the server

They're required. `tsc` compiles but doesn't bundle: the compiled code still contains `require('express')` and other external dependencies, and webpack only bundles the client side.

So `package.json` and `yarn.lock` ship to the droplet too, and dependencies are installed there — but **production only**, without webpack and the rest of the dev tooling:

```bash
yarn workspaces focus --production
```

Installing packages barely uses memory — the problem was the build itself, and that's gone. This is already wired into `deploy.sh` below.

> Yarn is installed on the droplet through corepack — see step 1.3.

## 2.4. Deploy script

`deploy.sh` in the repository root:

```bash
#!/usr/bin/env bash
set -e

HOST=YOUR_USER@DROPLET_IP
DEST=/opt/space-town

yarn build
yarn compile

rsync -avz --delete dist/ $HOST:$DEST/dist/
rsync -avz package.json yarn.lock $HOST:$DEST/

ssh $HOST "cd $DEST && yarn workspaces focus --production && sudo systemctl restart spacetown"
echo "OK: https://st.unfalsecoding.net"
```

```bash
chmod +x deploy.sh
```

`set -e` aborts on the first error — without it a failed build would still ship to the server. `--delete` clears out files no longer present in a fresh build; otherwise stale assets accumulate for years.

`yarn workspaces focus --production` installs `dependencies` only, skipping `devDependencies`. In yarn 4 this replaces the deprecated `yarn install --production`; the workspace-tools plugin ships with yarn, and no monorepo is required. If you'd rather have lockfile immutability checks, use `yarn install --immutable` — but then dev dependencies land on the server too.

Note that `--delete` applies to `dist/` only. The `/opt/space-town` directory as a whole is never synced — that would wipe `.env` and `node_modules`.

---

# Part 3. First deploy

```bash
./deploy.sh
```

`systemctl restart` will predictably complain at this point — the service doesn't exist yet; it's created in part 4. The files will have arrived regardless. Check:

```bash
ssh YOUR_USER@DROPLET_IP 'ls -la /opt/space-town/dist/'
```

---

# Part 4. systemd

On the droplet:

```bash
sudo nano /etc/systemd/system/spacetown.service
```

```ini
[Unit]
Description=Space Town game server
After=network.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/opt/space-town
ExecStart=NODE_PATH dist/server/index.js
EnvironmentFile=/opt/space-town/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`EnvironmentFile` requires strict `KEY=value` lines — no `export`, no quotes; systemd doesn't understand shell syntax.

The `dist/server/index.js` path in `ExecStart` is relative and resolves against `WorkingDirectory`. If you change one, check the other.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now spacetown
sudo systemctl status spacetown
```

`daemon-reload` is needed after every edit to the unit file.

Verify:

```bash
sudo ss -tlnp | grep 3000     # expect 127.0.0.1:3000, not *:3000
curl -I http://127.0.0.1:3000
```

---

# Part 5. Nginx and TLS

## 5.1. Config (HTTP only at first)

No SSL directives here: Nginx won't start with an `ssl_certificate` pointing at a file that doesn't exist yet.

```bash
sudo nano /etc/nginx/sites-available/spacetown
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name st.unfalsecoding.net;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/spacetown /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
curl -I http://st.unfalsecoding.net
```

The response should come from the game. If you get the main site's page instead, the `Host` header didn't match `server_name` and the request fell through to `default_server`.

## 5.2. Certbot

```bash
sudo certbot --nginx -d st.unfalsecoding.net
```

This issues a separate certificate under `/etc/letsencrypt/live/st.unfalsecoding.net/`, independent of the main site's. Answer **redirect** when asked. The plugin adds `listen 443 ssl`, the certificate paths, and the port-80 redirect on its own.

```bash
sudo certbot renew --dry-run
sudo systemctl list-timers | grep certbot
```

Optional — restore HTTP/2: in the `listen 443 ssl` block add `http2 on;` (Nginx 1.25+) or change the line to `listen 443 ssl http2;` (older versions), then `sudo nginx -t && sudo systemctl reload nginx`.

## 5.3. Final check

```bash
curl -I https://st.unfalsecoding.net       # 200
curl -I http://st.unfalsecoding.net        # 301 to https
sudo ss -tlnp | grep 3000                  # 127.0.0.1:3000
```

Open it in a browser and check the console for 404s on assets.

---

# Part 6. Updating

```bash
./deploy.sh
```

That's it. The build runs on your machine, the finished `dist/` ships to the server, and the service restarts itself.

---

# Part 7. GitHub Actions (optional)

Auto-deploy on push to main. Builds run on GitHub runners — 7 GB of memory, free for public repositories.

## 7.1. A dedicated CI key

Locally:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gh_deploy -N ""
ssh-copy-id -i ~/.ssh/gh_deploy.pub YOUR_USER@DROPLET_IP
cat ~/.ssh/gh_deploy
```

A separate key rather than your personal one: if it leaks, it can be revoked independently.

## 7.2. Secrets

Settings → Secrets and variables → Actions → New repository secret:

- `SSH_PRIVATE_KEY` — the entire contents of `~/.ssh/gh_deploy`, including the `-----BEGIN...` and `-----END...` lines
- `SSH_HOST` — the droplet IP
- `SSH_USER` — your user on the droplet

## 7.3. Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - run: corepack enable

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - run: yarn install --immutable

      - run: yarn build
      - run: yarn compile

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy
        env:
          HOST: ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}
        run: |
          rsync -avz --delete dist/ $HOST:/opt/space-town/dist/
          rsync -avz package.json yarn.lock $HOST:/opt/space-town/
          ssh $HOST "cd /opt/space-town && yarn workspaces focus --production && sudo systemctl restart spacetown"
```

Step order matters: `corepack enable` must come **before** `setup-node` with `cache: 'yarn'`, or caching won't find the right yarn version.

Set `node-version` to match the droplet. `workflow_dispatch` adds a manual run button on the Actions tab — deploy without a commit.

CI uses `yarn install --immutable` (dev dependencies are needed to build), while the server uses `yarn workspaces focus --production`. These are different environments, and the commands should differ.

---

# Troubleshooting

**Service restarts in a loop**

```bash
sudo journalctl -u spacetown -n 50 --no-pager
```

Usually: a wrong path in `ExecStart`, the wrong entry-point file in `dist/`, or `User=` lacking permissions on the directory.

**502 Bad Gateway** — Nginx is up, Node isn't. Check `sudo systemctl status spacetown` and `sudo ss -tlnp | grep 3000`.

**`Cannot find module`** — dependencies didn't install on the server, or the package is declared under `devDependencies` while only production deps are installed. Check `ls /opt/space-town/node_modules` and which section declares the package.

**`Unexpected token` on startup** — `target` in `tsconfig.json` is newer than the node version on the droplet. Compare against `node -v` on the server.

**Files not found at runtime** — either `yarn compile` wrote output somewhere other than `dist/`, or the server code resolves static paths relative to a different directory than `WorkingDirectory`. Check `ls -R /opt/space-town/dist/`.

**`EACCES: permission denied, symlink ... /usr/bin/pnpm`** — `corepack enable` ran as a non-root user. It's a one-time setup step (1.3) and doesn't belong in `deploy.sh`.

**`This project's package.json defines packageManager: yarn@...`** — corepack isn't enabled on the server, or `package.json` never arrived. Check `ls /opt/space-town/package.json`.

**deploy.sh asks for a password** — the sudoers rule didn't take (step 1.7). Make sure the systemctl path in the file matches `which systemctl`.

**Host key verification failed in Actions** — `ssh-keyscan` was skipped.

**Port 3000 reachable from outside** — the code is missing `'127.0.0.1'` as the second argument to `app.listen()` (step 2.1).

**Live logs**

```bash
sudo journalctl -u spacetown -f
sudo tail -f /var/log/nginx/error.log
```

---

# Rollback

There's no built-in procedure: only the current version exists on the server. The quick path is to check the code out locally (`git checkout <commit>`) and run `./deploy.sh`.

If you need instant rollbacks, change `deploy.sh` to sync into a dated directory (`dist-2026-08-06/`) and point a `dist` symlink at it — then rolling back is just repointing the symlink and running `systemctl restart`.
