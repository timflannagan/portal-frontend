#!/usr/bin/env bash
set -euo pipefail

IMAGE="portal-frontend:dev"
KIND_CLUSTER="kind"
NAMESPACE="portal-system"
DEPLOYMENT="portal-ui-internal-portal"
CONTAINER="portal-ui"
ROLLOUT_TIMEOUT="180s"
SKIP_BUILD=0
SKIP_LOAD=0

usage() {
  cat <<'EOF'
Build and deploy portal-frontend to a local Kind cluster.

Usage:
  ./hack/deploy-kind.sh [options]

Options:
  --image <name:tag>         Docker image tag to build and deploy.
                             Default: portal-frontend:dev
  --kind-name <name>         Kind cluster name. Default: kind
  --namespace <name>         Kubernetes namespace. Default: portal-system
  --deployment <name>        Deployment name. Default: portal-ui-internal-portal
  --container <name>         Container name in deployment. Default: portal-ui
  --rollout-timeout <dur>    Rollout timeout for kubectl. Default: 180s
  --skip-build               Skip docker build.
  --skip-load                Skip kind image load.
  -h, --help                 Show this help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      IMAGE="${2:?missing value for --image}"
      shift 2
      ;;
    --kind-name)
      KIND_CLUSTER="${2:?missing value for --kind-name}"
      shift 2
      ;;
    --namespace)
      NAMESPACE="${2:?missing value for --namespace}"
      shift 2
      ;;
    --deployment)
      DEPLOYMENT="${2:?missing value for --deployment}"
      shift 2
      ;;
    --container)
      CONTAINER="${2:?missing value for --container}"
      shift 2
      ;;
    --rollout-timeout)
      ROLLOUT_TIMEOUT="${2:?missing value for --rollout-timeout}"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --skip-load)
      SKIP_LOAD=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  echo "==> Building image: $IMAGE"
  docker build -t "$IMAGE" .
fi

if [[ "$SKIP_LOAD" -eq 0 ]]; then
  echo "==> Loading image into Kind cluster: $KIND_CLUSTER"
  kind load docker-image "$IMAGE" --name "$KIND_CLUSTER"
fi

echo "==> Updating deployment image"
kubectl -n "$NAMESPACE" set image \
  "deployment/$DEPLOYMENT" \
  "$CONTAINER=$IMAGE"

echo "==> Waiting for rollout"
kubectl -n "$NAMESPACE" rollout status \
  "deployment/$DEPLOYMENT" \
  --timeout="$ROLLOUT_TIMEOUT"

echo "==> Current deployment image"
kubectl -n "$NAMESPACE" get deployment "$DEPLOYMENT" \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="'"$CONTAINER"'")].image}'
echo
