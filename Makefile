IMAGE ?= portal-frontend:dev
REPO_IMAGE ?= ghcr.io/timflannagan/portal-frontend
DEBUG_TAG ?= debug-copy-local
NO_CACHE ?= 0
KIND_NAME ?= kind
CLUSTER_NAME ?= $(KIND_NAME)
NAMESPACE ?= portal-system
DEPLOYMENT ?= portal-ui-internal-portal
CONTAINER ?= portal-ui
ROLLOUT_TIMEOUT ?= 180s

DOCKER_NO_CACHE_FLAG :=
ifeq ($(NO_CACHE),1)
DOCKER_NO_CACHE_FLAG := --no-cache
endif

.PHONY: help build-image kind-load refresh-kind-image deploy-debug deploy-kind deploy-kind-fast

help:
	@echo "Targets:"
	@echo "  make build-image       Build local docker image only"
	@echo "  make kind-load         Load image into Kind only"
	@echo "  make refresh-kind-image  Build + load image into Kind only"
	@echo "  make deploy-debug      No-cache build + load + set image + rollout"
	@echo "  make deploy-kind       Build, load, and deploy image to local Kind"
	@echo "  make deploy-kind-fast  Deploy using existing local image (skip build/load)"
	@echo ""
	@echo "Variables (override with VAR=value):"
	@echo "  IMAGE=$(IMAGE)"
	@echo "  REPO_IMAGE=$(REPO_IMAGE)"
	@echo "  DEBUG_TAG=$(DEBUG_TAG)"
	@echo "  NO_CACHE=$(NO_CACHE)"
	@echo "  KIND_NAME=$(KIND_NAME)"
	@echo "  CLUSTER_NAME=$(CLUSTER_NAME)"
	@echo "  NAMESPACE=$(NAMESPACE)"
	@echo "  DEPLOYMENT=$(DEPLOYMENT)"
	@echo "  CONTAINER=$(CONTAINER)"
	@echo "  ROLLOUT_TIMEOUT=$(ROLLOUT_TIMEOUT)"

build-image:
	docker build $(DOCKER_NO_CACHE_FLAG) -t "$(IMAGE)" .

kind-load:
	kind load docker-image "$(IMAGE)" --name "$(CLUSTER_NAME)"

refresh-kind-image: build-image kind-load

deploy-debug:
	$(MAKE) refresh-kind-image \
		IMAGE="$(REPO_IMAGE):$(DEBUG_TAG)" \
		CLUSTER_NAME="$(CLUSTER_NAME)" \
		NO_CACHE=1
	kubectl -n "$(NAMESPACE)" set image \
		"deployment/$(DEPLOYMENT)" \
		"$(CONTAINER)=$(REPO_IMAGE):$(DEBUG_TAG)"
	kubectl -n "$(NAMESPACE)" rollout status \
		"deployment/$(DEPLOYMENT)" \
		--timeout="$(ROLLOUT_TIMEOUT)"

deploy-kind:
	./hack/deploy-kind.sh \
		--image "$(IMAGE)" \
		--kind-name "$(CLUSTER_NAME)" \
		--namespace "$(NAMESPACE)" \
		--deployment "$(DEPLOYMENT)" \
		--container "$(CONTAINER)" \
		--rollout-timeout "$(ROLLOUT_TIMEOUT)"

deploy-kind-fast:
	./hack/deploy-kind.sh \
		--image "$(IMAGE)" \
		--kind-name "$(CLUSTER_NAME)" \
		--namespace "$(NAMESPACE)" \
		--deployment "$(DEPLOYMENT)" \
		--container "$(CONTAINER)" \
		--rollout-timeout "$(ROLLOUT_TIMEOUT)" \
		--skip-build \
		--skip-load
