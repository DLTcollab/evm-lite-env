EVM_LITE_VERSION=0.1.0
GIT_COMMIT=$(shell git rev-parse --short HEAD)

all: docker
	
docker:
	go build \
		--ldflags '-extldflags "-static"' \
		-o ./docker/evml ../go-package/src/github.com/mosaicnetworks/evm-lite/cmd/evml/ 
	docker build -t mosaicnetworks/evm-lite:$(EVM_LITE_VERSION) \
		-t mosaicnetworks/evm-lite:latest \
		./docker/

.PHONY: all docker