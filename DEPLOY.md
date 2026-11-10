# Deploying SecondShelf

Live URL: **https://team19.xtradot.co** · Namespace: `team19` · Image: `ghcr.io/uxforger/secondshelf:<short-sha>`

No Docker needed. GitHub Actions builds the image; you only run `kubectl`.

## One-time setup (per teammate)

1. Get `team19.yml` (the kubeconfig) from the team lead through a password manager. **Never commit it, paste it in chat, or email it.**
2. Put it outside the repo and lock it down:
   - macOS/Linux: `mkdir -p ~/forge && mv ~/Downloads/team19.yml ~/forge/ && chmod 600 ~/forge/team19.yml`
   - Windows (Git Bash): `mkdir -p ~/forge && mv ~/Downloads/team19.yml ~/forge/`, then in PowerShell: `icacls $env:USERPROFILE\forge\team19.yml /inheritance:r /grant:r "$($env:USERNAME):F"`
3. Install kubectl 1.30+ (Windows: `winget install -e --id Kubernetes.kubectl`).
4. Point kubectl at it (every new terminal):
   ```bash
   export KUBECONFIG=~/forge/team19.yml
   kubectl get pods        # works = you have access
   ```

## Release a new version

1. Push to the `redesign` branch:
   ```bash
   git push origin redesign
   ```
2. Wait for the green tick on **GitHub → Actions → build**. Its summary shows the tag, e.g. `ghcr.io/uxforger/secondshelf:a1b2c3d`. The tag is always the short commit SHA:
   ```bash
   SHA=$(git rev-parse --short=7 HEAD)
   ```
3. Deploy that exact tag (never `latest`):
   ```bash
   sed "s/IMAGE_TAG/$SHA/" k8s/app.yaml | kubectl apply -f -
   kubectl rollout status deployment/app
   ```
4. Check:
   ```bash
   curl -I https://team19.xtradot.co          # 200
   curl -s https://team19.xtradot.co/api/info # {"bank":"sandbox","demo":false}
   ```

## Roll back

```bash
kubectl rollout undo deployment/app          # previous version
kubectl rollout status deployment/app
```
Or pin a known-good tag: `sed "s/IMAGE_TAG/<old-sha>/" k8s/app.yaml | kubectl apply -f -`.

Data is safe either way: it lives on the `app-data` volume (`/data/secondshelf.db`), not in the image.

## Current platform workarounds (10 Nov)

- **Storage:** the platform can't create volumes ("outstanding balance on your account"). The live deployment is patched to keep `/data` in pod-local storage, so demo data resets if the pod restarts. Release with `kubectl set image` (keeps the patch):
  ```bash
  kubectl set image deployment/app app=ghcr.io/uxforger/secondshelf:$SHA
  kubectl rollout status deployment/app
  ```
  Once the platform fixes billing, `sed "s/IMAGE_TAG/$SHA/" k8s/app.yaml | kubectl apply -f -` restores the persistent volume (claim `app-data` is waiting).
- **Public URL:** Cloudflare Access sits in front of `team19.xtradot.co` and asks for a login. Test through a tunnel meanwhile:
  ```bash
  kubectl port-forward deploy/app 18080:8080   # then open http://127.0.0.1:18080
  ```

## Day-to-day

```bash
kubectl get pods                       # status
kubectl logs deploy/app -f             # live logs ([bank] lines show each bank call; never keys)
kubectl logs deploy/app --previous     # logs from the last crash
kubectl describe pod -l app=app        # why a pod won't start
kubectl rollout restart deployment/app # restart (e.g. after the team key is rotated)
```

| Symptom | Fix |
| --- | --- |
| `ImagePullBackOff` | The GHCR package isn't public, or the tag doesn't exist yet (build still running). |
| `CrashLoopBackOff` | `kubectl logs deploy/app --previous` |
| Pod `Pending`, "exceeded quota" | Lower `resources.requests`; namespace max is 400m CPU / 768Mi. |
| 502/503 on the URL | Pod not ready yet; `kubectl get endpoints app`. |
| Bank calls fail with 401 | Secret `huawei-gateway` missing; check `kubectl get secret huawei-gateway` (don't print it). |

## Switches (env vars in `k8s/app.yaml`)

| Var | Default | Meaning |
| --- | --- | --- |
| `DEMO_MODE` | `false` in the cluster | `true` = mock bank (same flows, no sandbox calls). Use if the sandbox is down on demo day. |
| `PUBLIC_URL` | `https://team19.xtradot.co` | Where the hosted checkout sends buyers back. |
| `WEBHOOK_URL` | `http://app.team19.svc.cluster.local/api/hooks/forge` | Registered once with the bank on first start. |
| `DISTRIBUTOR_ACCOUNT` | `0123456790` | The one demo trader: Babatunde Olumide Adeyemi trading as Ade Foods. Receives payouts, is read for the Passport, applies for the loan. |
| `BANK_MERCHANT_ID` | `mer_204` | Collections merchant (onboarding isn't available in the sandbox). |
| `SETTLEMENT_ACCOUNT` | `0123456789` | Funds payouts (order payouts and carbon share). |
| `LOAN_ACCOUNT` / `LOAN_BVN` | same as `DISTRIBUTOR_ACCOUNT` / `22200000002` | Stock-loan applicant (the bank needs a BVN). |
| `CONSENT_PHONE` | unset | Overrides the holder phone from spec v2 test data (`+2348051234502` for `0123456790`). |
| `CARBON_PROJECT_TYPE` | unset | Set to a sandbox type to use the real carbon registry; unset = simulated, labelled. |
| `CARBON_PRICE_NGN` | `25000` | Credit value per tCO₂e when the registry doesn't price it. |

To flip to mock quickly: `kubectl set env deployment/app DEMO_MODE=true` (and back with `false`).

## Reset demo data

In the app: Profile → Reset (all devices). Bank sandbox only: it resets on platform restarts; our own records stay in SQLite.

## First deploy (already done once)

The pipeline was proven with a tiny hello image before the real app:
```bash
sed "s/IMAGE_TAG/hello-$SHA/" k8s/hello.yaml | kubectl apply -f -
```
